package captcha

import (
	"context"
	"fmt"
	"net/http"

	"github.com/MicahParks/recaptcha"
	"github.com/girlguidingstaplehurst/district/internal/rest"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

var _ rest.CaptchaVerifier = (*Verifier)(nil)

type Verifier struct {
	cli   recaptcha.VerifierV3
	armed bool
}

func NewVerifier(secret string, armed bool) *Verifier {
	return &Verifier{
		cli: recaptcha.NewVerifierV3(secret, recaptcha.VerifierV3Options{
			HTTPClient: &http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)},
		}),
		armed: armed,
	}
}

func (v *Verifier) Verify(ctx context.Context, token string, ip string) error {
	span := trace.SpanFromContext(ctx)
	span.SetAttributes(attribute.String("recaptcha.token", token), attribute.String("recaptcha.ip", ip))

	resp, err := v.cli.Verify(ctx, token, ip)
	if err != nil {
		return err
	}

	if !resp.Success && v.armed {
		return fmt.Errorf("captcha verification failed: %q", resp.ErrorCodes)
	}

	return nil
}
