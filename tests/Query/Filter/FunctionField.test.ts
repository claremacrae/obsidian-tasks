/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { RootField } from '../../../src/Query/Filter/RootField';
import type { Task } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

describe('FunctionField - filter', () => {
    it('should not parse line', () => {
        const functionField = new FunctionField();
        const filterOrErrorMessage = functionField.createFilterOrErrorMessage('hello world');
        expect(filterOrErrorMessage).not.toBeValid();
        expect(filterOrErrorMessage.error).toStrictEqual('Searching by custom function not yet implemented');
    });
});

describe('FunctionField - sorting', () => {
    it('should not support sorting', () => {
        const functionField = new FunctionField();
        expect(functionField.supportsSorting()).toEqual(false);
    });
});

describe('FunctionField - grouping', () => {
    it('should support sorting', () => {
        const field = new FunctionField();
        expect(field.supportsGrouping()).toEqual(true);
    });

    it('should parse "group by function" line', () => {
        // Arrange
        const field = new FunctionField();
        const instruction = 'group by function root === "journal/" ? root : path';

        // Assert
        expect(field.canCreateGrouperForLine(instruction)).toEqual(true);
        const grouper = field.createGrouperFromLine(instruction);
        expect(grouper).not.toBeNull();

        const task = new TaskBuilder().build();
        expect(grouper?.grouper(task)).toEqual(['hello world']);
    });
});

export type GroupingArg = string | null;

function groupByFn(task: Task, arg?: GroupingArg): string[] {
    const paramsArgs: [string, any][] = [
        ['description', task.description],
        ['done', task.doneDate],
        ['due', task.dueDate],
        ['filename', task.filename],
        ['happens', new HappensDateField().earliestDate(task)],
        ['header', task.precedingHeader],
        ['markdown', task.originalMarkdown],
        ['path', task.path.replace('.md', '')],
        ['priority', task.priority],
        ['recurrence', task.recurrence],
        ['root', new RootField().value(task)],
        ['scheduled', task.scheduledDate],
        ['start', task.startDate],
        ['status', task.status],
        ['t', task],
        ['tags', task.tags],
        ['task', task],
        ['urgency', task.urgency],
    ];

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

describe('lower level tests', () => {
    it('using root and path', () => {
        const line = 'root === "journal/" ? root : path';
        expect(groupByFn(new TaskBuilder().path('journal/a/b').build(), line)).toEqual(['journal/']);
        expect(groupByFn(new TaskBuilder().path('hello/world/from-me.md').build(), line)).toEqual([
            'hello/world/from-me',
        ]);
    });

    it('using path stripping folder', () => {
        const line = 'path.replace("some/prefix/", "")';
        expect(groupByFn(new TaskBuilder().path('a/b/c.md').build(), line)).toEqual(['a/b/c']);
    });

    it('using due', () => {
        const line = 'due ? due.format("YYYY-MM") : "no due date"';
        expect(groupByFn(new TaskBuilder().build(), line)).toEqual(['no due date']);
        expect(groupByFn(new TaskBuilder().dueDate('2023-01-23').build(), line)).toEqual(['2023-01']);
    });
});
