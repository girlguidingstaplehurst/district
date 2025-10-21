package service

import (
	"context"
	"errors"
	"net/http"
	"os"

	"github.com/exaring/otelpgx"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/girlguidingstaplehurst/district"
	dbmigrations "github.com/girlguidingstaplehurst/district/db"
	"github.com/girlguidingstaplehurst/district/internal/captcha"
	"github.com/girlguidingstaplehurst/district/internal/config"
	"github.com/girlguidingstaplehurst/district/internal/content"
	"github.com/girlguidingstaplehurst/district/internal/email"
	"github.com/girlguidingstaplehurst/district/internal/pdf"
	"github.com/girlguidingstaplehurst/district/internal/postgres"
	"github.com/girlguidingstaplehurst/district/internal/rest"
	"github.com/gofiber/contrib/otelfiber"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/jackc/pgx/v5/pgxpool"
	fibermiddleware "github.com/oapi-codegen/fiber-middleware"
)

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Run(ctx context.Context) error {
	svcCfg := new(config.Config)

	if err := config.Load(svcCfg); err != nil {
		return err
	}

	//TODO set up config struct
	if _, ok := os.LookupEnv("OTEL_SERVICE_NAME"); ok {
		// Set up OpenTelemetry.
		otelShutdown, err := setupOTelSDK(ctx)
		if err != nil {
			return err
		}
		// Handle shutdown properly so nothing leaks.
		defer func() {
			err = errors.Join(err, otelShutdown(context.Background()))
		}()
	}

	if err := dbmigrations.Migrate(); err != nil {
		return err
	}

	app := fiber.New(fiber.Config{
		ProxyHeader: "X-Forwarded-For",
	})

	app.Use(otelfiber.Middleware())

	app.Use("/", filesystem.New(filesystem.Config{
		Root:       http.FS(booking.Files),
		PathPrefix: "/build",
	}))

	htmlPaths := []string{"/add-event", "/privacy-policy", "/terms-of-hire", "/cleaning-and-damage-policy", "/booking",
		"/about", "/whats-on", "/location", "/admin", "/admin/login", "/admin/review/:eventID"}
	app.Use(htmlPaths, func(c *fiber.Ctx) error {
		return filesystem.SendFile(c, http.FS(booking.IndexHTML), "/build/index.html")
	})

	swagger, err := rest.GetSwagger()
	if err != nil {
		return err
	}

	app.Use(fibermiddleware.OapiRequestValidatorWithOptions(swagger, &fibermiddleware.Options{
		Options: openapi3filter.Options{AuthenticationFunc: openapi3filter.NoopAuthenticationFunc},
	}))

	ipExtractor := rest.NewIPExtractor()
	app.Use(ipExtractor.Extract)

	jwtAuth := rest.NewJWTAuthenticator(os.Getenv("GOOGLE_CLIENT_ID"), "kathielambcentre.org", "staplehurstguiding.org.uk") //TODO externalize
	app.Use("/api/v1/admin", jwtAuth.Validate)

	cfg, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}

	cfg.ConnConfig.Tracer = otelpgx.NewTracer(otelpgx.WithIncludeQueryParameters())

	dbpool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return err
	}
	defer dbpool.Close()

	captchaArmed := true
	if env := os.Getenv("CAPTCHA_ARMED"); env == "false" {
		captchaArmed = false
	}

	db := postgres.NewDatabase(dbpool)
	contentManager := content.NewManager("https://graphql.contentful.com/content/v1/spaces/o3u1j7dkyy42", "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14")
	pdfGen := pdf.NewGenerator(contentManager)
	emailSender := email.NewSender(os.Getenv("SMTP_SERVER"), os.Getenv("SMTP_USERNAME"), os.Getenv("SMTP_PASSWORD"))
	captchaVerifier := captcha.NewVerifier(os.Getenv("GOOGLE_RECAPTCHA_SECRET"), captchaArmed)
	rs := rest.NewServer(db, pdfGen, emailSender, captchaVerifier, contentManager)
	rest.RegisterHandlers(app, rest.NewStrictHandler(rs, nil))

	return app.Listen(":8080")
}
