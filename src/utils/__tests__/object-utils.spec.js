import { describe, it, expect } from 'vitest';
import { get, set } from '../object-utils';

describe('object-utils', () => {
    describe('get', () => {
        it('reads a top-level key', () => {
            expect(get({ name: 'Ada' }, 'name')).toBe('Ada');
        });

        it('reads a nested key through a dot path', () => {
            expect(get({ user: { address: { city: 'Vilnius' } } }, 'user.address.city')).toBe(
                'Vilnius',
            );
        });

        it('reads an array element through a bracket path', () => {
            expect(get({ items: [{ id: 9 }] }, 'items[0].id')).toBe(9);
        });

        it('accepts a path that is already an array of keys', () => {
            expect(get({ a: { b: 2 } }, ['a', 'b'])).toBe(2);
        });

        it('returns the default when the path is missing', () => {
            expect(get({}, 'a.b.c', 'fallback')).toBe('fallback');
        });

        it('returns the default when the object is null or undefined', () => {
            expect(get(null, 'a', 'fallback')).toBe('fallback');
            expect(get(undefined, 'a', 'fallback')).toBe('fallback');
        });

        it('stops at a null link in the path instead of throwing', () => {
            expect(get({ user: null }, 'user.name', 'fallback')).toBe('fallback');
        });

        it('returns a stored null rather than the default', () => {
            // Only `undefined` counts as missing, so a field explicitly cleared to null
            // reads back as null instead of silently resurrecting the default.
            expect(get({ a: null }, 'a', 'fallback')).toBeNull();
        });

        it('returns falsy stored values as-is', () => {
            expect(get({ a: 0 }, 'a', 'fallback')).toBe(0);
            expect(get({ a: '' }, 'a', 'fallback')).toBe('');
            expect(get({ a: false }, 'a', 'fallback')).toBe(false);
        });
    });

    describe('set', () => {
        it('writes a top-level key', () => {
            expect(set({}, 'name', 'Ada')).toEqual({ name: 'Ada' });
        });

        it('creates missing intermediate objects', () => {
            expect(set({}, 'user.address.city', 'Vilnius')).toEqual({
                user: { address: { city: 'Vilnius' } },
            });
        });

        it('creates an array when the next key is numeric', () => {
            const result = set({}, 'items.0.id', 5);

            expect(Array.isArray(result.items)).toBe(true);
            expect(result).toEqual({ items: [{ id: 5 }] });
        });

        it('creates an array from a bracket path', () => {
            expect(set({}, 'items[0].id', 5)).toEqual({ items: [{ id: 5 }] });
        });

        it('overwrites an existing value', () => {
            expect(set({ a: { b: 1 } }, 'a.b', 2)).toEqual({ a: { b: 2 } });
        });

        it('leaves sibling keys untouched', () => {
            expect(set({ keep: 1, a: { keep: 2 } }, 'a.b', 3)).toEqual({
                keep: 1,
                a: { keep: 2, b: 3 },
            });
        });

        it('returns the object unchanged when it is null or undefined', () => {
            expect(set(null, 'a', 1)).toBeNull();
            expect(set(undefined, 'a', 1)).toBeUndefined();
        });
    });

    it('round-trips a value through set and get', () => {
        // This pairing is what VForm relies on to rebuild nested payloads from flat
        // FormData entry names, so the two functions must agree on path syntax.
        const obj = {};
        set(obj, 'user.tags[1].id', 42);

        expect(get(obj, 'user.tags[1].id')).toBe(42);
        expect(get(obj, 'user.tags.1.id')).toBe(42);
    });
});
