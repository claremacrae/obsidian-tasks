import { readFileSync } from 'fs';
import { findLineNumberOfTaskToToggle } from '../src/File';
import type { PickledDataForTesting } from '../src/File';

function testFindLineNumberOfTaskToToggle(jsonFileName: string, taskLineToToggle: string, expectedLineNumber: number) {
    // Arrange
    const data = readFileSync('tests/__test_data__/PickledDataForTogglingTasks/' + jsonFileName, 'utf-8');
    const everything: PickledDataForTesting = JSON.parse(data);
    expect(everything.taskData.originalMarkdown).toEqual(taskLineToToggle);

    // Act
    const result = findLineNumberOfTaskToToggle(everything);

    // Assert
    expect(result).not.toBeUndefined();
    expect(result).toEqual(expectedLineNumber);
    expect(everything.fileData.fileLines[result!]).toEqual(everything.taskData.originalMarkdown);
}

describe('File findLineNumberOfTaskToToggle()', () => {
    it('should find single task to test, when data is self consistent', () => {
        const jsonFileName = 'single_task_valid_data.json';
        const taskLineToToggle = '- [ ] #task Task 1';
        const expectedLineNumber = 2;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    it.failing('should find line for block referenced task - issue 688', () => {
        const jsonFileName = '688_toggle_block_referenced_line_overwrites_wrong_line.json';
        const taskLineToToggle = '- [ ] #task task2b ^ca47c7';
        // An incorrect line is currently found, so this test fails, due to bug 688
        const expectedLineNumber = 10;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });
});

/*
Inconsistent lines: SAVE THE OUTPUT
expected:
- [ ] #task y
found:
- [x] #task y ✅ 2023-02-27
result: 1
data:
{"taskData":{"originalMarkdown":"- [ ] #task y","path":"2.task.md","precedingHeader":null,"sectionStart":0,"sectionIndex":1},"fileData":{"fileLines":["- [ ] #task x","- [x] #task y ✅ 2023-02-27",""]},"cacheData":{"listItemsCache":[{"position":{"start":{"line":0,"col":0,"offset":0},"end":{"line":0,"col":13,"offset":13}},"task":" "},{"position":{"start":{"line":1,"col":0,"offset":14},"end":{"line":1,"col":26,"offset":40}},"task":"x"}]}}

 */

/*
Inconsistent lines: SAVE THE OUTPUT
expected:
- [ ] #task Heading 2/Task 1
found:
- [ ] #task Heading 1/Task 1
result: 10
data:
{"taskData":{"originalMarkdown":"- [ ] #task Heading 2/Task 1","path":"2.task.md","precedingHeader":null,"sectionStart":9,"sectionIndex":0},"fileData":{"fileLines":["# 2 Headings","","","","","","","","## Heading 1","","- [ ] #task Heading 1/Task 1","- [ ] #task Heading 1/Task 2","","## Heading 2","","- [ ] #task Heading 2/Task 1","- [ ] #task Heading 2/Task 2",""]},"cacheData":{"listItemsCache":[{"position":{"start":{"line":10,"col":0,"offset":34},"end":{"line":10,"col":28,"offset":62}},"task":" "},{"position":{"start":{"line":11,"col":0,"offset":63},"end":{"line":11,"col":28,"offset":91}},"task":" "},{"position":{"start":{"line":15,"col":0,"offset":107},"end":{"line":15,"col":28,"offset":135}},"task":" "},{"position":{"start":{"line":16,"col":0,"offset":136},"end":{"line":16,"col":28,"offset":164}},"task":" "}]}}
 */

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
