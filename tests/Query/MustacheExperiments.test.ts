import Mustache from 'mustache';
import { Task } from '../../src/Task';

// @ts-ignore
// @ts-ignore
/**
 * @summary
 * This file contains experiments with the Mustache templates library.
 * It will likley be deleted once the library is in use.
 */

// https://github.com/janl/mustache.js

// Turn off HTML escaping of things like '/' in file paths:
// https://github.com/janl/mustache.js#variables
Mustache.escape = function (text) {
    return text;
};

interface QueryContext2 {
    query: {
        file: IFileContext;
    };
}

function makeFileContext(path: string): IFileContext {
    return {
        filename: Task.getFilenameFromPath(path) ?? '',
        path: path,
    };
}

function makeQueryContext(path: string): QueryContext2 {
    return {
        query: {
            file: makeFileContext(path),
        },
    };
}

interface IFileContext {
    filename: string;
    path: string;
}

describe('', () => {
    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = Mustache.render('{{title}} spends {{calc}}', view);
        expect(output).toMatchInlineSnapshot('"Joe spends 6"');
    });

    it('fake query', () => {
        // {{{ needed to prevent directory separators being encoded
        const rawString = `path includes {{ query.file.path }}
filename includes {{ query.file.filename }}`;

        const context = makeQueryContext('a/b/path with space.md');
        const output = Mustache.render(rawString, context);
        expect(output).toMatchInlineSnapshot(`
            "path includes a/b/path with space.md
            filename includes path with space"
        `);
    });
});
