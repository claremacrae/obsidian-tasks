import type { FileContext } from './FileContext';
import { makeFileContext, makeFileContextForUnknownLocation } from './FileContext';

export interface QueryContext {
    query: {
        file: FileContext;
    };
}

export function makeQueryContext(fileContext: FileContext): QueryContext {
    return {
        query: {
            file: fileContext,
        },
    };
}

export function makeQueryContextFromPath(path: string | undefined) {
    let fileContext: FileContext;
    if (path) {
        fileContext = makeFileContext(path);
    } else {
        fileContext = makeFileContextForUnknownLocation();
    }
    return makeQueryContext(fileContext);
}
