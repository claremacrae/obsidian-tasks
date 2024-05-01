import { Menu } from 'obsidian';
import type { Task } from '../../Task/Task';
import { SetTaskDate } from '../EditInstructions/DateInstructions';
import type { TaskSaver } from './TaskEditingMenu';

// TODO Maybe change this interaction from a context Menu to a left-click on the emoji that just opens the date picker.
// TODO Make this work for the other date types too.
export class DateMenu extends Menu {
    protected readonly taskSaver: TaskSaver;
    private button: HTMLElement;

    constructor(task: Task, taskSaver: TaskSaver, button: HTMLElement) {
        super();
        this.taskSaver = taskSaver;
        this.button = button;

        this.addItem((item) => {
            item.setTitle('Set Date').onClick(() => {
                this.promptForDate(task);
            });
        });
    }

    private promptForDate(task: Task) {
        // Look at https://github.com/simonknittel/obsidian-create-task
        const parentElement = this.button.parentElement;
        if (!parentElement) {
            return;
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'date');

        // Set initial date
        input.value = task.dueDate ? task.dueDate.format('YYYY-MM-DD') : window.moment().format('YYYY-MM-DD');

        // Attach event listener before appending to ensure it captures the first interaction.
        input.onchange = async (_ev) => {
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
        // input.style.position = 'fixed'; // Position absolutely within the parent
        input.style.opacity = '1';
        input.style.height = 'auto'; // Allow default height
        input.style.width = 'auto'; // Allow default width
        input.style.zIndex = '1000'; // Make sure it's on top

        // Position to right of the checkbox, and scrolls - at least the location is predictable,
        // although it would be nice if it was where the Context Menu had popped up.
        input.style.position = 'absolute';
        input.style.left = '0px'; // Start from the exact position of the parent
        input.style.top = '0px';

        // Append to the parentElement to keep relative positioning
        parentElement.appendChild(input);

        // Programmatically click the input.
        input.click();

        // TODO It's annoying that the user has to clock on the calendar icon to open up the date picker.
        //      Ideas: Implement a custom date picker using JavaScript libraries that can be programmatically
        //             controlled more reliably than native HTML inputs.
        //             Pikaday:
        //                  https://github.com/Pikaday/Pikaday
        //             Flatpickr:
        //                  https://github.com/flatpickr/flatpickr
        //                  https://github.com/jacobmischka/svelte-flatpickr

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
