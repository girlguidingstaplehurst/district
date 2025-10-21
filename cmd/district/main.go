package main

import (
	"context"
	"log/slog"

	"github.com/girlguidingstaplehurst/district/internal/service"
)

func main() {
	svc := service.NewService()

	err := svc.Run(context.Background())
	if err != nil {
		slog.Error("error running service", "err", err)
	}
}
