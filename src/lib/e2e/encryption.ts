export async function encryptMessage(
    message: ArrayBuffer,
    symmetricKey: CryptoKey
): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        symmetricKey,
        message
    );

    const buffer = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + buffer.length);
    combined.set(iv);
    combined.set(buffer, iv.length);

    return combined.buffer;
}

export async function decryptMessage(
    encrypted: ArrayBuffer,
    symmetricKey: CryptoKey
): Promise<ArrayBuffer> {
    const combined = new Uint8Array(encrypted);
    const iv = combined.slice(0, 12);
    const buffer = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        symmetricKey,
        buffer
    );

    return decrypted;
}

export function bufferToString(buffer: ArrayBuffer): string {
    //base64 encoding
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function stringToBuffer(str: string): ArrayBuffer {
    //base64 decoding
    return Uint8Array.from(atob(str), c => c.charCodeAt(0)).buffer;
}

export async function makeKeyPair() {
    return crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.exportKey("spki", publicKey);
}

export async function exportPrivateKey(privateKey: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.exportKey("pkcs8", privateKey);
}

export async function importPublicKey(key: ArrayBuffer): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        "spki",
        key,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt", "wrapKey"]
    );
}

export async function importPrivateKey(key: ArrayBuffer): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        "pkcs8",
        key,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt", "unwrapKey"]
    );
}

export async function makeSymmetricKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptSymmetricKey(
    symmetricKey: CryptoKey,
    publicKey: CryptoKey
): Promise<ArrayBuffer> {
    return crypto.subtle.wrapKey(
        "raw",
        symmetricKey,
        publicKey,
        {
            name: "RSA-OAEP"
        }
    );
}

export async function decryptSymmetricKey(
    wrappedKey: ArrayBuffer,
    privateKey: CryptoKey
): Promise<CryptoKey> {
    return crypto.subtle.unwrapKey(
        "raw",
        wrappedKey,
        privateKey,
        {
            name: "RSA-OAEP",
        },
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}