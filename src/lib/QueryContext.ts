import type { FileContext } from './FileContext';

interface QueryContext {
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
