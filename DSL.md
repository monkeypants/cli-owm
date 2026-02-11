# The OWM Domain-Specific Language

A reference for the [Online Wardley Maps](https://onlinewardleymaps.com)
domain-specific language, the de facto standard text format for Wardley Maps.
Covers the complete language as documented at
[docs.onlinewardleymaps.com](https://docs.onlinewardleymaps.com) and
implemented in the
[reference parser](https://github.com/damonsk/onlinewardleymaps).

File extension: `.owm`

Good evening.


## The coordinate system

Every positioned element takes coordinates as **`[visibility, maturity]`**.
Note carefully that this is `[Y, X]`, not `[X, Y]`.  One might reasonably
expect the horizontal axis first.  One would be wrong.

| Axis | Name | Direction | Range |
|------|------|-----------|-------|
| Y (first value) | **Visibility** | 0 = bottom, 1 = top | 0.0–1.0 |
| X (second value) | **Maturity / Evolution** | 0 = left (Genesis), 1 = right (Commodity) | 0.0–1.0 |

Higher-visibility components sit near the top of the map, close to the user.
Lower-visibility components are further down the value chain — the
infrastructure upon which everything rests, quietly and without thanks.

Components evolve left-to-right: from novel and uncertain toward
industrialised and well-understood.

When coordinates are omitted the parser defaults to visibility 0.9,
maturity 0.1 — the top-left corner, where unpositioned things gather
like guests who arrived early and don't know where to sit.


## Comments

```
// single-line comment (stripped before parsing)
/* multi-line
   block comment */
component Volcanic Cauldron [0.35, 0.18] // inline comment
```

Lines beginning with `url` are exempt from `//` stripping so that
`https://` survives intact.


## Map metadata

### title

```
title Henchman Canteen Value Chain
```

Sets the map heading.  One per map.  Default: `Untitled Map`.

### style

```
style wardley
```

Switches the visual theme.  Recognised values: `plain` (default),
`wardley`, `handwritten`, `colour`, `dark`.

One selects a theme to suit the occasion.  `handwritten` for early
hypotheses.  `dark` for decommissioning reviews.  `wardley` for the
canonical presentation.  `colour` when the circular dependencies need
to be visible.  `plain` for the sort of diagram that ends up in
HR Form HR-7734.

### size

```
size [1024, 768]
```

Overrides the default canvas dimensions.  Values are **pixels**
(`[width, height]`), not the 0–1 coordinate space.  Default: 500 × 600.

### evolution (axis labels)

```
evolution Genesis->Custom->Product->Commodity
```

Customises the four evolution-stage labels on the X axis.  The standard
variants:

| Domain | Labels |
|--------|--------|
| Activities (default) | `Genesis -> Custom-Built -> Product (+rental) -> Commodity (+utility)` |
| Practices | `Novel -> Emerging -> Good -> Best` |
| Data | `Unmodelled -> Divergent -> Convergent -> Modelled` |
| Knowledge | `Concept -> Hypothesis -> Theory -> Accepted` |

Labels can contain spaces and emoji.


## Anchors

```
anchor Shipping Line [0.97, 0.63]
anchor Supreme Leader [0.95, 0.25]
anchor Maritime Regulator [0.92, 0.78]
```

The anchor is the starting point of the value chain — the user,
customer, or stakeholder whose need gives the map its reason to exist.
A map without an anchor is a technology looking for a problem.

A map typically has one or more anchors placed at high visibility.
All other components ultimately exist to satisfy an anchor.  Multiple
anchors reveal the political forces that shape every technical decision.

Empty brackets are allowed: `anchor Foo []` (uses default coordinates).


## Components

```
component Minestrone [0.79, 0.61]
component Volcanic Cauldron [0.35, 0.18] label [-57, 4]
```

A component is any situation-relevant element on the map: an activity,
practice, data asset, or piece of knowledge.  The two coordinates place
it in the value chain (visibility) and on the evolution axis (maturity).

Names may contain spaces and most punctuation.

### Label positioning

`label [x, y]` sets a **pixel offset** from the component's rendered
position — these are not 0–1 map coordinates.  Default offset:
`{x: 5, y: -10}`.  When a decorator like `(buy)` is present the
default shifts to `{x: 10, y: -20}` to avoid overlap.


## Evolution (evolve)

```
evolve Volcanic Cauldron 0.8
evolve Kite Prototype->Production Kite 0.62
evolve Kite Prototype->Production Kite 0.62 label [16, 5]
```

`evolve` declares that a component is expected to move to a new maturity
position.  It takes only an **X-axis (maturity) target**; the Y position
is inherited from the original component.  The renderer draws the
original component at its defined position and an arrow pointing right
to the evolved position.

With the `->NewName` form, the evolved position gets a new label,
representing transformation.  A Kite Prototype becomes a Production Kite.
A Volcanic Cauldron becomes a Geothermal Tap.  The nomenclature changes
because the thing itself has changed.

The original component is not removed — `evolve` adds an overlay showing
intended movement, not a replacement.  Default target maturity when
omitted: 0.85.

Evolve accepts decorators and label offsets:

```
evolve Kite Prototype->Production Kite 0.62 (buy) label [16, 5]
```


## Inertia

```
component Bunker Fuel Propulsion [0.68, 0.34] inertia
component Bunker Fuel Propulsion [0.68, 0.34] (inertia)
```

Both keyword and parenthesised forms are equivalent.  Inertia marks a
component as resistant to change — it will be visually distinguished,
typically as a thick vertical bar.

Inertia is strategically significant when paired with `evolve`: the
combination says "this should move, but something is resisting."
Decades of investment in port bunkering infrastructure, for instance.


## Links and flows

Links represent dependencies in the value chain.  A component higher on
the map depends on a component lower down.

### Dependency links

```
Henchmen->Minestrone
Henchmen->Minestrone; classified recipe
```

`->` is a structural dependency.  Text after `;` is rendered as a
context annotation on the link.

### Flow links

```
Lava Vents+>Volcanic Cauldron
Hydrogen+<Service Ship
VLK Unit+<>Service Ship
Traction+'$0.10/nm'>Shipping Line
```

Flow links (`+>`, `+<`, `+<>`) carry directional semantics: data flow,
money flow, hydrogen flow, or information flow — as distinct from mere
structural dependency.  The quoted label in `+'label'>` is rendered on
the flow arrow.

Any link variant accepts a `; context` suffix.

Component names in links are matched by exact string (trimmed).

### Link operators

| Operator | Meaning |
|----------|---------|
| `->` | Structural dependency |
| `+>` | Forward flow |
| `+<` | Reverse flow |
| `+<>` | Bidirectional flow |
| `+'label'>` | Labelled forward flow |
| `+'label'<` | Labelled reverse flow |
| `+'label'<>` | Labelled bidirectional flow |
| `; text` | Context annotation (suffix on any link) |


## Pipelines

A pipeline groups related components that span a range of the evolution
axis.  One capability, multiple maturities.

### Current syntax (nested block)

```
component Kite Fleet [0.55, 0.50]
pipeline Kite Fleet
{
  component Prototype Kite [0.25]
  component Production Kite [0.55]
  component Mega Kite [0.78]
}
```

The `pipeline` keyword references a parent component by name.
Components inside `{ }` only specify a **single value** — their
maturity.  They inherit their visibility from the parent.  The
pipeline's horizontal extent is auto-calculated from the min/max
maturity of its children.

### Legacy syntax

```
pipeline Payment [0.15, 0.9]
```

The two values define the start and end of the pipeline on the evolution
axis.  Still supported but the nested syntax gives more control.

A pipeline declared without coordinates (`pipeline Foo`) defaults to
maturity range 0.2–0.8 and is hidden until coordinates or children are
supplied.


## Build, Buy, Outsource

Execution strategy decorators indicate how a component will be delivered.

### As decorators

```
component Hydrogen Envelope [0.60, 0.20] (build)
component Avionics [0.50, 0.55] (buy)
component Cloud Hosting [0.30, 0.82] (outsource)
```

The principle is straightforward.  Genesis means build — no alternative
exists.  Product means buy — a competitive market exists.  Commodity
means outsource — it's a utility.  If sourcing doesn't match evolution,
someone is either overspending or underinvesting.

### As standalone commands

```
build Hydrogen Envelope
buy Avionics
outsource Cloud Hosting
```

The standalone form applies the strategy to an existing component by
name.

### On evolve

```
evolve Control Software 0.5 (buy)
```

Decorators automatically increase label spacing to avoid overlap.


## Market and Ecosystem

### Market

```
market Maritime Traction [0.9, 0.5]
component Fuel Alternatives [0.32, 0.65] (market)
```

A market represents a competitive environment — where commoditisation,
competition, and pricing dynamics play out.  Available as a standalone
keyword or as a `(market)` decorator on a component.

### Ecosystem

```
component Shipping Industry [0.50, 0.50] (ecosystem)
```

An ecosystem is broader than a market: it represents an interconnected
system of actors, components, and markets that co-evolve and influence
each other.

Both can combine with execution strategy decorators:

```
component Cloud [0.30, 0.70] (market, outsource)
```

The standalone `market` keyword also accepts `inertia`:

```
market Legacy Fuel Market [0.40, 0.40] inertia
```


## Notes

```
note +wind energy is free [0.9, 0.5]
note Pioneers [0.91, 0.85]
```

Free-form text placed at arbitrary coordinates.  Useful for context,
assumptions, or labelling regions of the map.

The `+` prefix is conventional for the single most important
forward-looking observation on the map — the thing the team believes
but hasn't yet proved.  The parser assigns it no special semantics;
the convention is purely human.


## Annotations

```
annotation 1 [[0.43,0.49],[0.08,0.79]] Commoditising heat frees the kitchen to focus on the recipe
annotation 2 [0.48, 0.85] Hydrogen cycle is a closed loop
annotations [0.72, 0.03]
```

Numbered callouts placed at one or more map positions.  The number is
rendered as a circled marker at each coordinate pair; the text appears
in an annotation legend.

- `annotation N [y, x] text` — single location.
- `annotation N [[y1,x1],[y2,x2]] text` — multiple locations for the
  same callout.
- `annotations [y, x]` (plural, no number) — positions the annotation
  legend box itself.

The singular `annotation` and plural `annotations` keywords are
completely different constructs.  This is not ideal, but there it is.


## Submaps and URLs

```
submap VLK Programme [0.83, 0.50] url(vlkUrl)
url vlkUrl [https://onlinewardleymaps.com/#clone:qu4VDDQryoZEnuw0ZZ]
submap Fleet Operations [0.60, 0.31] label [-15, 30]
```

A submap links a component to another Wardley Map, allowing large
landscapes to be decomposed into navigable pieces.  The `url(name)`
reference points to a named `url` definition elsewhere in the file.

`url` lines are exempt from `//` comment stripping so that `https://`
URLs are preserved.


## Pioneers, Settlers, and Town Planners

```
pioneers [0.95, 0.83] 120 30
settlers [0.88, 0.83] 120 30
townplanners [0.81, 0.83] 120 30
```

Rectangular overlays representing organisational roles from Simon
Wardley's PST model:

- **Pioneers** explore the unknown and create new things.  They thrive
  on uncertainty.  Put them on flying sailboat research.
- **Settlers** take prototypes and turn them into products.  They
  thrive on refinement.  Put them on fleet deployment.
- **Town Planners** industrialise and scale.  They thrive on
  efficiency.  Put them on hydrogen commodity supply.

Do not put Town Planners on flying sailboat research.  They will want
requirements that don't exist yet.

| Form | Syntax | Meaning |
|------|--------|---------|
| Position + size | `pioneers [y, x] width height` | Place at `[y, x]` with pixel `width` and `height` |
| Bounding box | `pioneers [y1, x1, y2, x2]` | Define a rectangular region in map coordinates |


## Accelerators and Deaccelerators

```
accelerator carbon_levy [0.15, 0.90]
deaccelerator maritime_regulation [0.65, 0.35]
```

Mark forces that speed up or slow down evolutionary change at a given
map location.  Rising fuel costs accelerate the transition to wind
traction.  Maritime regulation inertia decelerates it.  Strategy is
partly about choosing which forces to amplify and which to resist.


## Complete keyword reference

Every line is classified by its leading keyword.  Anything that does not
match a keyword and is not blank is parsed as a link.

| Keyword | Purpose |
|---------|---------|
| `title` | Map heading |
| `evolution` | X-axis stage labels |
| `style` | Visual theme |
| `size` | Canvas dimensions (pixels) |
| `anchor` | Value-chain starting point |
| `component` | Map element |
| `evolve` | Evolutionary movement |
| `pipeline` | Component grouping across evolution |
| `market` | Standalone market element |
| `ecosystem` | Standalone ecosystem element |
| `build` | Standalone execution strategy |
| `buy` | Standalone execution strategy |
| `outsource` | Standalone execution strategy |
| `note` | Free-form text annotation |
| `annotation` | Numbered callout |
| `annotations` | Annotation legend position |
| `submap` | Link to another map |
| `url` | Named URL definition |
| `pioneers` | PST overlay |
| `settlers` | PST overlay |
| `townplanners` | PST overlay |
| `accelerator` | Evolutionary force (speeds up) |
| `deaccelerator` | Evolutionary force (slows down) |

### Inline modifiers

| Modifier | Syntax |
|----------|--------|
| Label offset | `label [x, y]` (pixels) |
| Inertia | `inertia` or `(inertia)` |
| Execution strategy | `(build)`, `(buy)`, `(outsource)` |
| Market/ecosystem | `(market)`, `(ecosystem)` |
| Combined decorators | `(market, buy)`, `(market, outsource)` |
| Submap URL ref | `url(name)` |


## Parser behaviour notes

These details are derived from the
[reference implementation](https://github.com/damonsk/onlinewardleymaps)
source code.

- Comments are stripped **before** any keyword matching.  `url` lines
  are exempt from `//` stripping.
- Keywords are matched with `line.trim().startsWith('keyword ')` —
  leading whitespace is tolerated, and the keyword must be followed by
  a space.
- Non-blank lines that match no keyword are treated as link candidates.
  Unrecognised non-blank, non-link lines produce a parse error.
- Element IDs are assigned as `1 + line_index` in the
  post-comment-stripped text (1-based line numbers).
- Pipeline `{ }` blocks are stripped from the main component pass;
  nested components are only visible to the pipeline strategy.
- `evolve` creates a separate data entry referencing the original
  component by name — it does not modify or replace the original.
- Coordinates are parsed with `parseFloat`; out-of-range values are
  accepted without error.
- Blank lines and whitespace-only lines are silently ignored.
