import Mustache from 'mustache';

/**
 * @summary
 * This file contains experiments with the Mustache templates library.
 * It will likley be deleted once the library is in use.
 */

// https://github.com/janl/mustache.js

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

        const context = {
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
