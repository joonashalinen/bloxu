import MessageHotel from '../pub/MessageHotel';
import {describe, expect, test, jest, beforeEach, it} from '@jest/globals';

describe('MessageHotel', () => {
    let messageHotel: MessageHotel;

    beforeEach(() => {
        messageHotel = new MessageHotel();
    });

    it('should host a new room and return the room code', () => {
        const code = messageHotel.hostRoom();
        expect(code).toHaveLength(6); // Assuming room code length is always 6 characters
        expect(messageHotel.rooms).toHaveLength(1);
    });

    it('should join an existing room and return true', () => {
        const code = messageHotel.hostRoom();
        const user = 'John';
        const joined = messageHotel.joinRoom(code, user);
        expect(joined).toBe(true);
        expect(messageHotel.rooms[0].users).toContain(user);
    });

    it('should not join a non-existing room and return false', () => {
        const user = 'John';
        const joined = messageHotel.joinRoom('nonexistentcode', user);
        expect(joined).toBe(false);
    });

    it('should send a message within the same room', () => {
        const sender = 'John';
        const recipient = 'Jane';
        const content = 'Hello, Jane!';

        const code = messageHotel.hostRoom();

        messageHotel.joinRoom(code, sender);
        messageHotel.joinRoom(code, recipient);

        const emitSpy = jest.spyOn(messageHotel['emitter'], 'trigger');
        messageHotel.sendMessage(sender, code, content);

        expect(emitSpy).toHaveBeenCalledWith(`message`, [
            {recipient: code, message: { sender, content }},
        ]);
    });

    it('should not send a message if room is invalid', () => {
        const sender = 'John';
        const content = 'Hello, Jane!';

        const code = messageHotel.hostRoom();
        const invalidCode = messageHotel.hostRoom();

        messageHotel.joinRoom(code, sender);

        const emitSpy = jest.spyOn(messageHotel['emitter'], 'trigger');
        messageHotel.sendMessage(sender, code, content);
        messageHotel.sendMessage(sender, invalidCode, content);

        expect(emitSpy).toHaveBeenCalledTimes(1); // Only one valid message
    });
});
