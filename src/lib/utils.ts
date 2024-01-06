import { cubicOut } from "svelte/easing";
import { showToastMessage } from "./components/toast";


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