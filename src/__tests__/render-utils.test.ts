// The Spatial Model
//
// A Wardley Map is a two-dimensional space: maturity (genesis → commodity)
// runs left to right, visibility (user-facing → invisible) runs top to
// bottom.  These functions translate strategic position into canvas pixels.
// The inversion in visibilityToY is the most important property — getting
// it wrong flips the entire map upside down.

import {describe, it, expect} from 'vitest';
import {esc, maturityToX, visibilityToY, resolveComponentPosition} from '../render';
import {createUnifiedComponent} from '../parser/types/unified/components';

describe('maturityToX', () => {
    it('places genesis at the left edge, where all things begin', () => {
        expect(maturityToX(0, 500)).toBe(0);
    });

    it('places commodity at the right edge, where all things converge', () => {
        expect(maturityToX(1, 500)).toBe(500);
    });

    it('places mid-evolution at the canvas midpoint', () => {
        expect(maturityToX(0.5, 500)).toBe(250);
    });

    it('scales to custom canvas dimensions', () => {
        expect(maturityToX(0.25, 800)).toBe(200);
    });
});

describe('visibilityToY', () => {
    it('places high-visibility components at the top', () => {
        expect(visibilityToY(1, 600)).toBe(0);
    });

    it('places invisible components at the bottom', () => {
        expect(visibilityToY(0, 600)).toBe(600);
    });

    it('places mid-chain components at the canvas midpoint', () => {
        expect(visibilityToY(0.5, 600)).toBe(300);
    });

    it('inverts correctly — higher visibility means lower Y', () => {
        const high = visibilityToY(0.8, 600);
        const low = visibilityToY(0.2, 600);
        expect(high).toBeLessThan(low);
    });
});

describe('esc', () => {
    it('escapes ampersands', () => {
        expect(esc('A&B')).toBe('A&amp;B');
    });

    it('escapes angle brackets', () => {
        expect(esc('<div>')).toBe('&lt;div&gt;');
    });

    it('escapes double quotes', () => {
        expect(esc('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('escapes apostrophes', () => {
        expect(esc("it's")).toBe('it&apos;s');
    });

    it('leaves clean strings unmolested', () => {
        expect(esc('Cup of Tea')).toBe('Cup of Tea');
    });

    it('escapes multiple special characters in one string', () => {
        expect(esc('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
    });
});

describe('resolveComponentPosition', () => {
    const components = [
        createUnifiedComponent({id: '1', name: 'VLK Unit', type: 'component', maturity: 0.35, visibility: 0.43}),
        createUnifiedComponent({id: '2', name: 'Hydrogen Supply', type: 'component', maturity: 0.7, visibility: 0.1}),
    ];

    it('finds a component by name', () => {
        const evolvedMap = new Map<string, {maturity: number; visibility: number}>();
        const pos = resolveComponentPosition('VLK Unit', components, evolvedMap);
        expect(pos).not.toBeNull();
        expect(pos!.maturity).toBe(0.35);
        expect(pos!.visibility).toBe(0.43);
        expect(pos!.evolved).toBe(false);
    });

    it('returns evolved position when present', () => {
        const evolvedMap = new Map<string, {maturity: number; visibility: number}>();
        evolvedMap.set('Cloud Autopilot', {maturity: 0.62, visibility: 0.43});
        const pos = resolveComponentPosition('Cloud Autopilot', components, evolvedMap);
        expect(pos).not.toBeNull();
        expect(pos!.maturity).toBe(0.62);
        expect(pos!.evolved).toBe(true);
    });

    it('prefers evolved map over components', () => {
        const evolvedMap = new Map<string, {maturity: number; visibility: number}>();
        evolvedMap.set('VLK Unit', {maturity: 0.9, visibility: 0.43});
        const pos = resolveComponentPosition('VLK Unit', components, evolvedMap);
        expect(pos!.maturity).toBe(0.9);
        expect(pos!.evolved).toBe(true);
    });

    it('returns null for names that were never requisitioned', () => {
        const evolvedMap = new Map<string, {maturity: number; visibility: number}>();
        const pos = resolveComponentPosition('Nonexistent', components, evolvedMap);
        expect(pos).toBeNull();
    });
});
