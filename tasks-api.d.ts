import { CachedMetadata } from 'obsidian';
import { FrontMatterCache } from 'obsidian';
import type { Reference } from 'obsidian';

export declare class Link {
    private readonly rawLink;
    private readonly pathContainingLink;
    /**
     * @param {Reference} rawLink - The raw link from Obsidian cache.
     * @param {string} pathContainingLink - The path of the file where this link is located.
     */
    constructor(rawLink: Reference, pathContainingLink: string);
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
 * A simple class to provide access to file information via 'task.file' in scripting code.
 */
declare class TasksFile {
    private readonly _path;
    private readonly _cachedMetadata;
    private readonly _frontmatter;
    private readonly _tags;
    private readonly _outlinksInProperties;
    private readonly _outlinksInBody;
    constructor(path: string, cachedMetadata?: CachedMetadata);
    private createLinks;
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
     *
     * @todo Review presence of global filter tag in the results.
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
     * Return Obsidian's [CachedMetadata](https://docs.obsidian.md/Reference/TypeScript+API/CachedMetadata)
     * for this file, if available.
     *
     * Any raw frontmatter may be accessed via `cachedMetadata.frontmatter`.
     * See [FrontMatterCache](https://docs.obsidian.md/Reference/TypeScript+API/FrontMatterCache).
     * But prefer using {@link frontmatter} where possible.
     *
     * @note This is currently only populated for Task objects when read in the Obsidian plugin,
     *       and queries in the plugin.
     *       It's not populated in most unit tests.
     *       If not available, it returns an empty object, {}.
     *
     * @see frontmatter, which provides a cleaned-up version of the raw frontmatter.
     */
    get cachedMetadata(): CachedMetadata;
    /**
     * Returns a cleaned-up version of the frontmatter.
     *
     * If accessing tags, please note:
     * - If there are any tags in the frontmatter, `frontmatter.tags` will have the values with '#' prefix added.
     * - It recognises both `frontmatter.tags` and `frontmatter.tag` (and various capitalisation combinations too).
     * - It removes any null tags.
     *
     * @note This is currently only populated for Task objects when read in the Obsidian plugin.
     *       It's not populated for queries in the plugin, nor in most unit tests.
     *       And it is an empty object, {}, if the {@link cachedMetadata} has not been populated
     *       or if the markdown file has no frontmatter or empty frontmatter.
     */
    get frontmatter(): FrontMatterCache;
    /**
     * Does the data content of another TasksFile's raw frontmatter
     * match this one.
     *
     * This can be used to detect whether Task objects need to be updated,
     * or (later) whether queries need to be updated, due to user edits.
     *
     * @param other
     */
    rawFrontmatterIdenticalTo(other: TasksFile): boolean;
    /**
     * Return the path to the file, with the filename extension removed.
     */
    get pathWithoutExtension(): string;
    private withoutExtension;
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
    private findKeyInFrontmatter;
    /**
     * Compare all the fields in another TasksFile, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * @param other
     */
    identicalTo(other: TasksFile): boolean;
}

export {};
