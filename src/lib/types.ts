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
    lastSeenMessage?: string | null,
    PublicKey: CryptoKey,
}

export type chatRoomStoreType = {
    Key: string,
    admin: string,
    userList: { readonly [key: string]: User},
    maxUsers: number,
};