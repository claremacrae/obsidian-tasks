/**
 * @typedef {import('../tasks-api').Task} Task
 */

/**
 * @param {Task} task - the task being searched
 */
export function parentDescription(task) {
    return task.findClosestParentTask()?.description || 'No parent';
}

/**
 * @param {Task} task - the task being searched
 */
export function statusName(task) {
    return task.status.name;
}
