import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Grouper } from '../Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
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

        return new Grouper('function', createGrouperFunctionFromLine(args));
    }

    protected grouperRegExp(): RegExp {
        if (!this.supportsGrouping()) {
            throw Error(`grouperRegExp() unimplemented for ${this.fieldNameSingular()}`);
        }

        return new RegExp(`^group by ${this.fieldNameSingularEscaped()} (.*)`);
    }

    public grouper(): GrouperFunction {
        return (_task: Task) => {
            return ['hello world'];
        };
    }
}

function parameterArguments(task: Task) {
    const paramsArgs: [string, any][] = [
        ['created', task.createdDate],
        ['description', task.description],
        ['done', task.doneDate],
        ['due', task.dueDate],
        ['filename', task.filename],
        ['happens', new HappensDateField().earliestDate(task)],
        ['header', task.precedingHeader],
        ['indentation', task.indentation],
        ['markdown', task.originalMarkdown],
        ['path', task.path.replace('.md', '')],
        ['priority', task.priority],
        ['recurrence', task.recurrence],
        ['root', new RootField().value(task)],
        ['scheduled', task.scheduledDate],
        ['scheduledDateIsInferred', task.scheduledDateIsInferred],
        ['start', task.startDate],
        ['status', task.status],
        ['t', task],
        ['tags', task.tags],
        ['task', task],
        ['urgency', task.urgency],
    ];
    return paramsArgs;
}

export type GroupingArg = string | null;

export function createGrouperFunctionFromLine(line: string): GrouperFunction {
    return (task: Task) => {
        return groupByFn(task, line);
    };
}

export function createGrouperFromLine(line: string): Grouper | null {
    return new Grouper('function', createGrouperFunctionFromLine(line));
}

export function groupByFn(task: Task, arg?: GroupingArg): string[] {
    const paramsArgs = parameterArguments(task);

    const params = paramsArgs.map(([p]) => p);
    const groupBy = arg && new Function(...params, `return ${arg}`);

    if (groupBy instanceof Function) {
        const args = paramsArgs.map(([_, a]) => a);
        const result = groupBy(...args);
        const group = typeof result === 'string' ? result : 'Error with group result';

        return [group];
    } else {
        return ['Error parsing group function'];
    }
}
