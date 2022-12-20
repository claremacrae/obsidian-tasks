import type { Task } from '../../Task';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StateField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('state is unchecked', (task: Task) => task.originalStatusCharacter === ' ');
        this._filters.add('state is important', (task: Task) => task.originalStatusCharacter === '!');
        this._filters.add('state is half-done', (task: Task) => task.originalStatusCharacter === '/');
        this._filters.add('state is cancelled', (task: Task) => task.originalStatusCharacter === '-');
        this._filters.add('state is forwarded', (task: Task) => task.originalStatusCharacter === '>');
        this._filters.add('state is doing', (task: Task) => task.originalStatusCharacter === 'd');
    }

    public fieldName(): string {
        return 'state';
    }
}
