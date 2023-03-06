import type { ListItemCache, Pos } from 'obsidian';
import type { Task } from '../Task';

type MockListItemCacheTask = string | undefined;
type MockPos = Pos;
export type MockListItemCache = { task: string | undefined; position: Pos };
type MockListItemCaches = MockListItemCache[];
export type MockTask = {
    sectionIndex: number;
    path: string;
    sectionStart: number;
    originalMarkdown: string;
    precedingHeader: string | null;
};
export type MockTogglingDataForTesting = {
    cacheData: { listItemsCache: MockListItemCache[] };
    fileData: { fileLines: string[] };
    taskData: MockTask;
};

export function getMockDataForTesting(
    originalTask: Task,
    fileLines: string[],
    listItemsCache: ListItemCache[],
): MockTogglingDataForTesting {
    const allDataFromListItemCache: MockListItemCaches = [];
    for (const listItemCache of listItemsCache) {
        const pos: MockPos = listItemCache.position;
        const task: MockListItemCacheTask = listItemCache.task;
        const dataFromListItemCache: MockListItemCache = {
            position: pos,
            task: task,
        };
        allDataFromListItemCache.push(dataFromListItemCache);
    }
    return {
        taskData: {
            originalMarkdown: originalTask.originalMarkdown,
            path: originalTask.path,
            precedingHeader: originalTask.precedingHeader,
            sectionStart: originalTask.sectionStart,
            sectionIndex: originalTask.sectionIndex,
        },
        fileData: {
            fileLines: fileLines,
        },
        cacheData: {
            listItemsCache: allDataFromListItemCache,
        },
    };
}
