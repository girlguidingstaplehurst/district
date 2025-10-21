package content

import (
	"context"
	"strings"
	"text/template"
	"time"

	"github.com/girlguidingstaplehurst/district/internal/pdf"
	"github.com/girlguidingstaplehurst/district/internal/rest"
	"github.com/go-viper/mapstructure/v2"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/hasura/go-graphql-client"
	"golang.org/x/oauth2"
)

type Manager struct {
	client *graphql.Client
}

func NewManager(url, token string) *Manager {
	src := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	httpClient := oauth2.NewClient(context.Background(), src)

	return &Manager{
		client: graphql.NewClient(url, httpClient),
	}
}

func (m *Manager) Email(ctx context.Context, key string) (rest.EmailContent, error) {
	var q struct {
		EmailCollection struct {
			Items []struct {
				Subject graphql.String
				Body    graphql.String
			}
		} `graphql:"emailCollection(preview: false, limit: 1, where: { name: $name })"`
	}

	err := m.client.Query(ctx, &q, map[string]any{"name": graphql.String(key)})
	if err != nil {
		return rest.EmailContent{}, err
	}

	i := q.EmailCollection.Items[0]

	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	mdParser := parser.NewWithExtensions(extensions)

	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	htmlRenderer := html.NewRenderer(opts)

	mdBody := strings.Replace(string(i.Body), "\\n", "\n", -1)
	doc := mdParser.Parse([]byte(mdBody))
	htmlBody := markdown.Render(doc, htmlRenderer)

	return rest.EmailContent{
		Subject: string(i.Subject),
		Body:    string(htmlBody),
	}, nil
}

func (m *Manager) EmailTemplate(ctx context.Context, key string, vars map[string]any) (rest.EmailContent, error) {
	emailTemplate, err := m.Email(ctx, key)
	if err != nil {
		return rest.EmailContent{}, err
	}

	subject, err := m.applyTemplate(emailTemplate.Subject, vars)
	if err != nil {
		return rest.EmailContent{}, err
	}

	body, err := m.applyTemplate(emailTemplate.Body, vars)
	if err != nil {
		return rest.EmailContent{}, err
	}

	return rest.EmailContent{
		Subject: subject,
		Body:    body,
	}, nil
}

func (m *Manager) applyTemplate(body string, vars map[string]any) (string, error) {
	tpl, err := template.New("tpl").Parse(body)
	if err != nil {
		return "", err
	}

	w := strings.Builder{}
	err = tpl.Execute(&w, vars)
	if err != nil {
		return "", err
	}

	return w.String(), nil
}

func (m *Manager) Page(ctx context.Context, key string) (pdf.PageContent, error) {
	var q struct {
		KLGCPageCollection struct {
			Items []struct {
				Sys struct {
					PublishedAt graphql.String
				}
				Heading     graphql.String
				RichContent struct {
					JSON map[string]any `scalar:"true"`
				}
			}
		} `graphql:"klgcPageCollection(preview: false, limit: 1, where: { name: $name })"`
	}

	err := m.client.Query(ctx, &q, map[string]any{"name": graphql.String(key)})
	if err != nil {
		return pdf.PageContent{}, err
	}

	i := q.KLGCPageCollection.Items[0]

	var body pdf.RichTextContent
	err = mapstructure.Decode(i.RichContent.JSON, &body)
	if err != nil {
		return pdf.PageContent{}, err
	}

	lastUpdated, err := time.Parse(time.RFC3339, string(i.Sys.PublishedAt))
	if err != nil {
		return pdf.PageContent{}, err
	}

	return pdf.PageContent{
		LastUpdated: lastUpdated,
		Heading:     string(i.Heading),
		Body:        body,
	}, nil
}
