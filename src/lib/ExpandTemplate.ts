import Handlebars from 'handlebars';
import Mustache from 'mustache';
import proxyData from 'mustache-validator';

// https://github.com/janl/mustache.js

export function expandMustacheTemplate(template: string, view: any): string {
    // Turn off HTML escaping of things like '/' in file paths:
    // https://github.com/janl/mustache.js#variables
    Mustache.escape = function (text) {
        return text;
    };

    return Mustache.render(template, proxyData(view));
}

export function expandHandlebarsTemplate(source: string, view: any) {
    const options: CompileOptions = {
        strict: true,
    };
    const template = Handlebars.compile(source, options);
    return template(view);
}