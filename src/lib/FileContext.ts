import { FolderField } from '../Query/Filter/FolderField';
import { Task } from '../Task';

export interface FileContext {
    path: string;
    folder: string;
    filename: string;
    filenameWithoutExtension: string;
}

export function makeFileContext(path: string): FileContext {
    const filename: string = path.split('/').pop() ?? 'Unknown Path.md';
    const folder = FolderField.folder(path, filename);
    return {
        path: path,
        folder: folder,
        filename: filename,
        filenameWithoutExtension: Task.getFilenameFromPath(path) ?? 'Unknown Path',
    };
}
