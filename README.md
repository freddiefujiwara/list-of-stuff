# ミニマリストの持ち物一覧 (A Minimalist's List of Stuff)

[![Node.js CI](https://github.com/freddiefujiwara/list-of-stuff/actions/workflows/node.js.yml/badge.svg)](https://github.com/freddiefujiwara/list-of-stuff/actions/workflows/node.js.yml)

[Live Demo](https://freddiefujiwara.com/list-of-stuff/)

これは、ミニマリストの持ち物を一覧表示するウェブサイトです。

## Features

-   持ち物の一覧表示
-   ジャンルによる絞り込み表示

## Tech Stack

-   [Vue.js 3](https://vuejs.org/)
-   [Vite](https://vitejs.dev/)
-   [Vitest](https://vitest.dev/)

## Commands

### Setup

プロジェクトの依存関係をインストールします。

```bash
npm install
```

### Development

開発用のローカルサーバーを起動します。

```bash
npm run serve
```

### Testing

Vitest を使用してユニットテストを実行します。

```bash
npm test
```

テストカバレッジのレポートを生成します。カバレッジは 100% である必要があります。

```bash
npm run coverage
```

### Build

本番用にプロジェクトをビルドします。成果物は `dist` ディレクトリに出力されます。

```bash
npm run build
```
