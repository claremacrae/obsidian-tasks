import Handlebars from 'handlebars';

export function expandHandlebarsTemplate(source: string, view: any) {
    const options: CompileOptions = {
        strict: true,
    };
    const template = Handlebars.compile(source, options);
    return template(view);
}
