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

## What the tests cover

Each DSL construct has its own `describe` block in the parser tests:
components, links, evolution, pipelines, annotations, notes, inertia,
decorators, attitudes, accelerators, comments, submaps, and custom
evolution labels.  Edge cases cover empty input, missing coordinates,
and empty pipelines.

The renderer tests produce 25 golden-file snapshots — five
representative examples across all five themes — plus targeted unit
tests for coordinate geometry, pipeline layout, evolution links, and
theme resolution.

CLI tests shell out to `dist/cli.js` and verify the full pipeline
end to end.  They require `npm run build` first and do not rebuild
automatically — this keeps `npm test` fast during development.

The verbose reporter (`npm test -- --reporter=verbose`) describes what
the software is supposed to do.  The tests also pass (at the time of
writing):

```
maturityToX
  places genesis at the left edge, where all things begin
  places commodity at the right edge, where all things converge
  places mid-evolution at the canvas midpoint
  scales to custom canvas dimensions
visibilityToY
  places high-visibility components at the top
  places invisible components at the bottom
  places mid-chain components at the canvas midpoint
  inverts correctly — higher visibility means lower Y
esc
  escapes ampersands
  escapes angle brackets
  escapes double quotes
  escapes apostrophes
  leaves clean strings unmolested
  escapes multiple special characters in one string
resolveComponentPosition
  finds a component by name
  returns evolved position when present
  prefers evolved map over components
  returns null for names that were never requisitioned

parser
  title
    extracts the map title
    defaults to Untitled Map when none given
  components
    positions a component on the value chain by visibility and maturity
  labels
    applies custom label positioning offsets
  anchors
    positions a value chain anchor
  links
    traces a dependency between components in the value chain
    annotates a dependency with operational context
    distinguishes material flow from structural dependency
  evolution
    projects a component toward a target maturity
    transforms a component identity through evolution
  pipelines
    groups component variants within a pipeline
    derives pipeline extent from the maturity spread of its children
  annotations
    extracts numbered annotations with text
    supports annotations pointing to multiple locations
  notes
    positions a note on the map
  inertia
    flags a component as resisting evolutionary pressure
    accepts parenthesized inertia syntax
  decorators
    marks a component for buy sourcing
    marks a component for build sourcing
    marks a component for outsource sourcing
  attitudes
    identifies pioneer, settler, and townplanner regions
  accelerators
    identifies forces that accelerate evolution
    identifies forces that resist evolution
  comments
    redacts single-line comments before parsing
    redacts block comments before parsing
  submaps
    links a submap to an external URL
  custom evolution labels
    customises the evolution axis labels
  edge cases
    produces an empty map from blank input
    defaults unpositioned components (sketch-in-progress)
    preserves dangling links when components vanish mid-edit
    tolerates empty pipelines during map construction

renderer golden-file snapshots
  lair-canteen.owm
    renders with plain theme
    renders with handwritten theme
    renders with wardley theme
    renders with dark theme
    renders with colour theme
  comprehensive.owm
    renders with plain theme
    renders with handwritten theme
    renders with wardley theme
    renders with dark theme
    renders with colour theme
  pipeline.owm
    renders with plain theme
    renders with handwritten theme
    renders with wardley theme
    renders with dark theme
    renders with colour theme
  links-and-flows.owm
    renders with plain theme
    renders with handwritten theme
    renders with wardley theme
    renders with dark theme
    renders with colour theme
  minimal.owm
    renders with plain theme
    renders with handwritten theme
    renders with wardley theme
    renders with dark theme
    renders with colour theme
renderer units
  pipeline geometry
    positions pipeline rectangle from child maturity boundaries
  evolution link
    traces evolution as a dashed arrow across the maturity axis
    constrains evolution to horizontal movement — visibility is conserved
  annotation box
    sizes annotation box to fit all entries
    marks annotation positions with numbered circles
    lists annotation text in the annotation box
  component shapes
    draws standard components as circles
    draws pipeline members as rectangles
  inertia
    manifests inertia as a heavy vertical bar
    centers the inertia bar on the component position
  theme resolution
    overrides the map style with the options style
    prefers an explicit theme object over a style name
  SVG structure
    wraps output in a valid SVG root element
    defines reusable markers in SVG defs
    renders the map title
  edge cases
    renders a blank map without crashing
    renders gracefully when links reference vanished components

CLI
  renders an OWM file to SVG on stdout
  reads OWM from stdin when no file is given
  applies a theme via the --style flag
```

## Maintaining snapshots

When you intentionally change renderer output:

    npm test -- -u

Review the diff before committing.  Snapshot files live in
`src/__tests__/__snapshots__/`.

When adding a new DSL feature, add a corresponding semantic test
in `parser.test.ts`.

## See also

The example `.owm` files are part of a gallery at `examples/index.html`.
