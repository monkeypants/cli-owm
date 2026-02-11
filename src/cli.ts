#!/usr/bin/env node

import * as fs from 'fs';
import {parse, render} from './index';
import {VERSION} from './version';

function usage(): void {
    const text = `Usage: cli-owm [options] [input-file]

Render Wardley Map DSL text to SVG.

Options:
  -o, --output <file>   Output SVG file (default: stdout)
  -s, --style <name>    Theme: plain, wardley, handwritten, dark, colour
  -w, --width <n>       Map width in pixels (default: 500)
  -H, --height <n>      Map height in pixels (default: 600)
  --help                Show help
  --version             Show version

If no input file is given, reads from stdin.`;
    console.log(text);
}

function main(): void {
    const args = process.argv.slice(2);
    let inputFile: string | null = null;
    let outputFile: string | null = null;
    let style: string | undefined;
    let width: number | undefined;
    let height: number | undefined;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--help') {
            usage();
            process.exit(0);
        } else if (arg === '--version') {
            console.log(VERSION);
            process.exit(0);
        } else if (arg === '-o' || arg === '--output') {
            outputFile = args[++i];
        } else if (arg === '-s' || arg === '--style') {
            style = args[++i];
        } else if (arg === '-w' || arg === '--width') {
            width = parseInt(args[++i], 10);
        } else if (arg === '-H' || arg === '--height') {
            height = parseInt(args[++i], 10);
        } else if (!arg.startsWith('-')) {
            inputFile = arg;
        } else {
            console.error(`Unknown option: ${arg}`);
            usage();
            process.exit(1);
        }
    }

    const readInput = (): Promise<string> => {
        if (inputFile) {
            return Promise.resolve(fs.readFileSync(inputFile, 'utf-8'));
        }
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            process.stdin.on('data', chunk => chunks.push(chunk));
            process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            process.stdin.on('error', reject);
        });
    };

    readInput().then(input => {
        const map = parse(input);
        const svg = render(map, {width, height, style});

        if (outputFile) {
            fs.writeFileSync(outputFile, svg, 'utf-8');
        } else {
            process.stdout.write(svg);
        }
    }).catch(err => {
        console.error(err.message || err);
        process.exit(1);
    });
}

main();
