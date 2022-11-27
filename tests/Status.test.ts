import { Status, characterToEnum } from '../src/Status';

describe('Status', () => {
    it('should convert character to status enum', () => {
        expect(characterToEnum(' ')).toEqual(Status.TODO);

        expect(characterToEnum('/')).toEqual(Status.DONE);
        expect(characterToEnum('d')).toEqual(Status.DONE);
        expect(characterToEnum('!')).toEqual(Status.DONE);
        expect(characterToEnum('x')).toEqual(Status.DONE);
        expect(characterToEnum('X')).toEqual(Status.DONE);
    });
});
