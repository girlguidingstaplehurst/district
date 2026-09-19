package service

import (
	"context"
	"errors"
	"net/http"
	"os"

	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/girlguidingstaplehurst/district"
	"github.com/girlguidingstaplehurst/district/internal/config"
	"github.com/girlguidingstaplehurst/district/internal/rest"
	"github.com/gofiber/contrib/otelfiber"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
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

	app := fiber.New(fiber.Config{
		ProxyHeader: "X-Forwarded-For",
	})

	app.Use(otelfiber.Middleware())

	app.Use("/", filesystem.New(filesystem.Config{
		Root:       http.FS(booking.Files),
		PathPrefix: "/build",
	}))

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

	rs := rest.NewServer()
	rest.RegisterHandlers(app, rest.NewStrictHandler(rs, nil))

	// API and assets are registered above; remaining browser GET/HEAD requests
	// are client-side routes and must receive the React application shell.
	app.Use(func(c *fiber.Ctx) error {
		if c.Method() != fiber.MethodGet && c.Method() != fiber.MethodHead {
			return c.Next()
		}
		return filesystem.SendFile(c, http.FS(booking.IndexHTML), "/build/index.html")
	})

	return app.Listen(":8080")
}
