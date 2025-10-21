package content

import (
	"context"
	"log/slog"
	"testing"

	"github.com/stretchr/testify/require"
)

func Test(t *testing.T) {
	m := NewManager("https://graphql.contentful.com/content/v1/spaces/o3u1j7dkyy42", "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14")

	email, err := m.Page(context.Background(), "terms-of-hire")
	require.NoError(t, err)

	slog.Info("dumping email", "email", email)
}
