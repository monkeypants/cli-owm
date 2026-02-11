# Testing

## Running tests

    npm run build && npm test    # build first (required for CLI tests)
    npm run test:watch           # watch mode (skip CLI tests if not built)
    npm test -- -u               # update snapshots

## Test structure

Files are listed in suggested reading order — coordinate maths first,
then DSL vocabulary, then SVG output, then integration.

    src/__tests__/
      render-utils.test.ts  Coordinate math, XML escaping, component resolution
      parser.test.ts        Targeted semantic assertions for every DSL construct
      render.test.ts        SVG output snapshots and renderer units
      cli.test.ts           CLI integration (requires build)

Test fixtures use the same vocabulary as the example maps — this
keeps the language consistent across tests and documentation.

## Parser tests

Targeted assertions cover each DSL construct independently: components,
links, evolution, pipelines, annotations, notes, inertia, decorators,
attitudes, accelerators, comments, submaps, and custom evolution labels.
Edge cases cover empty input, missing coordinates, and empty pipelines.

When adding a new DSL feature, add a corresponding semantic test.

## Renderer tests

Five representative examples rendered across all five themes produce
golden-file snapshots. Targeted tests verify coordinate geometry,
pipeline layout, evolution links, and theme resolution using hardcoded
expected values and element-specific regex matches.

## Updating snapshots

When you intentionally change renderer output:

    npm test -- -u

Review the diff before committing. Snapshot files live in
`src/__tests__/__snapshots__/`.

## CLI tests

CLI tests shell out to `dist/cli.js` and require `npm run build` first.
They do not rebuild automatically — this keeps `npm test` fast during
development when you're only changing test code or library source.

## See also

The example files used by the test suite are part of a larger teaching
gallery at `examples/index.html`.
