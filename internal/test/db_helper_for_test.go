package test

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func TruncateTables(tables ...string) error {
	db, err := pgx.Connect(context.Background(), "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		return err
	}

	for _, table := range tables {
		_, err = db.Exec(context.Background(), fmt.Sprintf(`TRUNCATE TABLE %s CASCADE`, table))
		if err != nil {
			return err
		}
	}

	return nil
}
