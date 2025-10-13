import type { Moment } from 'moment';
import type { Moment as Moment_2 } from 'moment/moment';
import { RRule } from 'rrule';

export declare class Link {
    /**
     * Return the original Markdown, exactly as specified in the original markdown.
     * For "[ab](cd.md)", it would return "[ab](cd.md)".
     *
     * **Tip**: For use in `group by function`, {@link markdown} will also work for header-only links,
     * like `[[#heading in this file]]`.
     *
     * See also {@link markdown}
     */
    get originalMarkdown(): string;

    /**
     * This is like {@link originalMarkdown}, but will also work for heading-only links
     * when viewed in files other than the one containing the original link.
     *
     * For "[ab](cd.md)" it would return "[ab](cd.md)".
     * For "[#heading](cd.md)" in file "de.md" it would return "[de#heading](cd.md)".
     *
     * This is needed if using links in Tasks group headings if any of your task files have
     * links to headings in their same file.
     * See also {@link originalMarkdown}
     */
    get markdown(): string;

    /**
     * Return the destination, exactly as specified in the original markdown.
     * For "[ab](cd.md)", it would return "cd.md".
     *
     * **Tip**: Use {@link destinationPath} instead.
     *
     * This method is not able to supply the full path of the link destination.
     * Note that if you have two files called `cd.md`, Tasks does not yet do anything
     * to select the closest file of that name.
     *
     * So if this is used in a link in Obsidian, Obsidian will use its own logic to open the
     * "closest" file.
     * Obsidian would choose the closest file to where the Tasks query is, as opposed
     * to the closest file where the original task Markdown line is.
     */
    get destination(): string;

    /**
     * The actual full path that Obsidian would navigate to if the user clicked on the link,
     * or `null` if the link is to a non-existent file.
     *
     * For "[[link_in_file_body]]", it might return "Test Data/link_in_file_body.md".
     *
     * Note that this value is not usually configured correctly in tests.
     * See {@link LinkResolver} docs for more info.
     */
    get destinationPath(): string | null;

    /**
     * For "[[Styling of Queries]]", it would return "Styling of Queries"
     * For "[[link_in_task_wikilink|alias]]", it would return "alias"
     * For "[ab](cd.md)", it would return "ab".
     * For "[[Project Search#Search 1]]", it would return "Project Search > Search 1"
     */
    get displayText(): string | undefined;

    /**
     * Returns true if this link points to the given value
     * - Pass in `query.file` or `task.file` for the most precise results.
     * - If supplying a string, it is case-sensitive, and it will return true if:
     *     - the string matches the link destination's filename (it ignores `.md` file extension)
     *     - or the string matches the link destination's full path (it ignores `.md` file extension)
     * @param destination
     */
    linksTo(destination: string | TasksFile): boolean;
}

export declare class ListItem {
    readonly originalMarkdown: string;
    readonly parent: ListItem | null;
    readonly children: ListItem[];
    readonly indentation: string;
    readonly listMarker: string;
    readonly description: string;
    readonly statusCharacter: string | null;
    readonly taskLocation: TaskLocation;

    /**
     * Return the top-level parent of this list item or task,
     * which will not be indented.
     *
     * The root of an unintended item is itself.
     *
     * This is useful because the Tasks plugin currently only stores a flat list of {@link Task} objects,
     * and does not provide direct access to all the parsed {@link ListItem} objects.
     *
     * @see isRoot
     */
    get root(): ListItem;

    /**
     * Returns whether this is a top-level (unindented) list item or task.
     *
     * @see root
     */
    get isRoot(): boolean;

    /**
     * Find to find the closest parent that is a {@link Task}
     */
    findClosestParentTask(): Task | null;
    get isTask(): boolean;
    get path(): string;
    get file(): TasksFile;

    /**
     * Return a list of links in the body of the file containing
     * the task or list item.
     *
     * The data contest is documented here:
     * https://docs.obsidian.md/Reference/TypeScript+API/LinkCache
     */

    /**
     * Return a list of links in the task or list item's line.
     */
    get outlinks(): Readonly<Link[]>;

    /**
     * Return the name of the file containing this object, with the .md extension removed.
     */
    get filename(): string | null;
    get lineNumber(): number;
    get sectionStart(): number;
    get sectionIndex(): number;
    get precedingHeader(): string | null;
    toFileLineString(): string;
}

/**
 * A set of dates on a single instance of {@link Recurrence}.
 *
 * It is responsible for calculating the set of dates for the next occurrence.
 */
declare class Occurrence {
    readonly startDate: Moment_2 | null;
    readonly scheduledDate: Moment_2 | null;
    readonly dueDate: Moment_2 | null;
    constructor({
        startDate,
        scheduledDate,
        dueDate,
    }: {
        startDate?: Moment_2 | null;
        scheduledDate?: Moment_2 | null;
        dueDate?: Moment_2 | null;
    });

    /**
     * The reference date is used to calculate future occurrences.
     *
     * Future occurrences will recur based on the reference date.
     * The reference date is the due date, if it is given.
     * Otherwise the scheduled date, if it is given. And so on.
     *
     * Recurrence of all dates will be kept relative to the reference date.
     * For example: if the due date and the start date are given, the due date
     * is the reference date. Future occurrences will have a start date with the
     * same relative distance to the due date as the original task. For example
     * "starts one week before it is due".
     */
    get referenceDate(): moment.Moment | null;

    /**
     *  Pick the reference date for occurrence based on importance.
     *  Assuming due date has the highest priority, then scheduled date,
     *  then start date, by default.
     *  The order differs if removeScheduledDateOnRecurrence is enabled.
     *  See [Priority of Dates](https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks#Priority%20of%20Dates).
     *
     *  The Moment objects are cloned.
     *
     * @private
     */
    isIdenticalTo(other: Occurrence): boolean;

    /**
     * Provides an {@link Occurrence} with the dates calculated relative to a new reference date.
     *
     * If the occurrence has no reference date, an empty {@link Occurrence} will be returned.
     *
     * @param nextReferenceDate
     */
    next(nextReferenceDate: Date): Occurrence;

    /**
     * Gets next occurrence (start/scheduled/due date) keeping the relative distance
     * with the reference date
     *
     * @param nextReferenceDate
     * @param currentOccurrenceDate start/scheduled/due date
     * @private
     */
}

declare enum OnCompletion {
    Ignore = '',
    Keep = 'keep',
    Delete = 'delete',
}

declare type PresetsMap = Record<string, string>;

/**
 * When sorting, make sure low always comes after none. This way any tasks with low will be below any exiting
 * tasks that have no priority which would be the default.
 *
 * Values can be converted to strings with:
 * - {@link priorityNameUsingNone} in {@link PriorityTools}
 * - {@link priorityNameUsingNormal} in {@link PriorityTools}
 *
 * @enum {number}
 */
export declare enum Priority {
    Highest = '0',
    High = '1',
    Medium = '2',
    None = '3',
    Low = '4',
    Lowest = '5',
}

/**
 * A helper class to construct group names for data types that do not naturally sort in alphabetical order.
 *
 * A convention has been adopted in the Tasks grouping code to use commented-out numbers to control
 * the sort order in group headings for things like {@link Priority}, which we want to
 * sort from {@link Priority.Highest} to {@link Priority.Lowest}, instead of alphabetically.
 *
 * This class provides a way to store a {@link name} and a {@link sortOrder}, from which {@link groupText}
 * can be constructed.
 *
 * For an example of use, see {@link TasksDate.category}.
 */
declare class PropertyCategory {
    readonly name: string;
    readonly sortOrder: number;

    /**
     * Return the group heading for this category.
     *
     * It prefixes the name with a comment that will ensure the groups sort in the desired order.
     *
     * This works because the commented-out sortOrder will be hidden when Obsidian
     * renders the group heading.
     */
    get groupText(): string;
}

/**
 * This interface is part of the implementation of placeholders and scripting.
 *
 * - Use {@link makeQueryContext} or {@link makeQueryContextWithTasks} to make a {@link QueryContext}.
 * - Or more commonly, if you have a {@link SearchInfo}, use {@link SearchInfo.queryContext}
 *
 * QueryContext is a 'view' to pass in to {@link expandPlaceholders} and
 * to various methods of {@link TaskExpression}.
 *
 * It provides the following:
 * - `queryContext.query.file` - where `query.file` is a {@link TasksFile} object.
 *                               So it supplies `query.file.path`, `query.file.folder`, etc.
 * - `queryContext.query.allTasks` - all the {@link Task}s in the vault that match
 *                                   any global filter.
 *
 * @see SearchInfo
 */
export declare interface QueryContext {
    query: {
        file: TasksFile;
        allTasks: Readonly<Task[]>;
        searchCache: Record<string, any>;
    };
    preset: PresetsMap;
}

declare class Recurrence {
    readonly occurrence: Occurrence;
    constructor({ rrule, baseOnToday, occurrence }: { rrule: RRule; baseOnToday: boolean; occurrence: Occurrence });
    static fromText({
        recurrenceRuleText,
        occurrence,
    }: {
        recurrenceRuleText: string;
        occurrence: Occurrence;
    }): Recurrence | null;
    toText(): string;

    /**
     * Returns the dates of the next occurrence or null if there is no next occurrence.
     *
     * @param today - Optional date representing the completion date. Defaults to today.
     */
    next(today?: Moment): Occurrence | null;
    identicalTo(other: Recurrence): boolean;

    /**
     * nextAfter returns the next occurrence's date after `after`, based on the given rrule.
     *
     * The common case is that `rrule.after` calculates the next date and it
     * can be used as is.
     *
     * In the special cases of monthly and yearly recurrences, there exists an
     * edge case where an occurrence after the given number of months or years
     * is not possible. For example: A task is due on 2022-01-31 and has a
     * recurrence of `every month`. When marking the task as done, the next
     * occurrence will happen on 2022-03-31. The reason being that February
     * does not have 31 days, yet RRule sets `bymonthday` to `31` for lack of
     * having a better alternative.
     *
     * In order to fix this, `after` will move into the past day by day. Each
     * day, the next occurrence is checked to be after the given number of
     * months or years. By moving `after` into the past day by day, it will
     * eventually calculate the next occurrence based on `2022-01-28`, ending up
     * in February as the user would expect.
     */

    /**
     * nextAfterMonths calculates the next date after `skippingMonths` months.
     *
     * `skippingMonths` defaults to `1` if undefined.
     */

    /**
     * isSkippingTooManyMonths returns true if `next` is more than `skippingMonths` months after `after`.
     */

    /**
     * nextAfterYears calculates the next date after `skippingYears` years.
     *
     * `skippingYears` defaults to `1` if undefined.
     */

    /**
     * isSkippingTooManyYears returns true if `next` is more than `skippingYears` years after `after`.
     */

    /**
     * fromOneDayEarlier returns the next occurrence after moving `after` one day into the past.
     *
     * WARNING: This method manipulates the given instance of `after`.
     */
}

/**
 * Tracks the possible states that a task can be in.
 *
 * Related classes:
 * @see StatusConfiguration
 * @see StatusRegistry
 * @see StatusSettings
 * @see StatusSettingsHelpers.ts
 * @see CustomStatusModal
 *
 * @class Status
 */
export declare class Status {
    /**
     * The symbol used between the two square brackets in the markdown task.
     *
     * @type {string}
     */
    get symbol(): string;

    /**
     * Returns the name of the status for display purposes.
     *
     * @type {string}
     */
    get name(): string;

    /**
     * Returns the next status for a task when toggled.
     *
     * @type {string}
     * @see nextStatusSymbol
     */
    get nextSymbol(): string;

    /**
     * Returns the status type. See {@link StatusType} for details.
     */
    get type(): StatusType;

    /**
     * Returns the text to be used to represent the {@link StatusType} in group headings.
     *
     * The status types are in the same order as given by 'group by status.type'.
     * This is provided as a convenience for use in custom grouping.
     */
    get typeGroupText(): string;
}

/**
 * Collection of status types supported by the plugin.
 */
declare enum StatusType {
    TODO = 'TODO',
    DONE = 'DONE',
    IN_PROGRESS = 'IN_PROGRESS',
    CANCELLED = 'CANCELLED',
    NON_TASK = 'NON_TASK',
    EMPTY = 'EMPTY',
}

/**
 * Task encapsulates the properties of the MarkDown task along with
 * the extensions provided by this plugin. This is used to parse and
 * generate the markdown task for all updates and replacements.
 *
 * @class Task
 */
export declare class Task extends ListItem {
    readonly status: Status;
    readonly tags: string[];
    readonly priority: Priority;
    readonly createdDate: Moment | null;
    readonly startDate: Moment | null;
    readonly scheduledDate: Moment | null;
    readonly dueDate: Moment | null;
    readonly doneDate: Moment | null;
    readonly cancelledDate: Moment | null;
    readonly recurrence: Recurrence | null;
    readonly onCompletion: OnCompletion;
    readonly dependsOn: string[];
    readonly id: string;

    /** The blockLink is a "^" annotation after the dates/recurrence rules.
     * Any non-empty value must begin with ' ^'. */
    readonly blockLink: string;
    readonly scheduledDateIsInferred: boolean;
    constructor({
        status,
        description,
        taskLocation,
        indentation,
        listMarker,
        priority,
        createdDate,
        startDate,
        scheduledDate,
        dueDate,
        doneDate,
        cancelledDate,
        recurrence,
        onCompletion,
        dependsOn,
        id,
        blockLink,
        tags,
        originalMarkdown,
        scheduledDateIsInferred,
        parent,
    }: {
        status: Status;
        description: string;
        taskLocation: TaskLocation;
        indentation: string;
        listMarker: string;
        priority: Priority;
        createdDate: moment.Moment | null;
        startDate: moment.Moment | null;
        scheduledDate: moment.Moment | null;
        dueDate: moment.Moment | null;
        doneDate: moment.Moment | null;
        cancelledDate: moment.Moment | null;
        recurrence: Recurrence | null;
        onCompletion: OnCompletion;
        dependsOn: string[] | [];
        id: string;
        blockLink: string;
        tags: string[] | [];
        originalMarkdown: string;
        scheduledDateIsInferred: boolean;
        parent?: ListItem | null;
    });

    /**
     * Takes the given line from an Obsidian note and returns a Task object.
     * Will check if Global Filter is present in the line.
     *
     * If you want to specify a parent ListItem or Task after a fromLine call,
     * you have to do the following:
     * @example
     *  const finalTask = new Task({ ...firstReadTask!, parent: parentListItem });
     *
     * @static
     * @param {string} line - The full line in the note to parse.
     * @param {TaskLocation} taskLocation - The location of the task line
     * @param {(Moment | null)} fallbackDate - The date to use as the scheduled date if no other date is set
     * @return {*}  {(Task | null)}
     * @see parseTaskSignifiers
     * @see ListItem.fromListItemLine
     */
    static fromLine({
        line,
        taskLocation,
        fallbackDate,
    }: {
        line: string;
        taskLocation: TaskLocation;
        fallbackDate: Moment | null;
    }): Task | null;

    /**
     * Parses the line in attempt to get the task details.
     *
     * This reads the task even if the Global Filter is missing.
     * If a Global Filter check is needed, use {@link Task.fromLine}.
     *
     * Task is returned regardless if Global Filter is present or not.
     * However, if it is, it will be removed from the tags.
     *
     * @param line - the full line to parse
     * @param taskLocation - The location of the task line
     * @param fallbackDate - The date to use as the scheduled date if no other date is set
     * @returns {*} {(Task | null)}
     * @see fromLine
     */
    static parseTaskSignifiers(line: string, taskLocation: TaskLocation, fallbackDate: Moment | null): Task | null;

    /**
     * Extract the component parts of the task line.
     * @param line
     * @returns a {@link TaskComponents} object containing the component parts of the task line
     */
    static extractTaskComponents(line: string): TaskComponents | null;

    /**
     * Flatten the task as a string that includes all its components.
     *
     * @note Output depends on {@link Settings.taskFormat}
     * @return {*}  {string}
     */
    toString(): string;

    /**
     * Returns the Task as a list item with a checkbox.
     *
     * @note Output depends on {@link Settings.taskFormat}
     * @return {*}  {string}
     */
    toFileLineString(): string;

    /**
     * Toggles this task and returns the resulting task(s).
     *
     * Use this method if you need to know which is the original (completed)
     * task and which is the new recurrence.
     *
     * If the task is not recurring, it will return `[toggled]`.
     *
     * Toggling can result in more than one returned task in the case of
     * recurrence. In this case, the toggled task will be returned
     * together with the next occurrence in the order `[next, toggled]`.
     *
     * There is a possibility to use user set order `[next, toggled]`
     * or `[toggled, next]` - {@link toggleWithRecurrenceInUsersOrder}.
     *
     */
    toggle(): Task[];

    /**
     * Edits the {@link status} of this task and returns the resulting task(s).
     *
     * Use this method if you need to know which is the original (edited)
     * task and which is the new recurrence, if any.
     *
     * If the task is not recurring, it will return `[edited]`,
     * or `[this]` if the status is unchanged.
     *
     * Editing the status can result in more than one returned task in the case of
     * recurrence. In this case, the edited task will be returned
     * together with the next occurrence in the order `[next, edited]`.
     *
     * There is a possibility to use user set order `[next, edited]`
     * or `[toggled, next]` - {@link handleNewStatusWithRecurrenceInUsersOrder}.
     *
     * @param newStatus
     * @param today - Optional date representing the completion date. This defaults to today.
     *                It is used for any new done date, and for the calculation of new
     *                dates on recurring tasks that are marked as 'when done'.
     *                However, any created date on a new recurrence is, for now, calculated from the
     *                actual current date, rather than this parameter.
     */
    handleNewStatus(newStatus: Status, today?: Moment): Task[];

    /**
     * Returns the new value to use for a date that tracks progress on tasks upon transition to a different
     * {@link StatusType}.
     *
     * Currently, this is used to calculate the new Done Date or Cancelled Date,
     */

    /**
     * Toggles this task and returns the resulting task(s).
     *
     * Use this method if the updated task(s) are to be saved,
     * as this honours the user setting to control the order
     * the tasks should be saved in.
     *
     * If the task is not recurring, it will return `[toggled]`.
     *
     * Toggling can result in more than one returned task in the case of
     * recurrence. In this case, the toggled task will be returned in
     * user set order `[next, toggled]` or `[toggled, next]` depending
     * on {@link Settings}.
     *
     * If there is no need to consider user settings call {@link toggle}.
     *
     */
    toggleWithRecurrenceInUsersOrder(): Task[];
    handleNewStatusWithRecurrenceInUsersOrder(newStatus: Status, today?: Moment): Task[];

    /**
     * Return whether this object is a {@link Task}.
     *
     * This is useful at run-time to discover whether a {@link ListItem} reference is in fact a {@link Task}.
     */
    get isTask(): boolean;

    /**
     * Return whether the task is considered done.
     * @returns true if the status type is {@link StatusType.DONE}, {@link StatusType.CANCELLED} or {@link StatusType.NON_TASK}, and false otherwise.
     */
    get isDone(): boolean;

    /**
     * A task is treated as blocked if it depends on any existing task ids on tasks that are TODO or IN_PROGRESS.
     *
     * 'Done' tasks (with status DONE, CANCELLED or NON_TASK) are never blocked.
     * Only direct dependencies are considered.
     * @param allTasks - all the tasks in the vault. In custom queries, this is available via query.allTasks.
     */
    isBlocked(allTasks: Readonly<Task[]>): boolean;

    /**
     * A Task is blocking if there is any other not-done task dependsOn value with its id.
     *
     * 'Done' tasks (with status DONE, CANCELLED or NON_TASK) are never blocking.
     * Only direct dependencies are considered.
     * @param allTasks - all the tasks in the vault. In custom queries, this is available via query.allTasks.
     */
    isBlocking(allTasks: Readonly<Task[]>): boolean;

    /**
     * Return the number of the Task's priority.
     *     - Highest = 0
     *     - High = 1
     *     - Medium = 2
     *     - None = 3
     *     - Low = 4
     *     - Lowest = 5
     * @see priorityName
     */
    get priorityNumber(): number;

    /**
     * Returns the text to be used to represent the {@link priority} in group headings.
     *
     * Hidden text is used to sort the priorities in decreasing order, from
     * {@link Priority.Highest} to {@link Priority.Lowest}.
     */
    get priorityNameGroupText(): string;

    /**
     * Return a copy of the description, with any tags removed.
     *
     * Note that this removes tags recognised by Tasks (including removing #123, for example),
     * as opposed to tags recognised by Obsidian, which does not treat numbers-only as valid tags.
     */
    get descriptionWithoutTags(): string;

    /**
     * Return the name of the Task's priority.
     *
     * Note that the default priority is called 'Normal', not 'None'.
     @see priorityNumber
     */
    get priorityName(): string;
    get urgency(): number;

    /**
     * Return {@link cancelledDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    get cancelled(): TasksDate;

    /**
     * Return {@link createdDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    get created(): TasksDate;

    /**
     * Return {@link doneDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    get done(): TasksDate;

    /**
     * Return {@link dueDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    get due(): TasksDate;

    /**
     * Return {@link scheduledDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    get scheduled(): TasksDate;

    /**
     * Return {@link startDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    get start(): TasksDate;

    /**
     * Return the date fields that contribute to 'happens' searches.
     *
     * @see happens
     * @see {@link HappensDateField}
     */
    get happensDates(): (Moment | null)[];

    /**
     * Return the earliest of the dates used by 'happens' in this given task as a {@link TasksDate}.
     *
     * Generally speaking, the earliest date is considered to be the highest priority,
     * as it is the first point at which the user might wish to act on the task.
     *
     * Invalid dates are ignored.
     *
     * @see happensDates
     * @see {@link HappensDateField}
     */
    get happens(): TasksDate;

    /**
     * Return true if the Task has a valid recurrence rule, and false otherwise,
     * that is, false if it does not have a recurrence rule, or the recurrence rule is invalid.
     */
    get isRecurring(): boolean;

    /**
     * Return the text of the Task's recurrence rule, if it is supplied and is valid,
     * and an empty string otherwise.
     */
    get recurrenceRule(): string;
    get heading(): string | null;
    get hasHeading(): boolean;

    /**
     * Returns the text that should be displayed to the user when linking to the origin of the task
     *
     * @param isFilenameUnique {boolean|null} Whether the name of the file that contains the task is unique in the vault.
     *                                        If it is undefined, the outcome will be the same as with a unique file name: the file name only.
     *                                        If set to `true`, the full path will be returned.
     */
    getLinkText({ isFilenameUnique }: { isFilenameUnique: boolean | undefined }): string | null;

    /**
     * Compare all the fields in another Task, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * This is used in some optimisations, to avoid work if an edit to file
     * does not change any tasks, so it is vital that its definition
     * of identical is very strict.
     *
     * @param other
     */
    identicalTo(other: Task): boolean;

    /**
     * See also {@link AllTaskDateFields}
     */
    static allDateFields(): (keyof Task)[];

    /**
     * Returns an array of hashtags found in string
     *
     * @param description A task description that may contain hashtags
     *
     * @returns An array of hashTags found in the string
     */
    static extractHashtags(description: string): string[];
}

/**
 * Storage for the task line, broken down in to sections.
 * See {@link Task.extractTaskComponents} for use.
 */
declare interface TaskComponents {
    indentation: string;
    listMarker: string;
    status: Status;
    body: string;
    blockLink: string;
}

/**
 * TaskLocation is the place where all information about a task line's location
 * in a markdown file is stored, so that testable algorithms can then be added here.
 */
declare class TaskLocation {
    constructor(
        tasksFile: TasksFile,
        lineNumber: number,
        sectionStart: number,
        sectionIndex: number,
        precedingHeader: string | null,
    );

    /**
     * Constructor, for use when the Task's exact location in a file is either unknown, or not needed.
     * @param tasksFile
     */
    static fromUnknownPosition(tasksFile: TasksFile): TaskLocation;

    /**
     * Constructor, for when the file has been renamed, and all other data remains the same.
     * @param newTasksFile
     */
    fromRenamedFile(newTasksFile: TasksFile): TaskLocation;
    get tasksFile(): TasksFile;
    get path(): string;
    get lineNumber(): number;

    /** Line number where the section starts that contains this task. */
    get sectionStart(): number;

    /** The index of the nth task in its section. */
    get sectionIndex(): number;
    get precedingHeader(): string | null;

    /**
     * Whether the path is known, that-is, non-empty.
     *
     * This doesn't check whether the path points to an existing file.
     *
     * It was written to allow detection of tasks in Canvas cards, but note
     * that some editing code in this plugin does not bother to set the location
     * of the task, if not needed.
     */
    get hasKnownPath(): boolean;
    allFieldsExceptTasksFileForTesting(): Omit<
        this,
        | 'identicalTo'
        | 'path'
        | 'lineNumber'
        | 'sectionStart'
        | 'sectionIndex'
        | 'precedingHeader'
        | '_tasksFile'
        | 'fromRenamedFile'
        | 'tasksFile'
        | 'hasKnownPath'
        | 'allFieldsExceptTasksFileForTesting'
    >;

    /**
     * Compare all the fields in another TaskLocation, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * @param other
     */
    identicalTo(other: TaskLocation): boolean;
}

/**
 * TasksDate encapsulates a date, for simplifying the JavaScript expressions users need to
 * write in 'group by function' lines.
 */
export declare class TasksDate {
    constructor(date: Moment | null);

    /**
     * Return the raw underlying moment (or null, if there is no date)
     */
    get moment(): Moment | null;

    /**
     * Return the date formatted as YYYY-MM-DD, or {@link fallBackText} if there is no date.
     @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    formatAsDate(fallBackText?: string): string;

    /**
     * Return the date formatted as YYYY-MM-DD HH:mm, or {@link fallBackText} if there is no date.
     @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    formatAsDateAndTime(fallBackText?: string): string;

    /**
     * Return the date formatted with the given format string, or {@link fallBackText} if there is no date.
     * See https://momentjs.com/docs/#/displaying/ for all the available formatting options.
     * @param format
     * @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    format(format: string, fallBackText?: string): string;

    /**
     * Return the date as an ISO string, for example '2023-10-13T00:00:00.000Z'.
     * @param keepOffset
     * @returns - The date as an ISO string, for example: '2023-10-13T00:00:00.000Z',
     *            OR an empty string if no date, OR null for an invalid date.
     */
    toISOString(keepOffset?: boolean): string | null;
    get category(): PropertyCategory;
    get fromNow(): PropertyCategory;
}

/**
 * A simple class to provide access to file information via 'task.file' in scripting code.
 */
export declare class TasksFile {
    /**
     * Return the path to the file.
     */
    get path(): string;

    /**
     * Return all the tags in the file, both from frontmatter and the body of the file.
     *
     * - It adds the `#` prefix to tags in the frontmatter.
     * - It removes any duplicate tag values.
     * - For now, it includes any global filter that is a tag, if there are any tasks in the file
     *   that have the global filter. This decision will be reviewed later.
     */
    get tags(): string[];

    /**
     * Return an array of {@link Link} all the links in the file - both in frontmatter and in the file body.
     */
    get outlinks(): Readonly<Link[]>;

    /**
     * Return an array of {@link Link} in the file's properties/frontmatter.
     */
    get outlinksInProperties(): Readonly<Link[]>;

    /**
     * Return an array of {@link Link} in the body of the file.
     */
    get outlinksInBody(): Readonly<Link[]>;

    /**
     * Return the path to the file, with the filename extension removed.
     */
    get pathWithoutExtension(): string;

    /**
     * Return the root to the file.
     */
    get root(): string;
    get folder(): string;

    /**
     * Return the filename including the extension.
     */
    get filename(): string;
    get filenameWithoutExtension(): string;

    /**
     * This is documented for users and so must not be changed.
     * https://publish.obsidian.md/tasks/Getting+Started/Obsidian+Properties#How+does+Tasks+treat+Obsidian+Properties%3F
     * @param key
     */
    hasProperty(key: string): boolean;

    /**
     * This is documented for users and so must not be changed.
     * https://publish.obsidian.md/tasks/Getting+Started/Obsidian+Properties#How+does+Tasks+treat+Obsidian+Properties%3F
     * @param key
     */
    property(key: string): any;
}

export {};
