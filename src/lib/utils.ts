import { cubicOut } from "svelte/easing";
import { showToastMessage } from "./components/toast";
import type { FileMessageObj } from "./messageTypes";


export function toSentenceCase(inputString: string) {
    return inputString.replace(/(^|\. )\w/g, (match) => match.toUpperCase());
}

export const emojis = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '☠', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '🙈', '🙉', '🙊', '🐵', '🐶', '🐺', '🐱', '🦁', '🐯', '🦒', '🦊', '🦝', '🐮', '🐷', '🐗', '🐭', '🐹', '🐰', '🐻', '🐨', '🐼', '🐸', '🦓', '🐴', '🦄', '🐔', '🐲', '🐽', '🐧', '🐥', '🐤', '🐣', '🌻', '🌸', '🥀', '🌼', '🌷', '🌹', '🏵️', '🌺', '🦇', '🦋', '🐌', '🐛', '🦟', '🦗', '🐜', '🐝', '🐞', '🦂', '🕷', '🕸', '🦠', '🧞‍♀️', '🧞‍♂️', '🗣', '👀', '🦴', '🦷', '👅', '👄', '🧠', '🦾', '🦿', '👩🏻', '👨🏻', '🧑🏻', '👧🏻', '👦🏻', '🧒🏻', '👶🏻', '👵🏻', '👴🏻', '🧓🏻', '👩🏻‍🦰', '👨🏻‍🦰', '👩🏻‍🦱', '👨🏻‍🦱', '👩🏻‍🦲', '👨🏻‍🦲', '👩🏻‍🦳', '👨🏻‍🦳', '👱🏻‍♀️', '👱🏻‍♂️', '👸🏻', '🤴🏻', '👳🏻‍♀️', '👳🏻‍♂️', '👲🏻', '🧔🏻', '👼🏻', '🤶🏻', '🎅🏻', '👮🏻‍♀️', '👮🏻‍♂️', '🕵🏻‍♀️', '🕵🏻‍♂️', '💂🏻‍♀️', '💂🏻‍♂️', '👷🏻‍♀️', '👷🏻‍♂️', '👩🏻‍⚕️', '👨🏻‍⚕️', '👩🏻‍🎓', '👨🏻‍🎓', '👩🏻‍🏫', '👨🏻‍🏫', '👩🏻‍⚖️', '👨🏻‍⚖️', '👩🏻‍🌾', '👨🏻‍🌾', '👩🏻‍🍳', '👨🏻‍🍳', '👩🏻‍🔧', '👨🏻‍🔧', '👩🏻‍🏭', '👨🏻‍🏭', '👩🏻‍💼', '👨🏻‍💼', '👩🏻‍🔬', '👨🏻‍🔬', '👩🏻‍💻', '👨🏻‍💻', '👩🏻‍🎤', '👨🏻‍🎤', '👩🏻‍🎨', '👨🏻‍🎨', '👩🏻‍✈️', '👨🏻‍✈️', '👩🏻‍🚀', '👨🏻‍🚀', '👩🏻‍🚒', '👨🏻‍🚒', '🧕🏻', '👰🏻', '🤵🏻', '🤱🏻', '🤰🏻', '🦸🏻‍♀️', '🦸🏻‍♂️', '🦹🏻‍♀️', '🦹🏻‍♂️', '🧙🏻‍♀️', '🧙🏻‍♂️', '🧚🏻‍♀️', '🧚🏻‍♂️', '🧛🏻‍♀️', '🧛🏻‍♂️', '🧜🏻‍♀️', '🧜🏻‍♂️', '🧝🏻‍♀️', '🧝🏻‍♂️', '🧟🏻‍♀️', '🧟🏻‍♂️', '🙍🏻‍♀️', '🙍🏻‍♂️', '🙎🏻‍♀️', '🙎🏻‍♂️', '🙅🏻‍♀️', '🙅🏻‍♂️', '🙆🏻‍♀️', '🙆🏻‍♂️', '🧏🏻‍♀️', '🧏🏻‍♂️', '💁🏻‍♀️', '💁🏻‍♂️', '🙋🏻‍♀️', '🙋🏻‍♂️', '🙇🏻‍♀️', '🙇🏻‍♂️', '🤦🏻‍♀️', '🤦🏻‍♂️', '🤷🏻‍♀️', '🤷🏻‍♂️', '💆🏻‍♀️', '💆🏻‍♂️', '💇🏻‍♀️', '💇🏻‍♂️', '🧖🏻‍♀️', '🧖🏻‍♂️', '🤹🏻‍♀️', '🤹🏻‍♂️', '👩🏻‍🦽', '👨🏻‍🦽', '👩🏻‍🦼', '👨🏻‍🦼', '👩🏻‍🦯', '👨🏻‍🦯', '🧎🏻‍♀️', '🧎🏻‍♂️', '🧍🏻‍♀️', '🧍🏻‍♂️', '🚶🏻‍♀️', '🚶🏻‍♂️', '🏃🏻‍♀️', '🏃🏻‍♂️', '💃🏻', '🕺🏻', '🧗🏻‍♀️', '🧗🏻‍♂️', '🧘🏻‍♀️', '🧘🏻‍♂️', '🛀🏻', '🛌🏻', '🕴🏻', '🏇🏻', '🏂🏻', '💪🏻', '🦵🏻', '🦶🏻', '👂🏻', '🦻🏻', '👃🏻', '🤏🏻', '👈🏻', '👉🏻', '☝🏻', '👆🏻', '👇🏻', '✌🏻', '🤞🏻', '🖖🏻', '🤘🏻', '🤙🏻', '🖐🏻', '✋🏻', '👌🏻', '👍🏻', '👎🏻', '✊🏻', '👊🏻', '🤛🏻', '🤜🏻', '🤚🏻', '👋🏻', '🤟🏻', '✍🏻', '👏🏻', '👐🏻', '🙌🏻', '🤲🏻', '🙏🏻', '🤝🏻', '💅🏻', '📌', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💢', '💥', '💤', '💦', '💨', '💫'];

//custom animation for svelte:spin
export function spin(node: HTMLElement, { delay = 0, duration = 400, degree = 360, easing = cubicOut }: { delay?: number, duration?: number, degree?: number, easing?: (t: number) => number } = {}) {

    //start from -degree to 0

    return {
        delay,
        duration,
        easing,
        css: (t: number) => `
            transform: rotate(${t * degree - degree}deg);
        `,
    };
}

const iconMap: {[key: string]: string} = {
    'video': 'fa-file-video',
    'audio': 'fa-file-audio',
    'image': 'fa-file-image',
    'file': 'fa-file-lines',
    'pdf': 'fa-file-pdf',
    'zip': 'fa-file-zipper',
    'word': 'fa-file-word',
    'excel': 'fa-file-excel',
    'powerpoint': 'fa-file-powerpoint',
    'csv': 'fa-file-csv',
}

export function getIcon(type: string){
    //file.type is like 'application/pdf', 'application/zip', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'text/csv'
    //so check if it includes 'pdf', 'zip', 'word', 'excel', 'powerpoint', 'csv'
    //then return the corresponding icon
    //use regex to find the match word that we will use for indexing the iconMap
    //build the regex from the iconMap keys
    const regex = new RegExp(Object.keys(iconMap).join('|'), 'i');
    const match = type.match(regex);

    if (match){
        console.log(match[0]);
        return iconMap[match[0]];
    } else {
        return iconMap['file'];
    }
}

export async function copyText(text: string){
    if (!text) return;

    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToastMessage('Copied to clipboard');
    } catch (err) {
        console.error('Async: Could not copy text: ', err);
        showToastMessage('Could not copy to clipboard');
    }
}

function fallbackCopyTextToClipboard(text: string){
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position="fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showToastMessage('Could not copy to clipboard (Fallback)');
    }

    document.body.removeChild(textArea);
}

export function adjustMessagePosition(){
    console.log('adjustMessagePosition');
}