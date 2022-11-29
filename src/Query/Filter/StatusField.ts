import { Status } from '../../Status';
import type { Task } from '../../Task';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StatusField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('done', (task: Task) => task.status === Status.DONE);
        this._filters.add('not done', (task: Task) => task.status !== Status.DONE);

        this._filters.add('status is unchecked', (task: Task) => task.originalStatusCharacter === ' ');
        this._filters.add('status is important', (task: Task) => task.originalStatusCharacter === '!');
        this._filters.add('status is half-done', (task: Task) => task.originalStatusCharacter === '/');
        this._filters.add('status is cancelled', (task: Task) => task.originalStatusCharacter === '-');
        this._filters.add('status is doing', (task: Task) => task.originalStatusCharacter === 'd');
    }

    public fieldName(): string {
        return 'status';
    }
}
