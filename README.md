# cli-owm

Render Wardley Maps from DSL text to SVG on the command line.

```
cli-owm examples/lair-canteen.owm -o lair-canteen.svg
cat map.owm | cli-owm > map.svg
```

## Installation

```
npm install
npm run build
```

The compiled CLI is at `dist/cli.js`. Link it globally with `npm link` if desired.

## Usage

```
cli-owm [options] [input-file]

Options:
  -o, --output <file>   Output SVG file (default: stdout)
  -s, --style <name>    Theme: plain, wardley, handwritten, dark, colour
  -w, --width <n>       Map width in pixels (default: 500)
  -H, --height <n>      Map height in pixels (default: 600)
  --help                Show help
  --version             Show version
```

If no input file is given, reads from stdin.

## Features

- Parses the same DSL used by [OnlineWardleyMaps](https://onlinewardleymaps.com)
- Five built-in themes: plain, wardley, handwritten, dark, colour
- Reads from files or stdin, writes to files or stdout
- No browser required -- pure Node.js
- Library API: `parse()` and `render()` for programmatic use

## Parser

The DSL parser is vendored from the
[onlinewardleymaps](https://github.com/damonsk/onlinewardleymaps) project
(MIT license, Copyright 2019 Damon Skelhorn). The only runtime dependency
is `lodash.merge`.

## License

MIT
