import { Task } from '../Task';

export interface FileContext {
    path: string;
    filename: string;
    filenameWithoutExtension: string;
}

export function makeFileContext(path: string): FileContext {
    const filename: string = path.split('/').pop() ?? 'Unknown Path.md';
    return {
        path: path,
        filename: filename,
        filenameWithoutExtension: Task.getFilenameFromPath(path) ?? 'Unknown Path',
    };
}
