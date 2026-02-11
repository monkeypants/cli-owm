// The Interface
//
// The CLI is the simplest way to produce a Wardley Map: pipe in OWM text,
// get back SVG.  These tests shell out to the built CLI and verify that
// the full pipeline — parse, resolve, render, write — works end to end.
// Requires npm run build first.

import {describe, it, expect} from 'vitest';
import {execFileSync} from 'child_process';
import {readFileSync} from 'fs';
import {join} from 'path';

const root = join(__dirname, '..', '..');
const cli = join(root, 'dist', 'cli.js');
const examplesDir = join(root, 'examples');

describe('CLI', () => {
    it('renders an OWM file to SVG on stdout', () => {
        const svg = execFileSync('node', [cli, join(examplesDir, 'lair-canteen.owm')], {
            encoding: 'utf-8',
        });
        expect(svg).toContain('<svg');
        expect(svg).toContain('Lair Canteen');
    });

    it('reads OWM from stdin when no file is given', () => {
        const input = readFileSync(join(examplesDir, 'lair-canteen.owm'), 'utf-8');
        const svg = execFileSync('node', [cli], {
            input,
            encoding: 'utf-8',
        });
        expect(svg).toContain('<svg');
        expect(svg).toContain('Lair Canteen');
    });

    it('applies a theme via the --style flag', () => {
        const svg = execFileSync('node', [cli, '--style', 'dark', join(examplesDir, 'minimal.owm')], {
            encoding: 'utf-8',
        });
        expect(svg).toContain('#353347');
    });
});
