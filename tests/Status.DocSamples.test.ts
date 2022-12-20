import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { TaskStates } from '../src/Status';

describe('TaskStates', () => {
    it('markdown-table', () => {
        let commandsTable = '';
        commandsTable +=
            "| Character           | SlrVb's description | Treated As | Query to find in Tasks | Query to exclude in Tasks  |\n";
        commandsTable +=
            '| ------------------- | ------------------- | ---------- | ---------------------- | -------------------------- |\n';
        for (const state of TaskStates.states) {
            const statusCharacter = state.statusCharacter !== ' ' ? state.statusCharacter : 'space';
            commandsTable += `| \`${statusCharacter}\` | ${state.displayName} | ${
                state.status
            } | \`${state.presenceCommand()}\` | \`${state.absenceCommand()}\` |\n`;
        }
        let options = new Options();
        options = options.forFile().withFileExtention('md');
        verify(commandsTable, options);
    });
});
