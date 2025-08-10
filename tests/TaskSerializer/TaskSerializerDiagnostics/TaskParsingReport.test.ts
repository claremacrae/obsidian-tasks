/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { Priority } from '../../../src/Task/Priority';
import { createTaskParsingReport } from '../../../src/TaskSerializer/TaskSerializerDiagnostics/TaskParsingReport';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { verifyMarkdown } from '../../TestingTools/VerifyMarkdown';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-10T18:37:24.555Z'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('TaskParsingReport', () => {
    it('plain description', () => {
        const line = '- [ ] description';
        const report = createTaskParsingReport([line]);
        verifyMarkdown(report);
    });

    it('two simple fields', () => {
        const line = new TaskBuilder().priority(Priority.High).scheduledDate('2025-08-10').build().originalMarkdown;
        const report = createTaskParsingReport([line]);
        verifyMarkdown(report);
    });

    it('fully populated task', () => {
        const line = TaskBuilder.createFullyPopulatedTask().originalMarkdown;

        // The parsing code seems to require a line without block ID.
        // In a slightly hacky move, just remove it manually.
        const lineWithoutBlockID = line.replace(' ^dcf64c', '');
        expect(lineWithoutBlockID).not.toContain('^');

        const report = createTaskParsingReport([lineWithoutBlockID]);
        verifyMarkdown(report);
    });

    it('two tasks', () => {
        const lines = [
            '- [ ] task that does not show up 🔁 every day 🛫 2025-08-09',
            '- [ ] task that does show up 🛫 2025-08-09 🔁 every day',
        ];
        const report = createTaskParsingReport(lines);
        verifyMarkdown(report);
    });

    it('a non-task', () => {
        const line = 'i Am nOT a TaSk';
        const report = createTaskParsingReport([line]);
        verifyMarkdown(report);
    });
});
