![Cover](https://imagedelivery.net/Dr98IMl5gQ9tPkFM5JRcng/afca3dd9-65b1-4fc0-97ef-4002071e8a00/Ultra)

# Smartsheet TypeScript SDK (Monorepo)

## Package Documentation

Visit [the package README](./packages/smartsheet-typescript/README.md) for more information.

## Development Roadmap

- [x] Base architecture for end-to-end type-safety SDK
- [x] Smartsheet API Authentication and fetcher
- [x] Basic verification test of sheets, columns, rows, and cells execution
- [x] Sheets
- [x] Columns
- [x] Rows
  - [x] Cells
  - [x] Cell types
  - [x] Cell formats
- [x] Schema definition support and type hints
- [ ] Attachments
- [ ] Importing and Exporting
- [x] Arbitrary error handling
- [ ] Complex structure verification (TBD)

## Development Guide

### 1. Install dependencies

```bash
bun install
# or
npm install
# or
yarn install
# or
pnpm install
```

[Bun runtime](https://bun.sh/) is recommended for the development of this package.

### 2. Set up environment variables for local development

```bash
cp .env.example .env
```

### 3. Run the example script defined in `./example/index.ts`

```bash
bun dev
```

## Versioning

We are using [SemVer](https://semver.org/) for versioning. In addition to that, we have added `dev` tag for the development version, such as `1.0.0-dev.1`.

As a contributor, you can consider using `bun version dev` to bump up the development version when needed. This version will not be released to the public.

When it is ready to be finalized, you can use `bun version <major|minor|patch>` to bump up the version to the next stable version with proper change size.
