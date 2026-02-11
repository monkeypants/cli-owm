// The Picture
//
// The renderer transforms a parsed map into SVG.  Golden-file snapshots
// protect the full rendering pipeline across five representative examples
// and all five themes.  Unit tests below verify geometry, theme resolution,
// and edge cases using self-contained inline maps — no dependency on
// example files.

import {describe, it, expect} from 'vitest';
import {readFileSync} from 'fs';
import {join} from 'path';
import {parse, render, themes} from '../index';

const examplesDir = join(__dirname, '..', '..', 'examples');
function loadAndRender(file: string, style?: string) {
    const map = parse(readFileSync(join(examplesDir, file), 'utf-8'));
    return render(map, {style});
}

// Golden-file snapshots: 5 examples x 5 themes = 25 snapshots
//
// | Example              | Features exercised                                           |
// |----------------------|--------------------------------------------------------------|
// | lair-canteen.owm     | Components, links, evolution, annotations, notes, anchors    |
// | comprehensive.owm    | Pipeline, attitudes, accelerators, submaps, decorators, flow |
// | pipeline.owm         | Pipeline-specific geometry                                   |
// | links-and-flows.owm  | Link variants, context text, flow overlay                    |
// | minimal.owm          | Bare minimum — verifies empty-map handling                   |
const representative = [
    'lair-canteen.owm',
    'comprehensive.owm',
    'pipeline.owm',
    'links-and-flows.owm',
    'minimal.owm',
];

const themeNames = Object.keys(themes);

describe('renderer golden-file snapshots', () => {
    for (const file of representative) {
        describe(file, () => {
            for (const theme of themeNames) {
                it(`renders with ${theme} theme`, () => {
                    const svg = loadAndRender(file, theme);
                    expect(svg).toMatchSnapshot();
                });
            }
        });
    }
});

// Targeted renderer unit tests — self-contained, no dependency on example files
describe('renderer units', () => {
    describe('pipeline geometry', () => {
        it('positions pipeline rectangle from child maturity boundaries', () => {
            const map = parse(
'component VLK Unit [0.50, 0.60]\n' +
'pipeline VLK Unit\n' +
'{\n' +
'  component Prototype Kite [0.20]\n' +
'  component Production Kite [0.80]\n' +
'}');
            const svg = render(map);
            // m1=0.20, m2=0.80, width=500
            // x1 = 0.20*500 - 15 = 85
            // x2 = 0.80*500 + 15 = 415
            // pipelineWidth = 415 - 85 = 330, height = 22
            expect(svg).toContain('translate(85,');
            expect(svg).toMatch(/<g transform="translate\(85,[^"]*">\s*<line[^>]*x2="330"/);
            expect(svg).toContain('y2="22"');
        });
    });

    describe('evolution link', () => {
        it('traces evolution as a dashed arrow across the maturity axis', () => {
            const map = parse(
'component Control Software [0.50, 0.40]\n' +
'evolve Control Software 0.80');
            const svg = render(map);
            expect(svg).toMatch(/<line[^>]*stroke-dasharray="5 5"[^>]*marker-end="url\(#arrow\)"/);
        });

        it('constrains evolution to horizontal movement — visibility is conserved', () => {
            // visibility 0.50 -> y = (1-0.50)*600 = 300
            const map = parse(
'component Control Software [0.50, 0.40]\n' +
'evolve Control Software 0.80');
            const svg = render(map);
            expect(svg).toMatch(/<line[^>]*y1="300"[^>]*y2="300"[^>]*marker-end="url\(#arrow\)"/);
        });
    });

    describe('annotation box', () => {
        it('sizes annotation box to fit all entries', () => {
            const map = parse(
'component Traction on Demand [0.5, 0.5]\n' +
'annotation 1 [0.48, 0.85] VLK-service ship symbiosis\n' +
'annotation 2 [0.30, 0.50] Carbon fibre resists commoditisation');
            const svg = render(map);
            // 2 annotations: boxHeight = (2+1)*18 + 8 = 62
            expect(svg).toMatch(/<rect[^>]*width="200"[^>]*height="62"/);
        });

        it('marks annotation positions with numbered circles', () => {
            const map = parse(
'component Traction on Demand [0.5, 0.5]\n' +
'annotation 1 [0.48, 0.85] VLK-service ship symbiosis');
            const svg = render(map);
            const annotationCircles = svg.match(/<circle[^>]*r="15"/g);
            expect(annotationCircles).not.toBeNull();
            expect(annotationCircles!.length).toBeGreaterThan(0);
        });

        it('lists annotation text in the annotation box', () => {
            const map = parse(
'component Traction on Demand [0.5, 0.5]\n' +
'annotation 1 [0.48, 0.85] VLK-service ship symbiosis\n' +
'annotation 2 [0.30, 0.50] Carbon fibre resists commoditisation');
            const svg = render(map);
            expect(svg).toMatch(/<text[^>]*>Annotations:<\/text>/);
            expect(svg).toMatch(/<text[^>]*>[^<]*VLK-service ship symbiosis[^<]*<\/text>/);
            expect(svg).toMatch(/<text[^>]*>[^<]*Carbon fibre resists commoditisation[^<]*<\/text>/);
        });
    });

    describe('component shapes', () => {
        it('draws standard components as circles', () => {
            const map = parse('component Traction on Demand [0.79, 0.61]');
            const svg = render(map);
            expect(svg).toMatch(/<circle[^>]*r="5"/);
        });

        it('draws pipeline members as rectangles', () => {
            const map = parse(
'component VLK Unit [0.50, 0.60]\n' +
'pipeline VLK Unit\n' +
'{\n' +
'  component Prototype Kite [0.30]\n' +
'}');
            const svg = render(map);
            expect(svg).toMatch(/<rect[^>]*width="10" height="10"/);
        });
    });

    describe('inertia', () => {
        it('manifests inertia as a heavy vertical bar', () => {
            const map = parse('component Carbon Fibre [0.50, 0.50] inertia');
            const svg = render(map);
            const inertiaLines = svg.match(/<line[^>]*stroke-width="6"[^>]*\/>/g);
            expect(inertiaLines).not.toBeNull();
            expect(inertiaLines!.length).toBeGreaterThan(0);
        });

        it('centers the inertia bar on the component position', () => {
            // visibility 0.50 -> y = (1-0.50)*600 = 300
            const map = parse('component Carbon Fibre [0.50, 0.50] inertia');
            const svg = render(map);
            expect(svg).toMatch(/<line[^>]*y1="290"[^>]*y2="310"[^>]*stroke-width="6"/);
        });
    });

    describe('theme resolution', () => {
        it('overrides the map style with the options style', () => {
            const map = parse('title STORM Overview\nstyle wardley\ncomponent VLK Unit [0.5, 0.5]');
            // map says "wardley" but we override with "dark"
            const svg = render(map, {style: 'dark'});
            expect(svg).toMatch(/<rect[^>]*fill="#353347"[^>]*id="fillArea"/);
        });

        it('prefers an explicit theme object over a style name', () => {
            const map = parse('component VLK Unit [0.5, 0.5]');
            const svg = render(map, {style: 'dark', theme: themes.colour});
            // theme should win over style — colour stroke, not dark background
            expect(svg).toMatch(/<circle[^>]*stroke="#8cb358"/);
            expect(svg).not.toMatch(/<rect[^>]*fill="#353347"/);
        });
    });

    describe('SVG structure', () => {
        it('wraps output in a valid SVG root element', () => {
            const map = parse('component VLK Unit [0.5, 0.5]');
            const svg = render(map);
            expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
            expect(svg).toMatch(/<\/svg>$/);
        });

        it('defines reusable markers in SVG defs', () => {
            const map = parse('component VLK Unit [0.5, 0.5]');
            const svg = render(map);
            expect(svg).toContain('<defs>');
            expect(svg).toContain('</defs>');
            expect(svg).toMatch(/<marker id="arrow"/);
        });

        it('renders the map title', () => {
            const map = parse('title Project Thunderkite\ncomponent VLK Unit [0.5, 0.5]');
            const svg = render(map);
            expect(svg).toMatch(/<text[^>]*>Project Thunderkite<\/text>/);
        });
    });

    describe('edge cases', () => {
        it('renders a blank map without crashing', () => {
            const map = parse('');
            const svg = render(map);
            expect(svg).toMatch(/^<svg/);
            expect(svg).toMatch(/<\/svg>$/);
        });

        it('renders gracefully when links reference vanished components', () => {
            const map = parse('component VLK Unit [0.5, 0.5]\nGhost->VLK Unit');
            const svg = render(map);
            expect(svg).toMatch(/^<svg/);
            // VLK Unit at maturity 0.5, width 500 -> cx=250
            expect(svg).toMatch(/<circle[^>]*cx="250"/);
        });
    });
});
