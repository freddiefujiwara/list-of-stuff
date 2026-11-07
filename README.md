# A Minimalist's List of Stuff

[![Node.js CI](https://github.com/freddiefujiwara/list-of-stuff-admin/actions/workflows/node.js.yml/badge.svg)](https://github.com/freddiefujiwara/list-of-stuff-admin/actions/workflows/node.js.yml)

[Live Demo](https://freddiefujiwara.com/list-of-stuff-admin/)

This is the private admin site for a minimalist's list of belongings.
It manages the hand-edited item sheets (workman, variety, others) of
the "List of stuff" spreadsheet; the public list itself is published
as a blog article. The room sheet is rewritten by the Rakuten ROOM
sync and is not editable here.

## Features

-   List, create, edit and delete items per sheet.
-   Google sign-in restricted to the owner's account, plus temporary
    access links (one month) issued by the owner, the same scheme as
    the alarm, health and tweet admin sites.
-   Writes go through the list-of-stuff-gas admin API (doPost), which
    verifies the ID token or share token before touching the sheet.

## Tech Stack

-   [Vue.js 3](https://vuejs.org/)
-   [Vite](https://vitejs.dev/)
-   [Vitest](https://vitest.dev/)

## Commands

### Setup

Installs the project's dependencies.

```bash
npm install
```

### Development

Starts the local development server.

```bash
npm run serve
```

### Testing

Runs the unit tests using Vitest.

```bash
npm test
```

Generates a test coverage report. 100% coverage is required.

```bash
npm run coverage
```

### Build

Builds the project for production. The output files will be in the `dist` directory.

```bash
npm run build
```
