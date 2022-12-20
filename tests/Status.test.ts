import { Status, TaskState, TaskStates, characterToEnum } from '../src/Status';

describe('Status', () => {
    it('should convert character to status enum', () => {
        expect(characterToEnum(' ')).toEqual(Status.TODO);
        expect(characterToEnum('/')).toEqual(Status.TODO); // / = Half Done
        expect(characterToEnum('d')).toEqual(Status.TODO); // d = Doing
        expect(characterToEnum('!')).toEqual(Status.TODO); // ! = Important
        expect(characterToEnum('>')).toEqual(Status.TODO); // > = Forward

        expect(characterToEnum('x')).toEqual(Status.DONE);
        expect(characterToEnum('X')).toEqual(Status.DONE);
        expect(characterToEnum('-')).toEqual(Status.DONE); // - = Cancelled
        expect(characterToEnum('?')).toEqual(Status.DONE); // ? = Question
    });
});

describe('TaskState', () => {
    it('should describe a state/status', () => {
        const state = new TaskState('!', Status.TODO, 'Important');
        expect(state.displayName).toEqual('Important');
        expect(state.commandName).toEqual('important');
    });

    it('should not have any spaces in command name', () => {
        const state = new TaskState('x', Status.TODO, 'I have Lots of spaces');
        expect(state.commandName).toEqual('i-have-lots-of-spaces');
    });
});

describe('TaskStates', () => {
    it('should be no spaces in command names for available states', () => {
        for (const state of TaskStates.states) {
            expect(state.commandName.includes(' ')).toBe(false);
        }
    });
});
