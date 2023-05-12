/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import type { Grouper } from '../../../src/Query/Grouper';
import type { Task } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - filtering', () => {
    it('should not parse line', () => {
        const functionField = new FunctionField();
        const filterOrErrorMessage = functionField.createFilterOrErrorMessage('hello world');
        expect(filterOrErrorMessage).not.toBeValid();
        expect(filterOrErrorMessage.error).toStrictEqual('Searching by custom function not yet implemented');
    });
});

// -----------------------------------------------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - sorting', () => {
    it('should not support sorting', () => {
        const functionField = new FunctionField();
        expect(functionField.supportsSorting()).toEqual(false);
    });
});

// -----------------------------------------------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------------------------------------------

function toGroupTask(grouper: Grouper | null, task: Task, expectedGroupNames: string[]) {
    if (grouper === undefined) {
        return {
            message: () => 'unexpected null grouper: check your instruction matches your filter class.',
            pass: false,
        };
    }

    expect(grouper!.grouper(task)).toEqual(expectedGroupNames);
}

function toGroupTaskFromBuilder(grouper: Grouper | null, taskBuilder: TaskBuilder, expectedGroupNames: string[]) {
    const task = taskBuilder.build();
    toGroupTask(grouper, task, expectedGroupNames);
}

function toGroupTaskWithPath(grouper: Grouper | null, path: string, expectedGroupNames: string[]) {
    const taskBuilder = new TaskBuilder().path(path);
    toGroupTaskFromBuilder(grouper, taskBuilder, expectedGroupNames);
}

function toGroupTaskWithDueDate(grouper: Grouper | null, due: string, expectedGroupNames: string[]) {
    const taskBuilder = new TaskBuilder().dueDate(due);
    toGroupTaskFromBuilder(grouper, taskBuilder, expectedGroupNames);
}

afterEach(() => {
    jest.useRealTimers();
});

function createGrouper(line: string) {
    const grouper = new FunctionField().createGrouperFromLine(line);
    expect(grouper).not.toBeNull();
    return grouper;
}

describe('FunctionField - grouping - basics', () => {
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
        expect(grouper?.reverse).toEqual(false);
    });

    it('should parse "group by function reverse" line', () => {
        // Arrange
        const field = new FunctionField();
        const instruction = 'group by function reverse root === "journal/" ? root : path';

        // Assert
        expect(field.canCreateGrouperForLine(instruction)).toEqual(true);
        const grouper = field.createGrouperFromLine(instruction);
        expect(grouper).not.toBeNull();
        expect(grouper?.reverse).toEqual(true);
    });

    it('experiment with functions in string', () => {
        expect(new Function('return "hello"')()).toEqual('hello');
        expect(new Function('if (1 === 1) { return "yes"; } else { return "no"; }')()).toEqual('yes');
        expect(new Function('if (1 !== 1) { return "yes"; } else { return "no"; }')()).toEqual('no');

        // Can define a function
        // JavasScript, not TypeScript - cannot specify parameter and return times
        const line = `
        function f(value) {
            if (value === 1 ) {
                return "yes";
            } else {
                return "no";
            }
        }
        return f(1)`;
        expect(new Function(line)()).toEqual('yes');
    });
});

describe('FunctionField - grouping - error-handling', () => {
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

    it('should throw in grouper()', () => {
        // It's not possible to create a GrouperFunction without a line,
        // so grouper() method needs to throw and report it cannot work.
        const field = new FunctionField();
        const t = () => {
            field.grouper();
        };
        expect(t).toThrow(Error);
    });
});

describe('FunctionField - grouping - example functions', () => {
    it('using root and path', () => {
        const line = 'group by function root === "journal/" ? root : path';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'journal/a/b', ['journal/']);
        toGroupTaskWithPath(grouper, 'hello/world/from-me.md', ['hello/world/from-me.md']);
        // TODO Test file in root folder
    });

    const yesdyString = '2023-01-23';
    const todayString = '2023-01-24';
    const tomrwString = '2023-01-25';
    const invalString = '2023-02-31';

    it('using path stripping folder', () => {
        const line = 'group by function path.replace("some/prefix/", "")';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'a/b/c.md', ['a/b/c.md']);
    });

    it('using folder stripping folder', () => {
        const line = 'group by function folder.replace("a/", "")';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'a/b/c.md', ['b/']);
    });

    it('using due to group by month - checking for no date', () => {
        const line = 'group by function due ? "📅 " + due.format("YYYY-MM") : "no due date"';
        const grouper = createGrouper(line);

        toGroupTaskFromBuilder(grouper, new TaskBuilder(), ['no due date']);
        toGroupTaskWithDueDate(grouper, '2023-01-23', ['📅 2023-01']);
        toGroupTaskWithDueDate(grouper, invalString, ['📅 Invalid date']);
    });

    it('using due to group by month - not checking for no date', () => {
        const line = 'group by function due.format("YYYY-MM")';
        const grouper = createGrouper(line);

        toGroupTaskFromBuilder(grouper, new TaskBuilder(), [
            'Error calculating group name "due.format("YYYY-MM")": message was: Cannot read properties of null (reading \'format\')',
        ]);
        toGroupTaskWithDueDate(grouper, '2023-01-23', ['2023-01']);
        toGroupTaskWithDueDate(grouper, invalString, ['Invalid date']);
    });

    it('using due to group by overdue - with ternary operators', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(todayString));

        const line =
            "group by function  (!due) ? 'No Due Date' : (!due.isValid()) ? 'Invalid Due Date' : due.startOf('day').isBefore(moment().startOf('day')) ? 'Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? 'Future' : 'Today'";
        const grouper = createGrouper(line);

        toGroupTaskWithDueDate(grouper, yesdyString, ['Overdue']);
        toGroupTaskWithDueDate(grouper, todayString, ['Today']);
        toGroupTaskWithDueDate(grouper, tomrwString, ['Future']);
        toGroupTaskWithDueDate(grouper, invalString, ['Invalid Due Date']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), ['No Due Date']);
    });

    it('using due to group by overdue - as if block', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(todayString));

        const line =
            "group by function if (!due) return 'No Due Date'; if (!due.isValid()) return 'Invalid Due Date'; if (due.startOf('day').isBefore(moment().startOf('day'))) return 'Overdue'; if (due.startOf('day').isAfter(moment().startOf('day'))) return 'Future'; return 'Today'";
        const grouper = createGrouper(line);

        toGroupTaskWithDueDate(grouper, yesdyString, ['Overdue']);
        toGroupTaskWithDueDate(grouper, todayString, ['Today']);
        toGroupTaskWithDueDate(grouper, tomrwString, ['Future']);
        toGroupTaskWithDueDate(grouper, invalString, ['Invalid Due Date']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), ['No Due Date']);
    });

    it('using due to group by overdue - with emoji - written with ifs and returns', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(todayString));

        const line =
            "group by function if (!due)  { return '📅 4 No Due Date'; } else { return  '📅 ' + due.format('YYYY-MM-DD ddd'); }";
        const grouper = createGrouper(line);

        toGroupTaskWithDueDate(grouper, yesdyString, ['📅 2023-01-23 Mon']);
        toGroupTaskWithDueDate(grouper, todayString, ['📅 2023-01-24 Tue']);
        toGroupTaskWithDueDate(grouper, tomrwString, ['📅 2023-01-25 Wed']);
        toGroupTaskWithDueDate(grouper, invalString, ['📅 Invalid date']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), ['📅 4 No Due Date']);
    });
});
