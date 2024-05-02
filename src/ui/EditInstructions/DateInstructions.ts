import type { HappensDate } from '../../Scripting/Postponer';
import { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

export class SetTaskDate implements TaskEditingInstruction {
    private readonly newDate: Date;
    private readonly dateFieldToEdit;

    // TODO Support all dates, not just HappensDates
    constructor(dateFieldToEdit: HappensDate, date: Date) {
        this.newDate = date;
        this.dateFieldToEdit = dateFieldToEdit;
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
