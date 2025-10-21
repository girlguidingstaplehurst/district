//go:build mage

package main

import (
	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

func CreateMigration(name string) error {
	//TODO use go tool version
	return sh.RunV("migrate", "create", "-dir", "db/migrations", "-ext", "sql", "-seq", name)
}

// Generate runs all codegen
func Generate() {
	mg.Deps(GoGen)
}

// GoGen generates with Go tooling
func GoGen() error {
	return sh.RunV("go", "generate", "./...")
}

// Run launches the service
func Run() error {
	return sh.RunV("go", "run", "cmd/district/main.go")
}

// Dev launches the service using the local kubernetes config
func Dev() error {
	return sh.RunV("skaffold", "dev")
}
