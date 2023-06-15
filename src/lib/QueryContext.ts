import { TasksFile } from '../Scripting/TasksFile';

export interface QueryContext {
    query: {
        file: TasksFile;
        root: string;
        path: string;
        folder: string;
        filename: string;
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
        },
    };
}

export function makeQueryContextFromPath(path: string) {
    return makeQueryContext(path);
}
