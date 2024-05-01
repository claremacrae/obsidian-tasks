import flatpickr from 'flatpickr';
import { Menu } from 'obsidian';
import type { Task } from '../../Task/Task';
import { SetTaskDate } from '../EditInstructions/DateInstructions';
import type { TaskSaver } from './TaskEditingMenu';

// TODO Maybe change this interaction from a context Menu to a left-click on the emoji that just opens the date picker.
// TODO Make this work for the other date types too.
// TODO Allow it to remove the date.
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
            console.log('Parent element not found.');
            return;
        }

        const input = document.createElement('input');
        input.type = 'text'; // Flatpickr can hook into a text input
        parentElement.appendChild(input);

        // Ensure styles are applied so Flatpickr can render correctly
        input.style.minWidth = '200px'; // Ensure there's enough room for Flatpickr

        // Delay the initialization of Flatpickr to ensure DOM is ready
        setTimeout(() => {
            const fp = flatpickr(input, {
                defaultDate: task.dueDate ? task.dueDate.format('YYYY-MM-DD') : new Date(),
                enableTime: false, // Optional: Enable time picker
                dateFormat: 'Y-m-d', // Adjust the date and time format as needed
                onClose: async (selectedDates, _dateStr, instance) => {
                    if (selectedDates.length > 0) {
                        const date = selectedDates[0];
                        const newTask = new SetTaskDate(date).apply(task);
                        await this.taskSaver(task, newTask);
                    }
                    instance.destroy(); // Proper cleanup
                    input.remove(); // Remove the elements after selection
                    todayButton.remove();
                    clearButton.remove();
                },
            });

            // Create "Today" button
            const todayButton = document.createElement('button');
            todayButton.textContent = 'Today';
            todayButton.onclick = () => {
                fp.setDate(new Date(), true); // Set date to today and trigger change
            };

            // Create "Clear" button
            const clearButton = document.createElement('button');
            clearButton.textContent = 'Clear';
            clearButton.onclick = () => {
                fp.clear();
            };

            // Styling for buttons to align them next to the input
            todayButton.style.marginLeft = '5px';
            clearButton.style.marginLeft = '5px';

            // Append buttons next to the input
            parentElement.appendChild(todayButton);
            parentElement.appendChild(clearButton);

            // Open the calendar programmatically
            fp.open();
        }, 0);
    }
}
