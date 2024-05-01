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
        console.log('hello 1');
        const input = document.createElement('input');
        // input.type = 'date';
        input.setAttribute('type', 'date');

        // Attach event listener before appending to ensure it captures the first interaction.
        input.onchange = async (_ev) => {
            console.log('in onchange');
            if (input.value) {
                // Check if a date was actually picked
                const date = new Date(input.value);
                const newTask = new SetTaskDate(date).apply(task);
                await this.taskSaver(task, newTask);
            }
            // Remove the input after use to clean up.
            input.remove();
        };

        // Append to the body to ensure it's part of the document.
        document.body.appendChild(input);

        console.log('hello 2');

        // Use CSS to make the input effectively invisible but still functional.
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.height = '1px';
        input.style.width = '1px';
        input.style.zIndex = '-1'; // Send to back if needed

        // Programmatically click the input.
        input.click();

        // Listen for blur event to handle if user clicks away without selecting a date.
        input.onblur = () => {
            // Use a timeout to delay the check, allows for detection of actual blur.
            setTimeout(() => {
                if (!input.value) {
                    // If no date has been selected
                    input.remove(); // Clean up if user clicks away without selecting
                }
            }, 100); // Increase timeout if needed to ensure it does not conflict with onclick.
        };
    }
}
