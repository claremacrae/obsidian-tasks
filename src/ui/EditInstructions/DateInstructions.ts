import { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

export class SetTaskDate implements TaskEditingInstruction {
    private readonly newDate: Date;
    private dateFieldToEdit = 'dueDate';

    constructor(date: Date) {
        this.newDate = date;
    }

    public apply(task: Task): Task[] {
        return [
            new Task({
                ...task,
                [this.dateFieldToEdit]: window.moment(this.newDate),
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
