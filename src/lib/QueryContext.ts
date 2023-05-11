import { FolderField } from '../Query/Filter/FolderField';
import { RootField } from '../Query/Filter/RootField';
import { Task } from '../Task';
import type { FileContext } from './FileContext';
import { makeFileContext } from './FileContext';

export interface QueryContext {
    query: {
        file: FileContext;
        root: string;
        path: string;
        folder: string;
        filename: string;
        filenameWithoutExtension: string;
    };
}

export function makeQueryContext(fileContext: FileContext, path: string): QueryContext {
    const filename: string = path.split('/').pop() ?? 'Unknown Path.md';
    const folder = FolderField.folder(path, filename);
    return {
        query: {
            file: fileContext,
            root: RootField.root(path),
            path: path,
            folder: folder,
            filename: filename,
            filenameWithoutExtension: Task.getFilenameFromPath(path) ?? 'Unknown Path',
        },
    };
}

export function makeQueryContextFromPath(path: string) {
    const fileContext: FileContext = makeFileContext(path);
    return makeQueryContext(fileContext, path);
}
