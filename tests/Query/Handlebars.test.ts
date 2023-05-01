import { expandHandlebarsTemplate } from '../../src/lib/ExpandTemplate';
import { makeFileContext } from '../../src/lib/FileContext';
import { makeQueryContext } from '../../src/lib/QueryContext';

describe('Handlebars Experiments', () => {
    it('rename me', () => {
        const output = expandHandlebarsTemplate('Name: {{name}}', { name: 'Nils' });
        expect(output).toMatchInlineSnapshot('"Name: Nils"');
    });

    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = expandHandlebarsTemplate('{{ title }} spends {{ calc }}', view);
        expect(output).toMatchInlineSnapshot('"Joe spends 6"');
    });

    const rawString = `root includes {{query.file.root}}
path includes {{query.file.path}}
filename includes {{query.file.folder}}
filename includes {{query.file.filename}}
filename includes {{query.file.filenameWithoutExtension}}`;

    it('fake query - with file path', () => {
        const fileContext = makeFileContext('a/b/path with space.md');
        const queryContext = makeQueryContext(fileContext);
        expect(expandHandlebarsTemplate(rawString, queryContext)).toMatchInlineSnapshot(`
            "root includes a/
            path includes a/b/path with space.md
            filename includes a/b/
            filename includes path with space.md
            filename includes path with space"
        `);
    });

    it('should throw an error if unknown template field used', () => {
        const view = {
            title: 'Joe',
        };

        const source = '{{ title }} spends {{ unknownField }}';
        expect(() => expandHandlebarsTemplate(source, view)).toThrow(
            '"unknownField" not defined in [object Object] - 1:22',
        );
    });
});
