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
    it('should generate a report for one line', () => {
        const line = new TaskBuilder().priority(Priority.High).scheduledDate('2025-08-10').build().originalMarkdown;
        const report = createTaskParsingReport([line]);
        verifyMarkdown(report);
    });

    it('fully populated task', () => {
        const line = TaskBuilder.createFullyPopulatedTask().originalMarkdown.replace(' ^dcf64c', '');
        const report = createTaskParsingReport([line]);
        verifyMarkdown(report);
    });
});
