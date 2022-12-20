import { StateField } from '../../../src/Query/Filter/StateField';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

function testStatusCharacterFilter(
    matchingStatusCharacter: string,
    nonMatchingStatusCharacter: string,
    instruction: string,
) {
    const filter = new StateField().createFilterOrErrorMessage(instruction);
    testFilter(filter, new TaskBuilder().originalStatusCharacter(matchingStatusCharacter), true);
    testFilter(filter, new TaskBuilder().originalStatusCharacter(nonMatchingStatusCharacter), false);
}

describe('state', () => {
    it('state - named states', () => {
        testStatusCharacterFilter(' ', '^', 'state is unchecked');
        testStatusCharacterFilter('!', '^', 'state is important');
        testStatusCharacterFilter('/', '^', 'state is half-done');
        testStatusCharacterFilter('>', '^', 'state is forwarded');
        testStatusCharacterFilter('d', '^', 'state is doing');
        testStatusCharacterFilter('-', '^', 'state is cancelled');
        testStatusCharacterFilter('x', '^', 'state is regular');
        testStatusCharacterFilter('X', '^', 'state is checked');
    });
});
