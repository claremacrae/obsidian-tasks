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
