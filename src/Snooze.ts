import { DateFallback } from './DateFallback';
import { Task } from './Task';

function snoozeViaToday2(oldDate: moment.Moment | null, amount: moment.DurationInputArg1) {
    // If no date, do not add one
    if (!oldDate) {
        return null;
    }

    // If overdue, fast-forward to today
    if (oldDate.isBefore(window.moment(), 'day')) {
        return window.moment().startOf('day');
    }

    // Otherwise, fast-forward to next day
    return oldDate.clone().add(amount, 'days');
}

function genericSnoozer(
    snoozeFunc: (oldDate: moment.Moment | null, amount: moment.DurationInputArg1) => any,
    task: Task,
    amount: number,
) {
    const newTask = new Task({
        ...task,
        dueDate: snoozeFunc(task.dueDate, amount),
        scheduledDate: snoozeFunc(task.scheduledDate, amount),
        startDate: snoozeFunc(task.startDate, amount),
    });
    return DateFallback.removeInferredStatusIfNeeded(task, [newTask])[0];
}

export function snoozeTaskViaToday(task: Task, amount: number) {
    return genericSnoozer(snoozeViaToday2, task, amount);
}

function snoozeToFutureDate2(oldDate: moment.Moment | null, amount: moment.DurationInputArg1) {
    // If no date, do not add one
    if (!oldDate) {
        return null;
    }

    // If due today or earlier, move to n days after today
    if (oldDate.isSameOrBefore(window.moment(), 'day')) {
        return window.moment().startOf('day').add(amount, 'days');
    }

    // Otherwise, fast-forward n days from current day
    return oldDate.clone().add(amount, 'days');
}

export function snoozeTaskToFutureDate(task: Task, amount: number) {
    return genericSnoozer(snoozeToFutureDate2, task, amount);
}

function unSnooze2(oldDate: moment.Moment | null) {
    // If no date, do not add one
    if (!oldDate) {
        return null;
    }

    // Otherwise, rewind to previous day
    return oldDate.clone().subtract(1, 'days');
}

export function unSnoozeTask(task: Task) {
    return new Task({
        ...task,
        dueDate: unSnooze2(task.dueDate),
        scheduledDate: unSnooze2(task.scheduledDate),
        startDate: unSnooze2(task.startDate),
    });
}
