import { Menu } from 'obsidian';
import type { Task } from '../../Task/Task';
import { SetTaskDate } from '../EditInstructions/DateInstructions';
import type { TaskSaver } from './TaskEditingMenu';

// export class DateMenu extends TaskEditingMenu {
export class DateMenu extends Menu {
    protected readonly taskSaver: TaskSaver;
    // @ts-expect-error Unused
    private button: HTMLAnchorElement;

    constructor(task: Task, taskSaver: TaskSaver, button: HTMLAnchorElement) {
        super();
        this.taskSaver = taskSaver;
        this.button = button;

        this.addItem((item) => {
            item.setTitle('Set Date').onClick(() => {
                console.log('in Set Date handler');
                this.promptForDate(task);
            });
        });
    }

    private promptForDate(task: Task) {
        const input = document.createElement('input');
        input.type = 'date';
        input.onchange = async (_ev) => {
            const date = new Date(input.value);
            const newTask = new SetTaskDate(date).apply(task);
            await this.taskSaver(task, newTask);
            input.remove(); // Clean up the input after saving
        };
        input.click(); // Open the date picker immediately
    }
}
