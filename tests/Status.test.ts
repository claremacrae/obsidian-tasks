import { Status, characterToEnum } from '../src/Status';

describe('Status', () => {
    it('should convert character to status enum', () => {
        expect(characterToEnum(' ')).toEqual(Status.TODO);
        expect(characterToEnum('/')).toEqual(Status.TODO); // / = Half Done
        expect(characterToEnum('d')).toEqual(Status.TODO); // d = Doing
        expect(characterToEnum('!')).toEqual(Status.TODO); // ! = Important

        expect(characterToEnum('x')).toEqual(Status.DONE);
        expect(characterToEnum('X')).toEqual(Status.DONE);
    });
});