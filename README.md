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
