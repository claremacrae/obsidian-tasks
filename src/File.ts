import type { ListItemCache, Pos } from 'obsidian';
import { MetadataCache, TFile, Vault } from 'obsidian';

import { getSettings } from './Config/Settings';
import type { Task } from './Task';

let metadataCache: MetadataCache | undefined;
let vault: Vault | undefined;

type CachedTaskInfo = string | undefined;
type CachedLinePosition = Pos;
type DataFromListItemCache = { task: string | undefined; position: Pos };
type AllDataFromListItemCache = DataFromListItemCache[];
export type MockTogglingDataForTesting = {
    cacheData: { listItemsCache: DataFromListItemCache[] };
    fileData: { fileLines: string[] };
    taskData: {
        sectionIndex: number;
        path: string;
        sectionStart: number;
        originalMarkdown: string;
        precedingHeader: string | null;
    };
};

function getMockDataForTesting(
    originalTask: Task,
    fileLines: string[],
    listItemsCache: ListItemCache[],
): MockTogglingDataForTesting {
    const allDataFromListItemCache: AllDataFromListItemCache = [];
    for (const listItemCache of listItemsCache) {
        const pos: CachedLinePosition = listItemCache.position;
        const task: CachedTaskInfo = listItemCache.task;
        const dataFromListItemCache: DataFromListItemCache = {
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

function findLineNumberOfTaskToToggle2(
    originalTask: {
        sectionIndex: number;
        path: string;
        sectionStart: number;
        originalMarkdown: string;
        precedingHeader: string | null;
    },
    fileLines: string[],
    listItemsCache: DataFromListItemCache[],
) {
    const { globalFilter } = getSettings();
    let taskLineNumber: number | undefined;
    let sectionIndex = 0;
    for (const listItemCache of listItemsCache) {
        if (listItemCache.position.start.line < originalTask.sectionStart) {
            continue;
        }

        if (listItemCache.task === undefined) {
            continue;
        }

        const line = fileLines[listItemCache.position.start.line];

        if (line.includes(globalFilter)) {
            if (sectionIndex === originalTask.sectionIndex) {
                taskLineNumber = listItemCache.position.start.line;
                break;
            }

            sectionIndex++;
        }
    }
    return taskLineNumber;
}

export function findLineNumberOfTaskToToggle(everything: MockTogglingDataForTesting) {
    const originalTask = everything.taskData;
    const fileLines = everything.fileData.fileLines;
    const listItemsCache = everything.cacheData.listItemsCache;

    return findLineNumberOfTaskToToggle2(originalTask, fileLines, listItemsCache);
}

export const initializeFile = ({
    metadataCache: newMetadataCache,
    vault: newVault,
}: {
    metadataCache: MetadataCache;
    vault: Vault;
}) => {
    metadataCache = newMetadataCache;
    vault = newVault;
};

/**
 * Replaces the original task with one or more new tasks.
 *
 * If you pass more than one replacement task, all subsequent tasks in the same
 * section must be re-rendered, as their section indexes change. Assuming that
 * this is done faster than user interaction in practice.
 */
export const replaceTaskWithTasks = async ({
    originalTask,
    newTasks,
}: {
    originalTask: Task;
    newTasks: Task | Task[];
}): Promise<void> => {
    if (vault === undefined || metadataCache === undefined) {
        console.error('Tasks: cannot use File before initializing it.');
        return;
    }

    if (!Array.isArray(newTasks)) {
        newTasks = [newTasks];
    }

    tryRepetitive({
        originalTask,
        newTasks,
        vault,
        metadataCache,
        previousTries: 0,
    });
};

/**
 * This is a workaround to re-try when the returned file cache is `undefined`.
 * Retrying after a while may return a valid file cache.
 * Reported in https://github.com/obsidian-tasks-group/obsidian-tasks/issues/87
 */
const tryRepetitive = async ({
    originalTask,
    newTasks,
    vault,
    metadataCache,
    previousTries,
}: {
    originalTask: Task;
    newTasks: Task[];
    vault: Vault;
    metadataCache: MetadataCache;
    previousTries: number;
}): Promise<void> => {
    const retry = () => {
        if (previousTries > 10) {
            console.error('Tasks: Too many retries. File update not possible ...');
            return;
        }

        const timeout = Math.min(Math.pow(10, previousTries), 100); // 1, 10, 100, 100, 100, ...
        setTimeout(() => {
            tryRepetitive({
                originalTask,
                newTasks,
                vault,
                metadataCache,
                previousTries: previousTries + 1,
            });
        }, timeout);
    };

    const file = vault.getAbstractFileByPath(originalTask.path);
    if (!(file instanceof TFile)) {
        console.warn(`Tasks: No file found for task ${originalTask.description}. Retrying ...`);
        return retry();
    }

    if (file.extension !== 'md') {
        console.error('Tasks: Only supporting files with the .md file extension.');
        return;
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache == undefined || fileCache === null) {
        console.warn(`Tasks: No file cache found for file ${file.path}. Retrying ...`);
        return retry();
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        console.warn(`Tasks: No list items found in file cache of ${file.path}. Retrying ...`);
        return retry();
    }

    const fileContent = await vault.read(file);
    const fileLines = fileContent.split('\n');
    const everything = getMockDataForTesting(originalTask, fileLines, listItemsCache);
    console.log(JSON.stringify(everything));

    const taskLineNumber = findLineNumberOfTaskToToggle(everything);

    if (taskLineNumber === undefined) {
        console.error('Tasks: could not find task to toggle in the file.');
        return;
    }

    if (fileLines[taskLineNumber] !== originalTask.originalMarkdown) {
        console.error(`Inconsistent lines: SAVE THE OUTPUT
expected:
${originalTask.originalMarkdown}
found:
${fileLines[taskLineNumber]}
result: ${taskLineNumber}
data:
${JSON.stringify(everything)}
`);
    }
    const updatedFileLines = [
        ...fileLines.slice(0, taskLineNumber),
        ...newTasks.map((task: Task) => task.toFileLineString()),
        ...fileLines.slice(taskLineNumber + 1), // Only supports single-line tasks.
    ];

    await vault.modify(file, updatedFileLines.join('\n'));
};
