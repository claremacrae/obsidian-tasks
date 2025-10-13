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
     * @see nextSymbol
     */
    get nextStatusSymbol(): string;
    /**
     * Returns the next status for a task when toggled.
     * This is an alias for {@link nextStatusSymbol} which is provided for brevity in user scripts.
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
    /**
     * Creates an instance of Status. The registry will be added later in the case
     * of the default statuses.
     *
     * @param {StatusConfiguration} configuration
     */
    constructor(configuration: StatusConfiguration);
    /**
     * Return the StatusType to use for a symbol, if it is not in the StatusRegistry.
     * The core symbols are recognised.
     * Other symbols are treated as StatusType.TODO
     * @param symbol
     */
    static getTypeForUnknownSymbol(symbol: string): StatusType;
    /**
     * Convert text that was saved from a StatusType value back to a StatusType.
     * Returns StatusType.TODO if the string is not valid.
     * @param statusTypeAsString
     */
    static getTypeFromStatusTypeString(statusTypeAsString: string): StatusType;
    /**
     * Create a Status representing the given, unknown symbol.
     *
     * This can be useful when StatusRegistry does not recognise a symbol,
     * and we do not want to expose the user's data to the Status.EMPTY status.
     *
     * The type is set to TODO.
     * @param unknownSymbol
     */
    static createUnknownStatus(unknownSymbol: string): Status;
    /**
     * Helper function for bulk-importing settings from arrays of strings.
     *
     * @param imported An array of symbol, name, next symbol, status type
     */
    static createFromImportedValue(imported: StatusCollectionEntry): Status;
    /**
     * Returns the completion status for a task, this is only supported
     * when the task is done/x.
     *
     * @return {*}  {boolean}
     */
    isCompleted(): boolean;
    /**
     * Whether the task status type is {@link CANCELLED}.
     */
    isCancelled(): boolean;
    /**
     * Compare all the fields in another Status, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * @param other
     */
    identicalTo(other: Status): boolean;
    /**
     * Return a one-line summary of the status, for presentation to users.
     */
    previewText(): string;
    /**
     * Whether Tasks can yet create 'Toggle Status' commands for statuses
     *
     * This is not yet possible, and so some UI features are temporarily hidden.
     * See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1486
     * Once that issue is addressed, this method can be removed.
     */
    static tasksPluginCanCreateCommandsForStatuses(): boolean;
}

/**
 * The type used for a single entry in bulk imports of pre-created sets of statuses, such as for Themes or CSS Snippets.
 * The values are: symbol, name, next symbol, status type (must be one of the values in {@link StatusType}
 */
declare type StatusCollectionEntry = [string, string, string, string];

/**
 * This is the object stored by the Obsidian configuration and used to create the status
 * objects for the session
 *
 * @class StatusConfiguration
 */
declare class StatusConfiguration {
    /**
     * The character used between the two square brackets in the markdown task.
     *
     * @type {string}
     */
    readonly symbol: string;
    /**
     * Returns the name of the status for display purposes.
     *
     * @type {string}
     */
    readonly name: string;
    /**
     * Returns the next status for a task when toggled.
     *
     * @type {string}
     */
    readonly nextStatusSymbol: string;
    /**
     * If true then it is registered as a command that the user can map to.
     *
     * @type {boolean}
     */
    readonly availableAsCommand: boolean;
    /**
     * Returns the status type. See {@link StatusType} for details.
     */
    readonly type: StatusType;
    /**
     * Creates an instance of Status. The registry will be added later in the case
     * of the default statuses.
     *
     * @param {string} symbol
     * @param {string} name
     * @param {Status} nextStatusSymbol
     * @param {boolean} availableAsCommand
     * @param {StatusType} type
     */
    constructor(symbol: string, name: string, nextStatusSymbol: string, availableAsCommand: boolean, type?: StatusType);
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

export {};
