import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export class FunctionField extends Field {
    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Searching by custom function not yet implemented');
    }

    fieldName(): string {
        return 'function';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    protected grouperRegExp(): RegExp {
        if (!this.supportsGrouping()) {
            throw Error(`grouperRegExp() unimplemented for ${this.fieldNameSingular()}`);
        }

        return new RegExp(`^group by ${this.fieldNameSingularEscaped()}`);
    }

    public grouper(): GrouperFunction {
        return (_task: Task) => {
            return ['hello world'];
        };
    }
}
