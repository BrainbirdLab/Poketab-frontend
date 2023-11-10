

export function toSentenceCase(inputString: string) {
    return inputString.replace(/(^|\. )\w/g, (match) => match.toUpperCase());
}