/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import {
    FunctionField,
    createGrouperFromLine,
    createGrouperFunctionFromLine,
    groupByFn,
} from '../../../src/Query/Filter/FunctionField';
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

        expect(grouper?.grouper(new TaskBuilder().path('journal/a/b').build())).toEqual(['journal/']);
        expect(grouper?.grouper(new TaskBuilder().path('hello/world/from-me.md').build())).toEqual([
            'hello/world/from-me',
        ]);
    });
});

describe('lower level tests', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

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

    it('using due to group by month', () => {
        const line = 'due ? "📅 " + due.format("YYYY-MM") : "no due date"';
        expect(groupByFn(new TaskBuilder().build(), line)).toEqual(['no due date']);
        expect(groupByFn(new TaskBuilder().dueDate('2023-01-23').build(), line)).toEqual(['📅 2023-01']);
    });

    it('using due to group by overdue', () => {
        const yesdyString = '2023-01-23';
        const todayString = '2023-01-24';
        const tomrwString = '2023-01-25';

        jest.useFakeTimers();
        jest.setSystemTime(new Date(todayString));

        const line =
            "due.startOf('day').isBefore(moment().startOf('day')) ? 'Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? 'Future' : 'Today'";
        expect(groupByFn(new TaskBuilder().dueDate(yesdyString).build(), line)).toEqual(['Overdue']);
        expect(groupByFn(new TaskBuilder().dueDate(todayString).build(), line)).toEqual(['Today']);
        expect(groupByFn(new TaskBuilder().dueDate(tomrwString).build(), line)).toEqual(['Future']);
    });
});

describe('next level tests', () => {
    it('using path stripping folder', () => {
        const line = 'path.replace("some/prefix/", "")';
        const fn = createGrouperFunctionFromLine(line);
        const task = new TaskBuilder().path('a/b/c.md').build();
        expect(fn(task)).toEqual(['a/b/c']);
    });
});

describe('next again level tests', () => {
    it('using path stripping folder', () => {
        const line = 'path.replace("some/prefix/", "")';
        const grouper = createGrouperFromLine(line);
        const task = new TaskBuilder().path('a/b/c.md').build();
        expect(grouper?.grouper!(task)).toEqual(['a/b/c']);
    });
});
