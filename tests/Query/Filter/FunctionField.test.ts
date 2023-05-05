/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
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
    afterEach(() => {
        jest.useRealTimers();
    });

    it('should support grouping', () => {
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

    it('using root and path', () => {
        const line = 'group by function root === "journal/" ? root : path';
        const field = new FunctionField();
        const grouper = field.createGrouperFromLine(line);
        expect(grouper).not.toBeNull();

        expect(grouper?.grouper(new TaskBuilder().path('journal/a/b').build())).toEqual(['journal/']);
        expect(grouper?.grouper(new TaskBuilder().path('hello/world/from-me.md').build())).toEqual([
            'hello/world/from-me',
        ]);
    });

    it('using path stripping folder', () => {
        const line = 'group by function path.replace("some/prefix/", "")';
        const field = new FunctionField();
        const grouper = field.createGrouperFromLine(line);
        expect(grouper).not.toBeNull();

        expect(grouper?.grouper(new TaskBuilder().path('a/b/c.md').build())).toEqual(['a/b/c']);
    });

    it('using due to group by month', () => {
        const line = 'group by function due ? "📅 " + due.format("YYYY-MM") : "no due date"';
        const field = new FunctionField();
        const grouper = field.createGrouperFromLine(line);
        expect(grouper).not.toBeNull();

        expect(grouper?.grouper(new TaskBuilder().build())).toEqual(['no due date']);
        expect(grouper?.grouper(new TaskBuilder().dueDate('2023-01-23').build())).toEqual(['📅 2023-01']);
    });

    it('using due to group by overdue', () => {
        const yesdyString = '2023-01-23';
        const todayString = '2023-01-24';
        const tomrwString = '2023-01-25';

        jest.useFakeTimers();
        jest.setSystemTime(new Date(todayString));

        const line =
            "group by function  (!due) ? 'No Due Date' : due.startOf('day').isBefore(moment().startOf('day')) ? 'Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? 'Future' : 'Today'";
        const field = new FunctionField();
        const grouper = field.createGrouperFromLine(line);
        expect(grouper).not.toBeNull();

        expect(grouper?.grouper(new TaskBuilder().dueDate(yesdyString).build())).toEqual(['Overdue']);
        expect(grouper?.grouper(new TaskBuilder().dueDate(todayString).build())).toEqual(['Today']);
        expect(grouper?.grouper(new TaskBuilder().dueDate(tomrwString).build())).toEqual(['Future']);
        expect(grouper?.grouper(new TaskBuilder().build())).toEqual(['No Due Date']);
    });
});
