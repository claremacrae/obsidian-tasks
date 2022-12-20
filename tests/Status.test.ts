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

    it('should describe a state/status', () => {
        const state = new TaskState('!', Status.TODO, 'Important');
        expect(state.displayName).toEqual('Important');
        expect(state.commandName).toEqual('important');
    });

    it('should describe all available states', () => {
        const states = TaskStates.states;
        expect(states.length).toBeGreaterThan(5);
    });
});
