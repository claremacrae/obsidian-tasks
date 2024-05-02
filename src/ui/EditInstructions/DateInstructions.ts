import { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

export class SetTaskDate implements TaskEditingInstruction {
    private readonly newDate: Date;

    constructor(date: Date) {
        this.newDate = date;
    }

    public apply(task: Task): Task[] {
        const dateFieldToEdit = 'dueDate';
        return [
            new Task({
                ...task,
                [dateFieldToEdit]: window.moment(this.newDate),
            }),
        ];
    }

    public instructionDisplayName(): string {
        return `Set Date: ${this.newDate.toDateString()}`;
    }

    public isCheckedForTask(_task: Task): boolean {
        return false;
    }
}
