/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

describe('FunctionField - filtering', () => {
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

    function createGrouper(line: string) {
        const grouper = new FunctionField().createGrouperFromLine(line);
        expect(grouper).not.toBeNull();
        return grouper;
    }

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
    });

    it('should give meaningful message for invalid group source', () => {
        const line = 'group by function abcdef';
        const grouper = createGrouper(line);

        const task = new TaskBuilder().build();
        const groupNames = grouper?.grouper(task);
        expect(groupNames?.length).toStrictEqual(1);
        expect(groupNames![0]).toStrictEqual(
            'Error calculating group name "abcdef": message was: abcdef is not defined',
        );
    });

    it('should give meaningful message for non-string return type', () => {
        const line = 'group by function due';
        const grouper = createGrouper(line);

        const task = new TaskBuilder().build();
        const groupNames = grouper?.grouper(task);
        expect(groupNames?.length).toStrictEqual(1);
        expect(groupNames![0]).toStrictEqual('Error with group result: value type "object" is not a string in "due"');
    });

    it('using root and path', () => {
        const line = 'group by function root === "journal/" ? root : path';
        const grouper = createGrouper(line);

        expect(grouper?.grouper(new TaskBuilder().path('journal/a/b').build())).toEqual(['journal/']);
        expect(grouper?.grouper(new TaskBuilder().path('hello/world/from-me.md').build())).toEqual([
            'hello/world/from-me',
        ]);
        // TODO Test file in root folder
    });

    it('using path stripping folder', () => {
        const line = 'group by function path.replace("some/prefix/", "")';
        const grouper = createGrouper(line);

        expect(grouper?.grouper(new TaskBuilder().path('a/b/c.md').build())).toEqual(['a/b/c']);
    });

    it('using folder stripping folder', () => {
        const line = 'group by function folder.replace("a/", "")';
        const grouper = createGrouper(line);

        expect(grouper?.grouper(new TaskBuilder().path('a/b/c.md').build())).toEqual(['b/']);
    });

    it('using due to group by month', () => {
        const line = 'group by function due ? "📅 " + due.format("YYYY-MM") : "no due date"';
        const grouper = createGrouper(line);

        expect(grouper?.grouper(new TaskBuilder().build())).toEqual(['no due date']);
        expect(grouper?.grouper(new TaskBuilder().dueDate('2023-01-23').build())).toEqual(['📅 2023-01']);
    });

    it('using due to group by overdue', () => {
        const yesdyString = '2023-01-23';
        const todayString = '2023-01-24';
        const tomrwString = '2023-01-25';

        jest.useFakeTimers();
        jest.setSystemTime(new Date(todayString));

        // TODO Can this be written as in if block - or a function
        // TODO Really need to make this simpler to write
        const line =
            "group by function  (!due) ? 'No Due Date' : due.startOf('day').isBefore(moment().startOf('day')) ? 'Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? 'Future' : 'Today'";
        const grouper = createGrouper(line);

        expect(grouper?.grouper(new TaskBuilder().dueDate(yesdyString).build())).toEqual(['Overdue']);
        expect(grouper?.grouper(new TaskBuilder().dueDate(todayString).build())).toEqual(['Today']);
        expect(grouper?.grouper(new TaskBuilder().dueDate(tomrwString).build())).toEqual(['Future']);
        expect(grouper?.grouper(new TaskBuilder().build())).toEqual(['No Due Date']);
        // What about invalid date - groups as Today
    });
});
