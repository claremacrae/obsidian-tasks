import { readFileSync } from 'fs';
import { findLineNumberOfTaskToToggle } from '../src/File';
import type { PickledDataForTesting } from '../src/File';

function testFindLineNumberOfTaskToToggle(
    jsonFileName: string,
    taskLineToToggle: string,
    expectedLineNumber: number | undefined,
    actualIncorrectLineFound?: string,
) {
    // Arrange
    const data = readFileSync('tests/__test_data__/PickledDataForTogglingTasks/' + jsonFileName, 'utf-8');
    const everything: PickledDataForTesting = JSON.parse(data);
    expect(everything.taskData.originalMarkdown).toEqual(taskLineToToggle);

    // Act
    const result = findLineNumberOfTaskToToggle(everything);

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
    it.failing('should find line for block referenced task - issue 688', () => {
        const jsonFileName = '688_toggle_block_referenced_line_overwrites_wrong_line.json';
        const taskLineToToggle = '- [ ] #task task2b ^ca47c7';
        // An incorrect line is currently found, so this test fails, due to bug 688
        const expectedLineNumber = 10;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    it('should find line for block referenced task - issue 688 - CURRENT BEHAVIOUR - WRONG RESULTS', () => {
        const jsonFileName = '688_toggle_block_referenced_line_overwrites_wrong_line.json';
        const taskLineToToggle = '- [ ] #task task2b ^ca47c7';
        // An incorrect line is currently found, so this test fails, due to bug 688
        const expectedLineNumber = 4;
        const actualIncorrectLineFound = '- [ ] #task task1a';
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber, actualIncorrectLineFound);
    });

    // --------------------------------------------------------------------------------
    // when cache is out of date
    it.failing('should not overwrite wrong line when cache is out of date', () => {
        const jsonFileName = 'cache_is_out_of_date.json';
        const taskLineToToggle = '- [ ] #task Heading 2/Task 1';
        const expectedLineNumber = 15;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    it('should not overwrite wrong line when cache is out of date - CURRENT BEHAVIOUR - WRONG RESULTS', () => {
        const jsonFileName = 'cache_is_out_of_date.json';
        const taskLineToToggle = '- [ ] #task Heading 2/Task 1';
        const expectedLineNumber = 10;
        /*
        expected:
        - [ ] #task Heading 2/Task 1
        found:
        - [ ] #task Heading 1/Task 1
         */
        const actualIncorrectLineFound = '- [ ] #task Heading 1/Task 1';
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber, actualIncorrectLineFound);
    });

    // --------------------------------------------------------------------------------
    // when line does not exist - as the task had been toggled already,
    // and the task in reading view had not yet been updated with the new markdown line.
    it.failing('should not overwrite wrong line when line does not exist', () => {
        const jsonFileName = 'line_does_not_exist.json';
        const taskLineToToggle = '- [ ] #task y';
        const expectedLineNumber = undefined;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    it('should not overwrite wrong line when line does not exist - CURRENT BEHAVIOUR - WRONG RESULTS', () => {
        const jsonFileName = 'line_does_not_exist.json';
        const taskLineToToggle = '- [ ] #task y';
        const expectedLineNumber = 1;
        const actualIncorrectLineFound = '- [x] #task y ✅ 2023-02-27';
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber, actualIncorrectLineFound);
    });
    // --------------------------------------------------------------------------------
});

// Indented a line:
/*
Inconsistent lines: SAVE THE OUTPUT
expected:
    - [ ] #task task2c
found:
- [ ] #task task2c
result: 12
data:
{"taskData":{"originalMarkdown":"    - [ ] #task task2c","path":"Manual Testing/Task Toggling Scenarios/Embed Task in to Note.md","precedingHeader":null,"sectionStart":10,"sectionIndex":2},"fileData":{"fileLines":["# Embed Task in to Note","","## Category 1","","- [x] #task task2b ✅ 2023-02-27 ^ca47c7","- [ ] #task task1b","- [ ] #task task1c","","## Category 2","","- [ ] #task task2a","- [ ] #task task2b ^ca47c7","- [ ] #task task2c","","","## The embedded tasks","","- ref task2 ![[#^ca47c7]]",""]},"cacheData":{"listItemsCache":[{"position":{"start":{"line":4,"col":0,"offset":40},"end":{"line":4,"col":39,"offset":79}},"task":"x"},{"position":{"start":{"line":5,"col":0,"offset":80},"end":{"line":5,"col":18,"offset":98}},"task":" "},{"position":{"start":{"line":6,"col":0,"offset":99},"end":{"line":6,"col":18,"offset":117}},"task":" "},{"position":{"start":{"line":10,"col":0,"offset":134},"end":{"line":10,"col":18,"offset":152}},"task":" "},{"position":{"start":{"line":11,"col":0,"offset":153},"end":{"line":11,"col":26,"offset":179}},"task":" "},{"position":{"start":{"line":12,"col":0,"offset":180},"end":{"line":12,"col":18,"offset":198}},"task":" "},{"position":{"start":{"line":17,"col":0,"offset":224},"end":{"line":17,"col":25,"offset":249}}}]}}
 */
