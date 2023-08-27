/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { snoozeTaskToFutureDate, snoozeTaskViaToday, unSnoozeTask } from '../src/Snooze';
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

    // TODO Add tests that dates in original tasks are not modified
    it('snoozeTaskViaToday(..., 1) should snooze a task due today to next day, and not touch other dates', () => {
        const task = new TaskBuilder().dueDate(today).build();
        const newTask = snoozeTaskViaToday(task, 1);
        expect(newTask.dueDate).toEqualMoment(moment('2023-02-16'));
        expect(newTask.createdDate).toBeNull();
        expect(newTask.doneDate).toBeNull();
        expect(newTask.scheduledDate).toBeNull();
        expect(newTask.startDate).toBeNull();
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

    it('snoozeTaskViaToday(..., 1) on undated task should set due to today', () => {
        const task = new TaskBuilder().build();
        const newTask = snoozeTaskViaToday(task, 1);
        expect(newTask.dueDate).toEqualMoment(moment(today));
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

    it('snoozeTaskViaToday(..., 1) when scheduled date is inferred should set new date and remove the flag', () => {
        const task = new TaskBuilder().scheduledDate('2023-01-01').scheduledDateIsInferred(true).build();
        const newTask = snoozeTaskViaToday(task, 1);
        expect(newTask.scheduledDate).toEqualMoment(moment(today));
        expect(newTask.scheduledDateIsInferred).toEqual(false);
    });

    it('snoozeTaskToFutureDate(..., 1) should snooze an overdue task to tomorrow', () => {
        const task = new TaskBuilder().dueDate('2023-01-01').build();
        expect(snoozeTaskToFutureDate(task, 1).dueDate).toEqualMoment(moment('2023-02-16'));
    });

    it('snoozeTaskToFutureDate(..., 1) on undated task should set due to today', () => {
        const task = new TaskBuilder().build();
        const newTask = snoozeTaskToFutureDate(task, 1);
        expect(newTask.dueDate).toEqualMoment(moment(today));
    });

    it('snoozeTaskToFutureDate(..., 1) when scheduled date is inferred should set new date and remove the flag', () => {
        const task = new TaskBuilder().scheduledDate('2023-01-01').scheduledDateIsInferred(true).build();
        const newTask = snoozeTaskToFutureDate(task, 1);
        expect(newTask.scheduledDate).toEqualMoment(moment('2023-02-16'));
        expect(newTask.scheduledDateIsInferred).toEqual(false);
    });

    it('unSnoozeTask(...) on future dates should advance all dates', () => {
        const task = new TaskBuilder()
            .startDate('2023-02-16')
            .scheduledDate('2023-02-17')
            .dueDate('2023-02-18')
            .build();
        const newTask = unSnoozeTask(task);
        expect(newTask.startDate).toEqualMoment(moment('2023-02-15'));
        expect(newTask.scheduledDate).toEqualMoment(moment('2023-02-16'));
        expect(newTask.dueDate).toEqualMoment(moment('2023-02-17'));
    });

    it('unSnoozeTask(..., 1) on undated task should set due to today', () => {
        const task = new TaskBuilder().build();
        const newTask = unSnoozeTask(task);
        expect(newTask.dueDate).toEqualMoment(moment(today));
    });

    it('unSnoozeTask(...) when scheduled date is inferred should set new date and remove the flag', () => {
        const task = new TaskBuilder().scheduledDate('2023-01-01').scheduledDateIsInferred(true).build();
        const newTask = unSnoozeTask(task);
        expect(newTask.scheduledDate).toEqualMoment(moment('2022-12-31'));
        expect(newTask.scheduledDateIsInferred).toEqual(false);
    });
});
