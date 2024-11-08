import { type User } from "$lib/types";

export type socketResponse = {
    success: boolean,
    message: string,
    icon: string,
    statusCode: number,
    users: { [key: string]: User },
    maxUsers: number,
}