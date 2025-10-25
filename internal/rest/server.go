package rest

import (
	"context"
)

//go:generate go run go.uber.org/mock/mockgen -source server.go -destination mock/server.go

var _ StrictServerInterface = (*Server)(nil)

type Server struct {
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) ContactUs(ctx context.Context, request ContactUsRequestObject) (ContactUsResponseObject, error) {
	return ContactUs200Response{}, nil
}
