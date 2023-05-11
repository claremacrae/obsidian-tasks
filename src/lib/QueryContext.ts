import { FolderField } from '../Query/Filter/FolderField';
import { RootField } from '../Query/Filter/RootField';
import { Task } from '../Task';

export interface QueryContext {
    query: {
        root: string;
        path: string;
        folder: string;
        filename: string;
        filenameWithoutExtension: string;
    };
}

export function makeQueryContext(path: string): QueryContext {
    const filename: string = path.split('/').pop() ?? 'Unknown Path.md';
    const folder = FolderField.folder(path, filename);
    return {
        query: {
            root: RootField.root(path),
            path: path,
            folder: folder,
            filename: filename,
            filenameWithoutExtension: Task.getFilenameFromPath(path) ?? 'Unknown Path',
        },
    };
}

export function makeQueryContextFromPath(path: string) {
    return makeQueryContext(path);
}
