import type { linkRes } from "./types";
import { messageDatabase, type TextMessageObj, type MessageObj } from "./messageStore.svelte";
import { linkPreviewOn } from "$lib/settings.svelte";

export async function getLinkMetadata(msgObj: MessageObj) {

    try{

        if (!linkPreviewOn.value) {
            return;
        }

        if (msgObj.baseType != 'text'){
            return;
        }

        const messageId = msgObj.id;
        const msg = (msgObj as TextMessageObj).message;

        const regex = /<a href=(['"])(.*?)\1.*?>.*?<\/a>/g;

        const match = regex.exec(msg);
        
        const url = match?.[2];

        if (!url){
            return;
        }

        const res = await fetch(`/api/linkmeta`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `link=${url}`,
        });

        if (!res.ok) {
            return;
        }

        const data: linkRes = await res.json();

        if (!data.success) {
            return;
        }

        const linkData = data.data;

        if (!linkData) {
            return;
        }

        (messageDatabase.getMessage(messageId) as TextMessageObj).linkPreviewData = linkData;

    } catch (err) {
        console.error(err);
    }
}