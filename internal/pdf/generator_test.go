package pdf_test

import (
	"context"
	"testing"

	"github.com/girlguidingstaplehurst/district/internal/consts"
	"github.com/girlguidingstaplehurst/district/internal/content"
	"github.com/girlguidingstaplehurst/district/internal/pdf"
	"github.com/girlguidingstaplehurst/district/internal/rest"
	"github.com/stretchr/testify/require"
	"github.com/thanhpk/randstr"
)

func TestGenerator_GenerateInvoice(t *testing.T) {
	g := pdf.Generator{}
	_, err := g.GenerateInvoice(context.Background(), &rest.Invoice{
		Reference: randstr.String(6, consts.ReferenceLetters),
		Items: []rest.InvoiceItem{
			{Description: "Now that's what I call a fake event - 5.0 Hours ", Cost: 125.00},
			{Description: "Discount", Cost: -25.00},
			{Description: "Refundable Deposit", Cost: 100.00},
		},
	})
	require.NoError(t, err)
}

func TestGenerator_GenerateContent(t *testing.T) {
	g := pdf.NewGenerator(content.NewManager("https://graphql.contentful.com/content/v1/spaces/o3u1j7dkyy42", "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14"))
	_, err := g.GeneratePageContent(context.Background(), "cleaning-and-damage-policy")
	require.NoError(t, err)
}
