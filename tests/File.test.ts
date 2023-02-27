import { findLineNumberOfTaskToToggle } from '../src/File';

describe('File findLineNumberOfTaskToToggle()', () => {
    it('should find single task to test, when data is self consistent', () => {
        // Arrange
        const data =
            '{"taskData":{"originalMarkdown":"- [ ] #task Task 1","path":"1 task.md","precedingHeader":null,"sectionStart":2,"sectionIndex":0},"fileData":{"fileLines":["# 1 task","","- [ ] #task Task 1",""]},"cacheData":{"listItemsCache":[{"position":{"start":{"line":2,"col":0,"offset":10},"end":{"line":2,"col":18,"offset":28}},"task":" "}]}}';
        const everything = JSON.parse(data);

        // Act
        const result = findLineNumberOfTaskToToggle(everything);

        // Assert
        expect(result).not.toBeNull();
        expect(result).toEqual(2);
    });
});
