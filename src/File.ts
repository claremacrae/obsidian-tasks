import { MetadataCache, Notice, TFile, Vault } from 'obsidian';
import type { ListItemCache } from 'obsidian';

import { getSettings } from './Config/Settings';
import { Task } from './Task';

import { DateFallback } from './DateFallback';
import { Lazy } from './lib/Lazy';

let metadataCache: MetadataCache | undefined;
let vault: Vault | undefined;

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
 *
 * In addition, this function is meant to be called with reasonable confidence
 * that the {@code originalTask} is unmodified and at the exact same section and
 * sectionIdx in the source file it was originally found in. It will fail otherwise.
 */
export const replaceTaskWithTasks = async ({
    originalTask,
    newTasks,
}: {
    originalTask: Task;
    newTasks: Task | Task[];
}): Promise<void> => {
    if (vault === undefined || metadataCache === undefined) {
        errorAndNotice('Tasks: cannot use File before initializing it.');
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

function errorAndNotice(message: string) {
    console.error(message);
    new Notice(message, 10000);
}

function warnAndNotice(message: string) {
    console.warn(message);
    new Notice(message, 10000);
}

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
            errorAndNotice('Tasks: Too many retries. File update not possible ...');
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
        warnAndNotice(`Tasks: No file found for task ${originalTask.description}. Retrying ...`);
        return retry();
    }

    if (file.extension !== 'md') {
        errorAndNotice('Tasks: Only supporting files with the .md file extension.');
        return;
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache == undefined || fileCache === null) {
        warnAndNotice(`Tasks: No file cache found for file ${file.path}. Retrying ...`);
        return retry();
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        warnAndNotice(`Tasks: No list items found in file cache of ${file.path}. Retrying ...`);
        return retry();
    }

    const fileContent = await vault.read(file);
    const fileLines = fileContent.split('\n');

    const { globalFilter } = getSettings();
    let listItem: ListItemCache | undefined;
    let sectionIndex = 0;
    for (const listItemCache of listItemsCache) {
        const lineIndex = listItemCache.position.start.line;
        if (lineIndex < originalTask.sectionStart) {
            continue;
        }

        if (listItemCache.task === undefined) {
            continue;
        }

        const line = fileLines[lineIndex];
        if (line.includes(globalFilter)) {
            if (sectionIndex === originalTask.sectionIndex) {
                const dateFromFileName = new Lazy(() => DateFallback.fromPath(originalTask.path));
                const taskFromLine = Task.fromLine({
                    line,
                    path: originalTask.path,
                    precedingHeader: originalTask.precedingHeader,
                    sectionStart: originalTask.sectionStart,
                    sectionIndex: originalTask.sectionIndex,
                    fallbackDate: dateFromFileName.value,
                });
                if (taskFromLine?.identicalTo(originalTask) === true) {
                    listItem = listItemCache;
                } else {
                    const message = `Tasks: Unable to find task in file:
${originalTask.path}
Expected task:
${originalTask.originalMarkdown}
Found task line:
${line}
Other info:
    previousTries: ${previousTries}
    originalTask.sectionStart: ${originalTask.sectionStart}
    originalTask.sectionIndex: ${originalTask.sectionIndex}
`;
                    errorAndNotice(message);
                    //return retry();
                    return;
                }
                break;
            }

            sectionIndex++;
        }
    }
    if (listItem === undefined) {
        errorAndNotice('Tasks: could not find task to toggle in the file.');
        return;
    }

    const updatedFileLines = [
        ...fileLines.slice(0, listItem.position.start.line),
        ...newTasks.map((task: Task) => task.toFileLineString()),
        ...fileLines.slice(listItem.position.start.line + 1), // Only supports single-line tasks.
    ];

    await vault.modify(file, updatedFileLines.join('\n'));
};
