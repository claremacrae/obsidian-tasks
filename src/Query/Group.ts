import type { Moment } from 'moment';
import type { Grouping, GroupingProperty } from '../Query';
import type { Task } from '../Task';
import { TaskGroups } from './TaskGroups';

/**
 * A naming function, that takes a Task object and returns the corresponding group property name
 */
type Grouper = (task: Task) => string;

/**
 * Implementation of the 'group by' instruction.
 */
export class Group {
    private static readonly groupDateFormat = 'YYYY-MM-DD dddd';

    /**
     * Group a list of tasks, according to one or more task properties
     * @param grouping 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    public static by(grouping: Grouping[], tasks: Task[]): TaskGroups {
        return new TaskGroups(grouping, tasks);
    }

    /**
     * Return the Grouper functions matching the 'group by' lines
     * @param grouping 0 or more Grouping values, one per 'group by' line
     */
    public static getGroupersForAllQueryGroupings(grouping: Grouping[]) {
        const groupers: Grouper[] = [];
        for (const { property } of grouping) {
            const comparator = Group.groupers[property];
            groupers.push(comparator);
        }
        return groupers;
    }

    /**
     * Return the group names for a single task
     * @param groupers The Grouper functions indicating the requested types of group
     * @param task
     */
    public static getGroupNamesForTask(groupers: Grouper[], task: Task) {
        const groupNames = [];
        for (const grouper of groupers) {
            const groupName = grouper(task);
            groupNames.push(groupName);
        }
        return groupNames;
    }

    /**
     * Return a single property name for a single task.
     * A convenience method for unit tests.
     * @param property
     * @param task
     */
    public static getGroupNameForTask(
        property: GroupingProperty,
        task: Task,
    ): string {
        const grouper = Group.groupers[property];
        return grouper(task);
    }

    private static groupers: Record<GroupingProperty, Grouper> = {
        backlink: Group.groupByBacklink,
        context: Group.groupByContext,
        done: Group.groupByDoneDate,
        due: Group.groupByDueDate,
        filename: Group.groupByFileName,
        folder: Group.groupByFolder,
        happens: Group.groupByHappensDate,
        heading: Group.groupByHeading,
        path: Group.groupByPath,
        priority: Group.groupByPriority,
        recurrence: Group.groupByRecurrence,
        recurring: Group.groupByRecurring,
        referenceDateField: Group.groupByHappensField,
        root: Group.groupByRoot,
        scheduled: Group.groupByScheduledDate,
        start: Group.groupByStartDate,
        status: Group.groupByStatus,
        urgency: Group.groupByUrgency,
    };

    private static groupByUrgency(task: Task): string {
        const value = task.urgency.toFixed(2);
        return `Urgency ${value}`;
    }

    private static groupByPriority(task: Task): string {
        return `Priority ${task.priority}`;
    }

    private static groupByRecurrence(task: Task): string {
        if (task.recurrence !== null) {
            return task.recurrence!.toText();
        } else {
            return 'None';
        }
    }

    private static groupByRecurring(task: Task): string {
        if (task.recurrence !== null) {
            return 'Recurring';
        } else {
            return 'Not Recurring';
        }
    }

    private static groupByStartDate(task: Task): string {
        return Group.groupByDate(task.startDate, 'start');
    }

    private static groupByScheduledDate(task: Task): string {
        return Group.groupByDate(task.scheduledDate, 'scheduled');
    }

    private static groupByDueDate(task: Task): string {
        return Group.groupByDate(task.dueDate, 'due');
    }

    private static groupByDoneDate(task: Task): string {
        return Group.groupByDate(task.doneDate, 'done');
    }

    private static groupByHappensDate(task: Task): string {
        const referenceDate = Group.getReferenceDate(task);
        const referenceName = Group.getReferenceDateField(task);
        if (referenceDate) {
            return Group.groupByDate(referenceDate, referenceName);
        }
        return 'No happens date';
    }

    private static groupByHappensField(task: Task): string {
        return Group.getReferenceDateField(task);
    }

    private static getReferenceDateField(task: Task) {
        let referenceName = 'None';
        if (task.dueDate != null) {
            referenceName = 'Due';
        } else if (task.scheduledDate != null) {
            referenceName = 'Scheduled';
        } else if (task.startDate != null) {
            referenceName = 'Start';
        }
        return referenceName;
    }

    private static getReferenceDate(task: Task) {
        let referenceDate: Moment | null = null;
        if (task.dueDate != null) {
            referenceDate = task.dueDate;
        } else if (task.scheduledDate != null) {
            referenceDate = task.scheduledDate;
        } else if (task.startDate != null) {
            referenceDate = task.startDate;
        }
        return referenceDate;
    }

    private static groupByDate(date: moment.Moment | null, field: string) {
        if (date === null) {
            return 'No ' + field + ' date';
        }
        return date.format(Group.groupDateFormat);
    }

    private static groupByPath(task: Task): string {
        // Does this need to be made stricter?
        // Is there a better way of getting the file name?
        return task.path.replace('.md', '');
    }

    private static groupByFolder(task: Task): string {
        const path = task.path;
        const fileNameWithExtension = task.filename + '.md';
        const folder = path.substring(
            0,
            path.lastIndexOf(fileNameWithExtension),
        );
        if (folder === '') {
            return '/';
        }
        return folder;
    }

    private static groupByFileName(task: Task): string {
        // Note current limitation: Tasks from different notes with the
        // same name will be grouped together, even though they are in
        // different files and their links will look different.
        const filename = task.filename;
        if (filename === null) {
            return 'Unknown Location';
        }
        return filename;
    }

    private static groupByRoot(task: Task): string {
        const path = task.path.replace('\\', '/');
        const separatorIndex = path.indexOf('/');
        if (separatorIndex == -1) {
            return '/';
        }
        return path.substring(0, separatorIndex + 1);
    }

    private static groupByBacklink(task: Task): string {
        const linkText = task.getLinkText({ isFilenameUnique: true });
        if (linkText === null) {
            return 'Unknown Location';
        }
        return linkText;
    }

    private static groupByStatus(task: Task): string {
        return task.status;
    }

    private static groupByHeading(task: Task): string {
        if (
            task.precedingHeader === null ||
            task.precedingHeader.length === 0
        ) {
            return '(No heading)';
        }
        return task.precedingHeader;
    }

    private static groupByContext(task: Task): string {
        const description = task.description;
        const contextRegexp = /.* #context\/([^ ]+)/;
        const contextMatch = description.match(contextRegexp);
        if (contextMatch !== null) {
            return contextMatch[1];
        }
        return 'No context';
    }
}
