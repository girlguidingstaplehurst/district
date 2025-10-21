package booking

import (
	"embed"
)

//go:generate npm run build

//go:embed build/*
var Files embed.FS

//go:embed build/index.html
var IndexHTML embed.FS
