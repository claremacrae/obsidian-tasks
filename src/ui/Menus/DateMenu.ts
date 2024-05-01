import { Menu } from 'obsidian';
import type { Task } from '../../Task/Task';
import { SetTaskDate } from '../EditInstructions/DateInstructions';
import type { TaskSaver } from './TaskEditingMenu';

// export class DateMenu extends TaskEditingMenu {
export class DateMenu extends Menu {
    protected readonly taskSaver: TaskSaver;
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
        const parentElement = this.button.parentElement;
        if (!parentElement) {
            return;
        }

        console.log('hello 1');
        const input = document.createElement('input');
        input.setAttribute('type', 'date');

        // Set initial date
        input.value = task.dueDate ? task.dueDate.format('YYYY-MM-DD') : window.moment().format('YYYY-MM-DD');

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

        // Temporarily make the input visible and larger
        input.style.position = 'fixed'; // Position absolutely within the parent
        input.style.opacity = '1';
        input.style.height = 'auto'; // Allow default height
        input.style.width = 'auto'; // Allow default width
        input.style.zIndex = '1000'; // Make sure it's on top

        // Position the input element at the button's location
        const rect = this.button.getBoundingClientRect();
        input.style.left = `${rect.left}px`;
        input.style.top = `${rect.top}px`;

        // Append to the parentElement to keep relative positioning
        parentElement.appendChild(input);

        console.log('hello 2');

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
