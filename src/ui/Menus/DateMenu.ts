import { Menu } from 'obsidian';
import { splitDateText } from '../../Scripting/Postponer';
import type { AllTaskDateFields, Task } from '../../Task/Task';
import { promptForDate } from './DatePicker';
import type { TaskSaver } from './TaskEditingMenu';

// TODO Allow it to remove the date.
// TODO Improve positioning of the date picker, so that it is closer to the field being edited
export class DateMenu extends Menu {
    private readonly dateFieldToEdit;
    protected readonly taskSaver: TaskSaver;
    private readonly button: HTMLElement;

    constructor(task: Task, dateFieldToEdit: AllTaskDateFields, taskSaver: TaskSaver, button: HTMLElement) {
        super();
        this.dateFieldToEdit = dateFieldToEdit;
        this.taskSaver = taskSaver;
        this.button = button;

        this.addItem((item) => {
            item.setTitle(`Set ${splitDateText(dateFieldToEdit)}`).onClick(() => {
                this.promptForDate(task);
            });
        });
    }

    private promptForDate(task: Task) {
        promptForDate(this.button, task, this.dateFieldToEdit, this.taskSaver);
    }
}
