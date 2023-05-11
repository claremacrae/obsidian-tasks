import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Grouper } from '../Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import { FolderField } from './FolderField';
import { HappensDateField } from './HappensDateField';
import { RootField } from './RootField';

export class FunctionField extends Field {
    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Searching by custom function not yet implemented');
    }

    fieldName(): string {
        return 'function';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public createGrouperFromLine(line: string): Grouper | null {
        if (!this.supportsGrouping()) {
            return null;
        }

        const match = Field.getMatch(this.grouperRegExp(), line);
        if (match === null) {
            return null;
        }
        const args = match[1];

        // I considered making grouper() take the line - so this can be consistent with other fields.
        // But since the vast majority of 'group by' instructions don't have any options,
        // it just made a load of test code much more complicated.
        return new Grouper('function', createGrouperFunctionFromLine(args));
    }

    protected grouperRegExp(): RegExp {
        if (!this.supportsGrouping()) {
            throw Error(`grouperRegExp() unimplemented for ${this.fieldNameSingular()}`);
        }

        return new RegExp(`^group by ${this.fieldNameSingularEscaped()} (.*)`);
    }

    /**
     * This method does not work for 'group by function' as the user's instruction line
     * is required in order to create the {@link GrouperFunction}.
     *
     * So this class overrides {@link createGrouperFromLine} instead.
     * @throws Error
     */
    public grouper(): GrouperFunction {
        throw Error('grouper() function not valid for FunctionField. Use createGrouperFromLine() instead.');
    }
}

function parameterArguments(task: Task) {
    // TODO Add this location to 'what to do when new field added to Task'
    const paramsArgs: [string, any][] = [
        ['created', task.createdDate],
        ['description', task.description],
        ['done', task.doneDate],
        ['due', task.dueDate],
        ['filename', task.filename],
        ['folder', FolderField.folder(task.path, task.filename!)],
        ['happens', new HappensDateField().earliestDate(task)],
        ['header', task.precedingHeader],
        ['indentation', task.indentation],
        ['markdown', task.originalMarkdown],
        ['path', task.path],
        ['priority', task.priority],
        ['recurrence', task.recurrence],
        ['root', new RootField().value(task)],
        ['scheduled', task.scheduledDate],
        ['start', task.startDate],
        ['status', task.status],
        ['tags', task.tags],
        ['urgency', task.urgency],
    ];
    return paramsArgs;
}

type GroupingArg = string | null;

function createGrouperFunctionFromLine(line: string): GrouperFunction {
    return (task: Task) => {
        return groupByFn(task, line);
    };
}

function groupByFn(task: Task, arg?: GroupingArg): string[] {
    const paramsArgs = parameterArguments(task);

    const params = paramsArgs.map(([p]) => p);
    const fullArg = arg?.includes('return') ? arg : `return ${arg}`;
    const groupBy = arg && new Function(...params, fullArg);

    if (groupBy instanceof Function) {
        const args = paramsArgs.map(([_, a]) => a);
        try {
            const result = groupBy(...args);
            const group =
                typeof result === 'string'
                    ? result
                    : `Error with group result: value type "${typeof result}" is not a string in "${arg}"`;
            return [group];
        } catch (error) {
            let errorMessage = `Error calculating group name "${arg}"`;
            if (error instanceof Error) {
                errorMessage += `: message was: ${error.message}`;
            }
            return [errorMessage];
        }
    } else {
        return [`Error parsing group function: ${arg}`];
    }
}
