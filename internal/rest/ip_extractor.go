package rest

import (
	"context"

	"github.com/gofiber/fiber/v2"
)

type IPExtractor struct{}

func NewIPExtractor() *IPExtractor {
	return &IPExtractor{}
}

type UserIPKey struct{}

func (a *IPExtractor) Extract(ctx *fiber.Ctx) error {
	ip := ctx.IP()

	userCtx := ctx.UserContext()
	userCtx = context.WithValue(userCtx, UserIPKey{}, ip)
	ctx.SetUserContext(userCtx)

	return ctx.Next()
}

func UserIPFromContext(ctx context.Context) (string, bool) {
	e, ok := ctx.Value(UserIPKey{}).(string)
	return e, ok
}
