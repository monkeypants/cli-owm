// The Language
//
// The OWM DSL expresses strategic structure: components positioned on a
// value chain, links that trace dependencies, evolution that projects
// movement, pipelines that group variants, and annotations that narrate.
// Each describe block covers one construct.  Fixtures are drawn from
// the same vocabulary as the example maps.

import {describe, it, expect} from 'vitest';
import {parse} from '../index';

describe('parser', () => {
    describe('title', () => {
        it('extracts the map title', () => {
            const map = parse('title Project Thunderkite');
            expect(map.title).toBe('Project Thunderkite');
        });

        it('defaults to Untitled Map when none given', () => {
            const map = parse('component Hydrogen Supply [0.5, 0.5]');
            expect(map.title).toBe('Untitled Map');
        });
    });

    describe('components', () => {
        it('positions a component on the value chain by visibility and maturity', () => {
            const map = parse('component Traction on Demand [0.79, 0.61]');
            expect(map.components).toHaveLength(1);
            const c = map.components[0];
            expect(c.name).toBe('Traction on Demand');
            expect(c.visibility).toBeCloseTo(0.79);
            expect(c.maturity).toBeCloseTo(0.61);
        });
    });

    describe('labels', () => {
        it('applies custom label positioning offsets', () => {
            const map = parse('component Traction on Demand [0.79, 0.61] label [-85.48, 3.78]');
            const c = map.components[0];
            expect(c.label.x).toBeCloseTo(-85.48);
            expect(c.label.y).toBeCloseTo(3.78);
        });
    });

    describe('anchors', () => {
        it('positions a value chain anchor', () => {
            const map = parse('anchor Shipping Line [0.95, 0.63]');
            expect(map.anchors).toHaveLength(1);
            expect(map.anchors[0].name).toBe('Shipping Line');
            expect(map.anchors[0].visibility).toBeCloseTo(0.95);
            expect(map.anchors[0].maturity).toBeCloseTo(0.63);
        });
    });

    describe('links', () => {
        it('traces a dependency between components in the value chain', () => {
            const map = parse(`
                component Traction on Demand [0.9, 0.5]
                component VLK Unit [0.5, 0.5]
                Traction on Demand->VLK Unit
            `);
            expect(map.links).toHaveLength(1);
            expect(map.links[0].start).toBe('Traction on Demand');
            expect(map.links[0].end).toBe('VLK Unit');
        });

        it('annotates a dependency with operational context', () => {
            const map = parse(`
                component Service Ship [0.9, 0.5]
                component Maintenance Crew [0.5, 0.5]
                Service Ship->Maintenance Crew; in-flight repairs only
            `);
            expect(map.links[0].context).toBe('in-flight repairs only');
        });

        it('distinguishes material flow from structural dependency', () => {
            const map = parse(`
                component VLK Unit [0.9, 0.5]
                component Service Ship [0.5, 0.5]
                VLK Unit+>Service Ship
            `);
            const flow = map.links.find(l => l.flow);
            expect(flow).toBeDefined();
        });
    });

    describe('evolution', () => {
        it('projects a component toward a target maturity', () => {
            const map = parse(`
                component Control Software [0.43, 0.35]
                evolve Control Software 0.62
            `);
            expect(map.evolved).toHaveLength(1);
            expect(map.evolved[0].name).toBe('Control Software');
            expect(map.evolved[0].maturity).toBeCloseTo(0.62);
        });

        it('transforms a component identity through evolution', () => {
            const map = parse(`
                component Control Software [0.43, 0.35]
                evolve Control Software->AI Autopilot 0.62
            `);
            expect(map.evolved[0].override).toBe('AI Autopilot');
        });
    });

    describe('pipelines', () => {
        it('groups component variants within a pipeline', () => {
            const map = parse(`
                component VLK Unit [0.40, 0.60]
                pipeline VLK Unit
                {
                  component Prototype Kite [0.35]
                  component Production Kite [0.75]
                }
            `);
            expect(map.pipelines).toHaveLength(1);
            expect(map.pipelines[0].name).toBe('VLK Unit');
            expect(map.pipelines[0].components).toHaveLength(2);
        });

        it('derives pipeline extent from the maturity spread of its children', () => {
            const map = parse(`
                component VLK Unit [0.40, 0.60]
                pipeline VLK Unit
                {
                  component Prototype Kite [0.35]
                  component Production Kite [0.75]
                }
            `);
            const p = map.pipelines[0];
            expect(p.maturity1).toBeCloseTo(0.35);
            expect(p.maturity2).toBeCloseTo(0.75);
        });
    });

    describe('annotations', () => {
        it('extracts numbered annotations with text', () => {
            const map = parse('annotation 1 [0.48, 0.85] VLK-service ship symbiosis is the core innovation');
            expect(map.annotations).toHaveLength(1);
            expect(map.annotations[0].number).toBe(1);
            expect(map.annotations[0].text).toBe('VLK-service ship symbiosis is the core innovation');
        });

        it('supports annotations pointing to multiple locations', () => {
            const map = parse('annotation 1 [[0.43,0.49],[0.08,0.79]] Carbon fibre sourcing resists commoditisation');
            expect(map.annotations[0].occurances).toHaveLength(2);
        });
    });

    describe('notes', () => {
        it('positions a note on the map', () => {
            const map = parse('note +flying sailboat is the north star [0.23, 0.33]');
            expect(map.notes).toHaveLength(1);
            expect(map.notes[0].text).toContain('flying sailboat is the north star');
            expect(map.notes[0].visibility).toBeCloseTo(0.23);
            expect(map.notes[0].maturity).toBeCloseTo(0.33);
        });
    });

    describe('inertia', () => {
        it('flags a component as resisting evolutionary pressure', () => {
            const map = parse('component Carbon Fibre [0.65, 0.40] inertia');
            expect(map.components[0].inertia).toBe(true);
        });

        it('accepts parenthesized inertia syntax', () => {
            const map = parse('component Carbon Fibre [0.65, 0.40] (inertia)');
            expect(map.components[0].inertia).toBe(true);
        });
    });

    describe('decorators', () => {
        it('marks a component for buy sourcing', () => {
            const map = parse('component AI Autopilot [0.25, 0.78] (buy)');
            expect(map.components[0].decorators.buy).toBe(true);
        });

        it('marks a component for build sourcing', () => {
            const map = parse('component VLK Unit [0.60, 0.30] (build)');
            expect(map.components[0].decorators.build).toBe(true);
        });

        it('marks a component for outsource sourcing', () => {
            const map = parse('component Seawater Electrolysis [0.15, 0.85] (outsource)');
            expect(map.components[0].decorators.outsource).toBe(true);
        });
    });

    describe('attitudes', () => {
        it('identifies pioneer, settler, and townplanner regions', () => {
            const map = parse(`
                pioneers [0.90, 0.10] 100 25
                settlers [0.85, 0.10] 100 25
                townplanners [0.80, 0.10] 100 25
            `);
            expect(map.attitudes).toHaveLength(3);
            const types = map.attitudes.map((a: any) => a.attitude).sort();
            expect(types).toEqual(['pioneers', 'settlers', 'townplanners']);
        });
    });

    describe('accelerators', () => {
        it('identifies forces that accelerate evolution', () => {
            const map = parse('accelerator carbon_shipping_levies [0.1, 0.8]');
            expect(map.accelerators).toHaveLength(1);
            expect(map.accelerators[0].deaccelerator).toBe(false);
        });

        it('identifies forces that resist evolution', () => {
            const map = parse('deaccelerator maritime_regulation [0.8, 0.2]');
            expect(map.accelerators).toHaveLength(1);
            expect(map.accelerators[0].deaccelerator).toBe(true);
        });
    });

    describe('comments', () => {
        it('redacts single-line comments before parsing', () => {
            const map = parse(
'// boom-pop authorisation pending Form BP-1\n' +
'title STORM Operations\n' +
'component Hydrogen Supply [0.5, 0.5]');
            expect(map.title).toBe('STORM Operations');
            expect(map.components).toHaveLength(1);
        });

        it('redacts block comments before parsing', () => {
            const map = parse(
'/* Supreme Leader\n' +
'   approved — countersigned by HR */\n' +
'title STORM Operations\n' +
'component Hydrogen Supply [0.5, 0.5]');
            expect(map.title).toBe('STORM Operations');
        });
    });

    describe('submaps', () => {
        it('links a submap to an external URL', () => {
            const map = parse(`
                submap Fleet Operations [0.50, 0.35] url(fleetUrl)
                url fleetUrl [https://example.com]
            `);
            expect(map.submaps).toHaveLength(1);
            expect(map.submaps[0].name).toBe('Fleet Operations');
        });
    });

    describe('custom evolution labels', () => {
        it('customises the evolution axis labels', () => {
            const map = parse('evolution Genesis->Custom->Product->Commodity');
            expect(map.evolution).toHaveLength(4);
            expect(map.evolution[0].line1).toBe('Genesis');
            expect(map.evolution[3].line1).toBe('Commodity');
        });
    });

    describe('edge cases', () => {
        it('produces an empty map from blank input', () => {
            const map = parse('');
            expect(map.title).toBe('Untitled Map');
            expect(map.components).toHaveLength(0);
            expect(map.links).toHaveLength(0);
            expect(map.errors).toHaveLength(0);
        });

        it('defaults unpositioned components (sketch-in-progress)', () => {
            const map = parse('component Escape Route');
            expect(map.components).toHaveLength(1);
            expect(map.components[0].name).toBe('Escape Route');
            expect(map.components[0].maturity).toBe(0.1);
            expect(map.components[0].visibility).toBe(0.9);
        });

        it('preserves dangling links when components vanish mid-edit', () => {
            const map = parse('component VLK Unit [0.5, 0.5]\nGhost->VLK Unit');
            expect(map.links).toHaveLength(1);
            expect(map.links[0].start).toBe('Ghost');
            expect(map.links[0].end).toBe('VLK Unit');
        });

        it('tolerates empty pipelines during map construction', () => {
            const map = parse('component Propulsion [0.4, 0.6]\npipeline Propulsion\n{\n}');
            expect(map.pipelines).toHaveLength(1);
            expect(map.pipelines[0].components).toHaveLength(0);
        });
    });
});
