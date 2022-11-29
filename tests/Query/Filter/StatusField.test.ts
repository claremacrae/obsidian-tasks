import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { StatusField } from '../../../src/Query/Filter/StatusField';
import { Status } from '../../../src/Status';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

function testStatusFilter(filter: FilterOrErrorMessage, status: Status, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.status(status), expected);
}

function testStatusCharacterFilter(
    matchingStatusCharacter: string,
    nonMatchingStatusCharacter: string,
    instruction: string,
) {
    const filter = new StatusField().createFilterOrErrorMessage(instruction);
    testFilter(filter, new TaskBuilder().originalStatusCharacter(matchingStatusCharacter), true);
    testFilter(filter, new TaskBuilder().originalStatusCharacter(nonMatchingStatusCharacter), false);
}

describe('status', () => {
    it('done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('done');

        // Assert
        testStatusFilter(filter, Status.TODO, false);
        testStatusFilter(filter, Status.DONE, true);
    });

    it('not done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('not done');

        // Assert
        testStatusFilter(filter, Status.TODO, true);
        testStatusFilter(filter, Status.DONE, false);
    });

    it('status - named states', () => {
        testStatusCharacterFilter(' ', '^', 'status is unchecked');
        testStatusCharacterFilter('!', '^', 'status is important');
        testStatusCharacterFilter('/', '^', 'status is half-done');
        testStatusCharacterFilter('d', '^', 'status is doing');
        testStatusCharacterFilter('-', '^', 'status is cancelled');
    });
});
