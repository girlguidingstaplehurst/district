package test

//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen --config=client.config.yaml ../../api/public-api.yaml
//go:generate go tool buildergen --src=./client.gen.go --dst=./builder.gen.go --name NewEvent
