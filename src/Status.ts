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

export function characterToEnum(statusString: string) {
    let status: Status;
    // / = Half Done
    // d = Doing
    // ! = Important
    if (' /d!'.includes(statusString)) {
        status = Status.TODO;
    } else {
        status = Status.DONE;
    }
    return status;
}