package email

import (
	"context"
	"io"

	"github.com/girlguidingstaplehurst/district/internal/rest"
	"gopkg.in/gomail.v2"
)

var _ rest.EmailSender = (*Sender)(nil)

type Sender struct {
	smtpServer   string
	smtpUsername string
	smtpPassword string
}

func NewSender(server, username, password string) *Sender {
	return &Sender{
		smtpServer:   server,
		smtpUsername: username,
		smtpPassword: password,
	}
}

func (s *Sender) Send(ctx context.Context, to string, subject string, body string, attachments ...rest.EmailAttachment) error {
	return s.SendWithAttachments(ctx, to, subject, body)
}

func (s *Sender) SendWithAttachments(ctx context.Context, to string, subject string, body string, attachments ...rest.EmailAttachment) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "bookings@kathielambcentre.org")
	m.SetHeader("To", to)
	m.SetAddressHeader("Bcc", "bookings@kathielambcentre.org", "KLGC Bookings")
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	for _, attachment := range attachments {
		m.Attach(attachment.Filename, gomail.SetCopyFunc(func(w io.Writer) error {
			_, err := io.Copy(w, attachment.Content)
			if err != nil {
				return err
			}
			return nil
		}),
			gomail.SetHeader(map[string][]string{"Content-Type": {attachment.Mimetype}}))
	}

	d := gomail.Dialer{
		Host:     s.smtpServer,
		Port:     587,
		Username: s.smtpUsername,
		Password: s.smtpPassword,
	}

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
