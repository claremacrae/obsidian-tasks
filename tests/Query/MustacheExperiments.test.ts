import Mustache from 'mustache';

// @ts-ignore
// @ts-ignore
/**
 * @summary
 * This file contains experiments with the Mustache templates library.
 * It will likley be deleted once the library is in use.
 */

// https://github.com/janl/mustache.js

// @ts-ignore
interface QueryContext1 {
    query: {
        file: {
            filename: string;
            path: string;
        };
    };
}

interface QueryContext2 {
    query: {
        file: IFileContext;
    };
}

interface IFileContext {
    filename: string;
    path: string;
}

// @ts-ignore
class FileContext implements IFileContext {
    filename: string;
    path: string;

    constructor(filename: string, path: string) {
        this.filename = filename;
        this.path = path;
    }
}

// class QueryContext2 {
//
// }

// class QueryContextImpl implements QueryContext1 {
//     query: { file: { filename: string; path: string } };
//
//     constructor(path: string) {
//         const filename = 'x.md';
//         this.query = { 'query': { file: { filename; path } } };
//     }
// }

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
        const rawString = 'path includes {{ query.file.filename }}';

        const context: QueryContext2 = {
            query: {
                file: {
                    filename: 'path with space.md',
                    path: 'a/b/path with space.md',
                },
            },
        };
        const output = Mustache.render(rawString, context);
        expect(output).toMatchInlineSnapshot('"path includes path with space.md"');
    });
});
