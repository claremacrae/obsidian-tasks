import Handlebars from 'handlebars';
import { makeFileContext } from '../../src/lib/FileContext';
import { makeQueryContext } from '../../src/lib/QueryContext';

function expandMustacheTemplate(source: string, view: any) {
    const template = Handlebars.compile(source);
    return template(view);
}

describe('Handlebars Experiments', () => {
    it('rename me', () => {
        const output = expandMustacheTemplate('Name: {{name}}', { name: 'Nils' });
        expect(output).toMatchInlineSnapshot('"Name: Nils"');
    });

    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = expandMustacheTemplate('{{ title }} spends {{ calc }}', view);
        expect(output).toMatchInlineSnapshot('"Joe spends 6"');
    });

    const rawString = `path includes {{query.file.path}}
filename includes {{query.file.filename}}
filename includes {{query.file.filenameWithoutExtension}}`;

    it('fake query - with file path', () => {
        const fileContext = makeFileContext('a/b/path with space.md');
        const queryContext = makeQueryContext(fileContext);
        expect(expandMustacheTemplate(rawString, queryContext)).toMatchInlineSnapshot(`
            "path includes a/b/path with space.md
            filename includes path with space.md
            filename includes path with space"
        `);
    });
});
