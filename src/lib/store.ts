import { writable, type Writable } from 'svelte/store';

export interface UserInfo{
    name: string;
    id: string;
    avatar: string;
}

interface ChatRoom{
  key: string;
  maxUser: number;
  admin: string;
  userList: Map<string, UserInfo>;
}

export const selfInfoStore: Writable<UserInfo> = writable({
    name: '',
    id: '',
    avatar: '',
});
export const chatRoomStore: Writable<ChatRoom> = writable({
    key: '',
    maxUser: 0,
    admin: '',
    userList: new Map(),
});
export const usedUsernames: Writable<string[]> = writable([]);
export const usedAvatars: Writable<string[]> = writable([]);
export const isConnected: Writable<boolean> = writable(false);

export const showUserInputForm: Writable<boolean> = writable(false);

export const showSidePanel: Writable<boolean> = writable(false);