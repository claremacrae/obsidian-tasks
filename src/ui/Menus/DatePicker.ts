import flatpickr from 'flatpickr';
import type { AllTaskDateFields, Task } from '../../Task/Task';
import { SetTaskDate } from '../EditInstructions/DateInstructions';

export function promptForDate(
    parentElement: HTMLElement,
    task: Task,
    dateFieldToEdit: AllTaskDateFields,
    taskSaver: (originalTask: Task, newTasks: Task | Task[]) => Promise<void>,
) {
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
        const currentValue = task[dateFieldToEdit];
        // TODO figure out how Today's date is determined: if Obsidian is left
        //      running overnight, the flatpickr modal shows the previous day as Today.
        const fp = flatpickr(input, {
            defaultDate: currentValue ? currentValue.format('YYYY-MM-DD') : new Date(),
            enableTime: false, // Optional: Enable time picker
            dateFormat: 'Y-m-d', // Adjust the date and time format as needed
            locale: {
                firstDayOfWeek: 1, // Sets Monday as the first day of the week
            },
            onClose: async (selectedDates, _dateStr, instance) => {
                // console.log('A date button clicked');
                if (selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const newTask = new SetTaskDate(dateFieldToEdit, date).apply(task);
                    await taskSaver(task, newTask);
                }
                instance.destroy(); // Proper cleanup
                input.remove(); // Remove the elements after selection
                todayButton.remove();
                clearButton.remove();
            },
        });

        // Create "Today" button
        const todayButton = document.createElement('button');
        todayButton.disabled = true; // TODO Disabled until I can fix the callback below
        todayButton.textContent = 'Today';
        todayButton.style.marginLeft = '5px';
        parentElement.appendChild(todayButton); // Make sure button is appended before adding event listener

        // Add event listener for 'Today' button
        todayButton.addEventListener('click', async () => {
            // TODO This does not get triggered - the onClear above is acted on instead
            console.log('Today button clicked'); // Debug: Log to console
            const today = new Date();
            fp.setDate(today, true); // Set date to today and trigger change
            const newTask = new SetTaskDate(dateFieldToEdit, today).apply(task); // Apply the new date
            await taskSaver(task, newTask); // Save the task
            // TODO Clean up
        });

        // Create "Clear" button
        const clearButton = document.createElement('button');
        clearButton.disabled = true; // TODO Disabled until I can fix the callback below
        clearButton.textContent = 'Clear';
        clearButton.style.marginLeft = '5px';
        parentElement.appendChild(clearButton); // Make sure button is appended before adding event listener

        // Add event listener for 'Clear' button
        clearButton.addEventListener('click', async () => {
            // TODO This does not get triggered - the onClear above is acted on instead
            console.log('Clear button clicked'); // Debug: Log to console
            fp.clear(); // Clears the input

            // TODO Generalise createTaskWithDateRemoved() to work withAllTaskDateFields, not just HappensDate
            // const { postponedTask } = createTaskWithDateRemoved(task, dateFieldToEdit, 'days', 0);
            // await this.taskSaver(task, postponedTask);

            // TODO Clean up
        });

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
