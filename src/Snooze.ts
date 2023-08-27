import { Task } from './Task';

function snoozeViaToday2(
    oldDate: moment.Moment | null,
    amount: moment.Duration | number | string | moment.FromTo | moment.DurationInputObject | null | undefined,
) {
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

export function snoozeTaskViaToday(task: Task, amount: number) {
    const updatedTask = new Task({
        ...task,
        dueDate: snoozeViaToday2(task.dueDate, amount),
        scheduledDate: snoozeViaToday2(task.scheduledDate, amount),
        startDate: snoozeViaToday2(task.startDate, amount),
    });
    return updatedTask;
}

function snoozeToFutureDate2(
    oldDate: moment.Moment | null,
    amount: moment.Duration | number | string | moment.FromTo | moment.DurationInputObject | null | undefined,
) {
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
    const updatedTask = new Task({
        ...task,
        dueDate: snoozeToFutureDate2(task.dueDate, amount),
        scheduledDate: snoozeToFutureDate2(task.scheduledDate, amount),
        startDate: snoozeToFutureDate2(task.startDate, amount),
    });
    return updatedTask;
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
    const updatedTask = new Task({
        ...task,
        dueDate: unSnooze2(task.dueDate),
        scheduledDate: unSnooze2(task.scheduledDate),
        startDate: unSnooze2(task.startDate),
    });
    return updatedTask;
}
