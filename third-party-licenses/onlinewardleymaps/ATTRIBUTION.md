## onlinewardleymaps

- **Project:** Online Wardley Maps
- **Author:** Damon Skelhorn
- **Repository:** https://github.com/damonsk/onlinewardleymaps
- **License:** MIT (see MIT-license.txt in this directory)

### Ported code

The following files in `src/parser/` are ported from the onlinewardleymaps
React application into a Node.js/TypeScript context. The parsing logic is
unchanged; only import paths and module wiring were adapted.

- `Converter.ts`
- `BaseStrategyRunner.ts`
- `PipelineStrategyRunner.ts`
- `extractionFunctions.ts`
- `strategies/AcceleratorExtractionStrategy.ts`
- `strategies/AnchorExtractionStrategy.ts`
- `strategies/AnnotationExtractionStrategy.ts`
- `strategies/AttitudeExtractionStrategy.ts`
- `strategies/ComponentExtractionStrategy.ts`
- `strategies/EvolveExtractionStrategy.ts`
- `strategies/ExtendableComponentExtractionStrategy.ts`
- `strategies/LinksExtractionStrategy.ts`
- `strategies/NoteExtractionStrategy.ts`
- `strategies/PipelineExtractionStrategy.ts`
- `strategies/PresentationExtractionStrategy.ts`
- `strategies/SubMapExtractionStrategy.ts`
- `strategies/TitleExtractionStrategy.ts`
- `strategies/UrlExtractionStrategy.ts`
- `strategies/XAxisLabelsExtractionStrategy.ts`

### New code (not derived from onlinewardleymaps)

- `src/parser/UnifiedConverter.ts` — bridge layer
- `src/renderer/` — SVG renderer
- `src/cli/` — CLI interface
- `src/themes/` — theme definitions
- Test suite and example maps
