import { encryptMessage, makeSymmetricKey } from './encryption';

describe('encryptMessage', () => {
    let symmetricKey: CryptoKey;

    beforeAll(async () => {
        symmetricKey = await makeSymmetricKey();
    });

    it('should encrypt a message successfully', async () => {
        const message = new TextEncoder().encode('Hello, World!').buffer as ArrayBuffer;
        const encryptedMessage = await encryptMessage(message, symmetricKey);
        expect(encryptedMessage).toBeInstanceOf(ArrayBuffer);
        expect(encryptedMessage.byteLength).toBeGreaterThan(message.byteLength);
    });

    it('should throw an error if the message is not an ArrayBuffer', async () => {
        const message = 'Hello, World!';

        await expect(encryptMessage(message as any, symmetricKey)).rejects.toThrow();
    });

    it('should throw an error if the symmetricKey is not a CryptoKey', async () => {
        const message = new TextEncoder().encode('Hello, World!').buffer as ArrayBuffer;
        await expect(encryptMessage(message, {} as any)).rejects.toThrow();
    });
});