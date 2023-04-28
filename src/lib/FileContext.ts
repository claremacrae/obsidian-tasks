import { Task } from '../Task';

export interface FileContext {
    path: string | undefined;
    filename: string | undefined;
    filenameWithoutExtension: string | undefined;
}

export function makeFileContext(path: string): FileContext {
    const filename: string = path.split('/').pop() ?? 'Unknown Path.md';
    return {
        path: path,
        filename: filename,
        filenameWithoutExtension: Task.getFilenameFromPath(path) ?? 'Unknown Path',
    };
}

export function makeFileContextForUnknownLocation(): FileContext {
    const text = 'ERROR - path to Query not supplied - cannot expand template';
    return {
        path: text,
        filename: text,
        filenameWithoutExtension: text,
    };
}
