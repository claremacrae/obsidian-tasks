import Mustache from 'mustache';
import { makeFileContext, makeFileContextForUnknownLocation } from '../../src/lib/FileContext';
import type { FileContext } from '../../src/lib/FileContext';

/**
 * @summary
 * This file contains experiments with the Mustache templates library.
 * It will likely be deleted once the library is in use.
 */

// https://github.com/janl/mustache.js

interface QueryContext {
    query: {
        file: FileContext;
    };
}

function makeQueryContext(fileContext: FileContext): QueryContext {
    return {
        query: {
            file: fileContext,
        },
    };
}

function expandTemplate(template: string, view: any): string {
    // Turn off HTML escaping of things like '/' in file paths:
    // https://github.com/janl/mustache.js#variables
    Mustache.escape = function (text) {
        return text;
    };

    return Mustache.render(template, view);
}

describe('', () => {
    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = expandTemplate('{{ title }} spends {{ calc }}', view);
        expect(output).toMatchInlineSnapshot('"Joe spends 6"');
    });

    const rawString = `path includes {{query.file.path}}
filename includes {{query.file.filename}}
filename includes {{query.file.filenameWithoutExtension}}`;

    it('fake query - with file path', () => {
        const fileContext = makeFileContext('a/b/path with space.md');
        const queryContext = makeQueryContext(fileContext);
        expect(expandTemplate(rawString, queryContext)).toMatchInlineSnapshot(`
            "path includes a/b/path with space.md
            filename includes path with space.md
            filename includes path with space"
        `);
    });

    it('fake query - with unknown file path', () => {
        const fileContext = makeFileContextForUnknownLocation();
        const queryContext = makeQueryContext(fileContext);
        expect(expandTemplate(rawString, queryContext)).toMatchInlineSnapshot(`
            "path includes ERROR - path to Query not supplied - cannot expand template
            filename includes ERROR - path to Query not supplied - cannot expand template
            filename includes ERROR - path to Query not supplied - cannot expand template"
        `);
    });
});
