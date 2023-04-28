import type { FileContext } from './FileContext';
import { makeFileContext } from './FileContext';

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

export function makeQueryContextFromPath(path: string) {
    const fileContext: FileContext = makeFileContext(path);
    return makeQueryContext(fileContext);
}
