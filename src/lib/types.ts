export enum SEND_METHOD {
    ENTER = "Enter",
    CTRL_ENTER = "Ctrl+Enter",
};

export type ErrorLog = {
    text: string,
    icon: string,
};

export type User = {
    uid: string,
    avatar: string,
    publicKey: CryptoKey,
    lastSeenMessage?: string | null,
}

export type chatRoomStoreType = {
    Key: string,
    admin: string,
    userList: { [key: string]: User},
    maxUsers: number,
};