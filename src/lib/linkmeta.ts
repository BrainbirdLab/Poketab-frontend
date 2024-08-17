import type { linkRes } from "./types";
import { messageDatabase, type TextMessageObj, type MessageObj } from "./messageTypes";
import { linkPreviewOn } from "./components/chatUI/chatComponents/quickSettingsModal.svelte";
import { get } from "svelte/store";

export async function getLinkMetadata(msgObj: MessageObj) {

    try{

        if (!get(linkPreviewOn)) {
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

        const res = await fetch(`/api/linkmeta?url=${url}`);

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

        messageDatabase.update((messages) => {
            (messageDatabase.getMessage(messageId) as TextMessageObj).linkPreviewData = linkData;
            return messages;
        });

    } catch (err) {
        console.error(err);
    }
}