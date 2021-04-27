# Dashboard for gorse recommender system

[![build](https://github.com/gorse-io/dashboard/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gorse-io/dashboard/actions/workflows/build.yml)

An admin dashboard for gorse recommender system derived from [shards-dashboard-vue](https://github.com/DesignRevision/shards-dashboard-vue).

![](https://raw.githubusercontent.com/gorse-io/dashboard/master/assets/preview.png)

## Quick Start

- Install dependencies by running `yarn`.
- Run `yarn serve` to start the local development server.
- Run `yarn build` to build go embed files.

## Usage

Install the package.

```bash
go get -u github.com/gorse-io/dashboard@statik
```

Import and serve.

```go
import (
  "github.com/rakyll/statik/fs"
  
  _ "github.com/gorse-io/dashboard"
)

  // ...

  statikFS, err := fs.New()
  if err != nil {
    log.Fatal(err)
  }
  
  // Serve the contents over HTTP.
  http.Handle("/", http.FileServer(statikFS))
  http.ListenAndServe(":8080", nil)
```
