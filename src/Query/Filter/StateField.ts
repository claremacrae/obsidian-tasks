import { TaskStates } from '../../Status';
import type { Task } from '../../Task';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StateField extends FilterInstructionsBasedField {
    constructor() {
        super();

        for (const state of TaskStates.states) {
            this._filters.add(
                `state is ${state.commandName}`,
                (task: Task) => task.originalStatusCharacter === state.statusCharacter,
            );
        }
    }

    public fieldName(): string {
        return 'state';
    }
}
