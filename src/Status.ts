/**
 * Collection of status types supported by the plugin.
 * TODO: Make this a class so it can support other types and easier mapping to status character.
 * @export
 * @enum {number}
 */
export enum Status {
    TODO = 'Todo',
    DONE = 'Done',
}

export class TaskState {
    public readonly statusCharacter: string; // !
    public readonly status: Status; // Status.Todo
    public readonly displayName: string; // "Important" - from SlrVb's Alternative Checkboxes
    public readonly commandName: string;

    constructor(statusCharacter: string, status: Status, displayName: string) {
        this.statusCharacter = statusCharacter;
        this.status = status;
        this.displayName = displayName;
        this.commandName = this.displayName.toLowerCase().replace(/ /g, '-');
    }
}

export class TaskStates {
    public static readonly states: TaskState[] = [
        // To do - alphabetical by displayName
        new TaskState('d', Status.TODO, 'Doing'),
        new TaskState('/', Status.TODO, 'Half Done'),
        new TaskState('>', Status.TODO, 'Forwarded'), // Forward
        new TaskState('!', Status.TODO, 'Important'),
        new TaskState(' ', Status.TODO, 'Unchecked'),

        // Done - alphabetical by displayName
        new TaskState('-', Status.DONE, 'Cancelled'),
        new TaskState('X', Status.DONE, 'Checked'),
        new TaskState('x', Status.DONE, 'Regular'),

        // Any other status character is treated as Status.DONE
    ];
}

export function characterToEnum(statusString: string): Status.DONE | Status {
    const state: TaskState | undefined = TaskStates.states.find((s) => s.statusCharacter === statusString);
    if (state) {
        return state.status;
    } else {
        return Status.DONE;
    }
}
