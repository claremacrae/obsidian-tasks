import { TasksFile } from '../Scripting/TasksFile';
import { Task } from '../Task';

export interface QueryContext {
    query: {
        file: TasksFile;
        root: string;
        path: string;
        folder: string;
        filename: string;
        filenameWithoutExtension: string;
    };
}

export function makeQueryContext(path: string): QueryContext {
    const tasksFile = new TasksFile(path);
    return {
        query: {
            file: tasksFile,
            root: tasksFile.root,
            path: tasksFile.path,
            folder: tasksFile.folder,
            filename: tasksFile.filename,
            filenameWithoutExtension: Task.getFilenameFromPath(path) ?? 'Unknown Path',
        },
    };
}

export function makeQueryContextFromPath(path: string) {
    return makeQueryContext(path);
}
