/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { snoozeTaskToFutureDate, snoozeTaskViaToday } from '../src/Snooze';
import { TaskBuilder } from './TestingTools/TaskBuilder';

window.moment = moment;

describe('Snooze', () => {
    const today = '2023-02-15';
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(today));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('snoozeTaskViaToday(..., 1) should snooze a task due today to next day', () => {
        const task = new TaskBuilder().dueDate(today).build();
        expect(snoozeTaskViaToday(task, 1).dueDate).toEqualMoment(moment('2023-02-16'));
    });

    it('snoozeTaskViaToday(..., 3) on future dates should advance all dates', () => {
        const task = new TaskBuilder()
            .startDate('2023-02-16')
            .scheduledDate('2023-02-17')
            .dueDate('2023-02-18')
            .build();
        const newTask = snoozeTaskViaToday(task, 3);
        expect(newTask.startDate).toEqualMoment(moment('2023-02-19'));
        expect(newTask.scheduledDate).toEqualMoment(moment('2023-02-20'));
        expect(newTask.dueDate).toEqualMoment(moment('2023-02-21'));
    });

    it('snoozeTaskViaToday(..., 3) should not change created and done dates', () => {
        const task = new TaskBuilder().createdDate('2023-02-16').doneDate('2023-02-17').build();
        const newTask = snoozeTaskViaToday(task, 2);
        expect(newTask.createdDate).toEqualMoment(task.createdDate!);
        expect(newTask.doneDate).toEqualMoment(task.doneDate!);
    });

    it('snoozeTaskViaToday(..., 1) should snooze an overdue task to today', () => {
        const task = new TaskBuilder().dueDate('2023-01-01').build();
        expect(snoozeTaskViaToday(task, 1).dueDate).toEqualMoment(moment(today));
    });

    it('snoozeTaskToFutureDate(..., 1) should snooze an overdue task to tomorrow', () => {
        const task = new TaskBuilder().dueDate('2023-01-01').build();
        expect(snoozeTaskToFutureDate(task, 1).dueDate).toEqualMoment(moment('2023-02-16'));
    });
});
