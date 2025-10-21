package config

import (
	_ "embed"
	"log/slog"
	"strings"

	"github.com/knadh/koanf"
	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/providers/rawbytes"
)

const (
	EnvPrefix = "BOOKING_"
)

//go:embed defaults.yaml
var DefaultCfg []byte

func Load(cfg any) error {
	k := koanf.New(".")

	// Load from embedded YAML string (defaults)
	if err := k.Load(rawbytes.Provider(DefaultCfg), yaml.Parser()); err != nil {
		return err
	}

	// Load from environment (specific overrides, last resort)
	if err := k.Load(env.Provider(EnvPrefix, ".", func(s string) string {
		return strings.ToLower(strings.Replace(strings.TrimPrefix(s, EnvPrefix), "_", ".", -1))
	}), nil); err != nil {
		slog.Error("error loading configuration from environment variable - continuing", "err", err)
	}

	// Unmarshal into supplied config struct
	if err := k.Unmarshal("", &cfg); err != nil {
		return err
	}

	return nil
}
