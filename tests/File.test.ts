import { readFileSync } from 'fs';
import { findLineNumberOfTaskToToggle } from '../src/File';
import type { MockTogglingDataForTesting } from '../src/lib/MockDataCreator';

function testFindLineNumberOfTaskToToggle(
    jsonFileName: string,
    taskLineToToggle: string,
    expectedLineNumber: number | undefined,
    actualIncorrectLineFound?: string,
) {
    // Arrange
    const data = readFileSync('tests/__test_data__/MockDataForTogglingTasks/' + jsonFileName, 'utf-8');
    const everything: MockTogglingDataForTesting = JSON.parse(data);
    expect(everything.taskData.originalMarkdown).toEqual(taskLineToToggle);

    // Act
    const originalTask = everything.taskData;
    const fileLines = everything.fileData.fileLines;
    const listItemsCache = everything.cacheData.listItemsCache;

    const result = findLineNumberOfTaskToToggle(originalTask, fileLines, listItemsCache);

    // Assert
    if (expectedLineNumber !== undefined) {
        expect(result).not.toBeUndefined();
        expect(result).toEqual(expectedLineNumber);

        const expectedLine = actualIncorrectLineFound ? actualIncorrectLineFound : everything.taskData.originalMarkdown;
        expect(everything.fileData.fileLines[result!]).toEqual(expectedLine);
    } else {
        expect(result).toBeUndefined();
    }
}

describe('File findLineNumberOfTaskToToggle()', () => {
    it('should find single task to test, when data is self consistent', () => {
        const jsonFileName = 'single_task_valid_data.json';
        const taskLineToToggle = '- [ ] #task Task 1';
        const expectedLineNumber = 2;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    // --------------------------------------------------------------------------------
    // Issue 688
    describe('should find line for block referenced task - issue 688', () => {
        const jsonFileName = '688_toggle_block_referenced_line_overwrites_wrong_line.json';
        const taskLineToToggle = '- [ ] #task task2b ^ca47c7';

        it.failing('should show the intended behaviour', () => {
            // An incorrect line is currently found, so this test fails, due to bug 688
            const expectedLineNumber = 10;
            testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
        });

        it('current behaviour - wrong results', () => {
            // An incorrect line is currently found, so this test fails, due to bug 688
            const expectedLineNumber = 4;
            const actualIncorrectLineFound = '- [ ] #task task1a';
            testFindLineNumberOfTaskToToggle(
                jsonFileName,
                taskLineToToggle,
                expectedLineNumber,
                actualIncorrectLineFound,
            );
        });
    });

    // --------------------------------------------------------------------------------
    // when cache is out of date
    describe('should not overwrite wrong line when cache is out of date', () => {
        const jsonFileName = 'cache_is_out_of_date.json';
        const taskLineToToggle = '- [ ] #task Heading 2/Task 1';

        it.failing('should show the intended behaviour', () => {
            const expectedLineNumber = 15;
            testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
        });

        it('current behaviour - wrong results', () => {
            const expectedLineNumber = 10;
            /*
            expected:
            - [ ] #task Heading 2/Task 1
            found:
            - [ ] #task Heading 1/Task 1
             */
            const actualIncorrectLineFound = '- [ ] #task Heading 1/Task 1';
            testFindLineNumberOfTaskToToggle(
                jsonFileName,
                taskLineToToggle,
                expectedLineNumber,
                actualIncorrectLineFound,
            );
        });
    });

    // --------------------------------------------------------------------------------
    // when line does not exist - as the task had been toggled already,
    // and the task in reading view had not yet been updated with the new markdown line.
    describe('should not overwrite wrong line when line does not exist', () => {
        const jsonFileName = 'line_does_not_exist.json';
        const taskLineToToggle = '- [ ] #task y';

        it.failing('should show the intended behaviour', () => {
            const expectedLineNumber = undefined;
            testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
        });

        it('current behaviour - wrong results', () => {
            const expectedLineNumber = 1;
            const actualIncorrectLineFound = '- [x] #task y ✅ 2023-02-27';
            testFindLineNumberOfTaskToToggle(
                jsonFileName,
                taskLineToToggle,
                expectedLineNumber,
                actualIncorrectLineFound,
            );
        });
    });

    // --------------------------------------------------------------------------------
    // when line does not exist - as the task had been toggled already,
    // and the task in reading view had not yet been updated with the new markdown line.
    describe('should not overwrite unindented line', () => {
        const jsonFileName = 'line_was_indented_and_cache_not_yet_updated.json';
        const taskLineToToggle = '    - [ ] #task task2c';

        it.failing('should show the intended behaviour', () => {
            const expectedLineNumber = undefined;
            testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
        });

        it('current behaviour - wrong results', () => {
            const expectedLineNumber = 12;
            const actualIncorrectLineFound = '- [ ] #task task2c';
            testFindLineNumberOfTaskToToggle(
                jsonFileName,
                taskLineToToggle,
                expectedLineNumber,
                actualIncorrectLineFound,
            );
        });
    });
    // --------------------------------------------------------------------------------
});
