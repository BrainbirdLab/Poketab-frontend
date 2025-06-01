import { MessageObj, FileMessageObj, lastMessageId, messageDatabase, TextMessageObj } from "$lib/messageStore.svelte";
import { chatRoomStore, DEVMODE, myId, outgoingXHRs } from "$lib/store.svelte";
import { socket } from "$lib/connection/socketClient";
import { badWords } from "./censoredWords";
import { generateId, playMessageSound } from "$lib/utils";
import { encryptMessage, encryptSymmetricKey, makeSymmetricKey  } from "$lib/e2e/encryption";
import { getLinkMetadata } from "$lib/linkmetaParser";
import { PUBLIC_API_SERVER_URL } from "$env/static/public";
import { ref } from "$lib/ref.svelte";

export const showReplyToast = ref(false);
export const editMessage = ref(false);

export function getFormattedDate(time: number) {
	const currentTime = Date.now();
	const differenceInSeconds = Math.floor((currentTime - time) / 1000);

	if (differenceInSeconds === 0) {
		return 'Just now';
	} else if (differenceInSeconds < 60) {
		return `${differenceInSeconds} secs ago`;
	} else if (differenceInSeconds < 120) {
		return '1 min ago';
	} else if (differenceInSeconds < 600) {
		return `${Math.floor(differenceInSeconds / 60)} mins ago`;
	} else {
		return new Intl.DateTimeFormat('default', {
			hour: 'numeric',
			minute: 'numeric'
		}).format(time);
	}
}

export function getSize(size: number) {
	if (size < 1024) {
		return size + " Bytes";
	} else if (size < 1024 * 1024) {
		return (size / 1024).toFixed(2) + " Kb";
	} else if (size < 1024 * 1024 * 1024) {
		return (size / 1024 / 1024).toFixed(2) + " Mb";
	} else {
		return (size / 1024 / 1024 / 1024).toFixed(2) + " Gb";
	}
}

export function remainingTime(totalTime: number, elapsedTime: number) {
	// Check if totalTime and elapsedTime are finite numbers and if totalTime is greater than 0
	if(isFinite(totalTime) && totalTime > 0 && isFinite(elapsedTime)){
		// Calculate the remaining time
		const remaining = Math.floor(totalTime) - Math.floor(elapsedTime);
		// Calculate the minutes and seconds from the remaining time
		const minutes = Math.floor(remaining / 60);
		const seconds = Math.floor(remaining % 60);
		// Return the remaining time in the format "mm:ss"
		return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
	}else{
		// Return "00:00" if totalTime and elapsedTime are not valid numbers
		return '00:00';
	}
}

export async function sendEditedMessage(message: TextMessageObj) {
	if (!message.id || !message.message || message.message.trim() === '') {
		return;
	}

	//convert msg object to ArrayBuffer
	const buffer = new TextEncoder().encode(JSON.stringify(message));
	const arrayBuffer = buffer.buffer as ArrayBuffer;

	const rawSmKey = await makeSymmetricKey();
	message.smKey = rawSmKey;

	messageDatabase.update((messages) => {
		const index = messageDatabase.getIndex(message.id);
		console.log(message);
		if (index !== -1) {
			(messages[index] as TextMessageObj).message = message.message;
			(messages[index] as TextMessageObj).smKey = message.smKey;
			(messages[index] as TextMessageObj).type = isEmoji(message.message) ? 'emoji' : 'text';
			(messages[index] as TextMessageObj).edited = true;
		}
		return messages;
	});

	// if only one user in the chat room, or DEVMODE is on, return
	if (Object.keys(chatRoomStore.value.userList).length < 2 || DEVMODE.value){
		getLinkMetadata(message);
		return;
	}

	const smKeys: {[key: string]: ArrayBuffer} = {};

	for (const [key, value] of Object.entries(chatRoomStore.value.userList)) {
		if (key != myId.value) {
			if (!value.publicKey){
				continue;
			}
			const enSmKey = await encryptSymmetricKey(rawSmKey, value.publicKey);
			smKeys[key] = enSmKey;
		}
	}

	//encrypt the message
	const encryptedMessage = await encryptMessage(arrayBuffer, rawSmKey);
	socket.emit('editMessage', encryptedMessage, chatRoomStore.value.Key, smKeys, () => {
		getLinkMetadata(message);
	});
}

export async function sendMessage(message: MessageObj, file?: File){

	const rawSmKey = await makeSymmetricKey();

	message.sender = myId.value;
	message.id = generateId(16);
	message.smKey = rawSmKey;

	messageDatabase.add(message);

	// if only one user in the chat room, or DEVMODE is on, return
	if (Object.keys(chatRoomStore.value.userList).length < 2 || DEVMODE.value){
		messageDatabase.markDelevered(message, message.id);
		if (file) {
			(messageDatabase.getMessage(message.id) as FileMessageObj).loaded = 100;
		}
		getLinkMetadata(message);
		return;
	}

	const smKeys: {[key: string]: ArrayBuffer} = {};

	for (const [key, value] of Object.entries(chatRoomStore.value.userList)) {
		if (key != myId.value) {
			if (!value.publicKey){
				continue;
			}
			const enSmKey = await encryptSymmetricKey(rawSmKey, value.publicKey);
			smKeys[key] = enSmKey;
		}
	}

	//convert msg object to ArrayBuffer
	const buffer = new TextEncoder().encode(JSON.stringify(message));
	const arrayBuffer = buffer.buffer as ArrayBuffer;
	//encrypt the message
	const encryptedMessage = await encryptMessage(arrayBuffer, rawSmKey);
	
    socket.emit('newMessage', encryptedMessage, chatRoomStore.value.Key, smKeys, (messageId: string) => {
		
		messageDatabase.markDelevered(message, messageId);
		getLinkMetadata(message);
		
		if (message.type === 'sticker'){
			playMessageSound('sticker');
		} else {
			playMessageSound('outgoing');
		}
		
		if (file){

			if (Object.keys(chatRoomStore.value.userList).length < 2 ){
				(message as FileMessageObj).loaded = 100;
				return;
			}

			//encrypt the file with the symmetric key
			const reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = async () => {
				const fileBuffer = reader.result as ArrayBuffer;

				const encryptedFileBuffer = await encryptMessage(fileBuffer, rawSmKey);
				const encryptedFile = new Blob([encryptedFileBuffer], {type: 'application/octet-stream'});
				
				//create form data
				const formData = new FormData();
				formData.append('file', encryptedFile);
				const xhr = new XMLHttpRequest();
	
				outgoingXHRs.value.set(message.id, xhr);
	
				xhr.open('POST', `${PUBLIC_API_SERVER_URL}/api/files/upload/${chatRoomStore.value.Key}/${myId.value}/${message.id}`);
	
				//progress event
				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable){
						const percent = (e.loaded / e.total) * 100;
						updateProgress(percent, message as FileMessageObj);
					}
				}
				xhr.send(formData);
			}
			
		}
		
		if (document.hasFocus()){
			socket.emit('seen', myId.value, chatRoomStore.value.Key, lastMessageId.value);
		}

    });
}


function updateProgress(percent: number, message: FileMessageObj) {
	//update message
	messageDatabase.update((messages) => {
		(messageDatabase.getMessage(message.id) as FileMessageObj).loaded = Math.round(percent);
		return messages;
	});
}


export function escapeXSS(text: string) {
	if (text == null || text == '' || typeof text !== 'string'){
		return '';
	}
	// Define the characters that need to be escaped
	const escapeChars: {[key: string]: string} = {
		'\'': '&apos;',
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'"': '&quot;'
	};

	return text.replace(/[<>'"&]/g, match => escapeChars[match]);
}


/**
 * Class to parse text and return HTML
 * Supported markdown codes:
 * 1. Bold: **bold text**
 * 2. Italic: _italic text_
 * 3. Strike-through: ~~strike-through text~~
 * 4. Heading 1-6: # Heading 1 to ###### Heading 6
 * 5. Code block: ```language
 * 					code block
 * 				```
 * 6. Inline code: `inline code`
 * 7. Links: https://www.google.com
 * 8. Emojis: 😄
 * 9. Escaping: \* to escape bold, \_ to escape italic, \~ to escape strike-through, \# to escape heading, \` to escape inline code
 */
export class TextParser {

    boldRegex: RegExp;
    italicRegex: RegExp;
    strikeRegex: RegExp;
    headingRegex: RegExp;
    codeRegex: RegExp;
    monoRegex: RegExp;
    escapeBackTicksRegex: RegExp;
    escapeBoldRegex: RegExp;
    escapeItalicRegex: RegExp;
    escapeStrikeRegex: RegExp;
    escapeHeadingRegex: RegExp;
    linkRegex: RegExp;
    emojiRegex: RegExp;

	constructor() {
		// Define regular expressions for parsing different markdown codes
		this.boldRegex = /\*\*([^*]+)\*\*/g;
		this.italicRegex = /__([^_]+)__/g;
		this.strikeRegex = /~~([^~]+)~~/g;
		this.headingRegex = /^#+\s+(.+)$/gm;
		this.codeRegex = /```([^`]+)```/g;
		this.monoRegex = /`([^`]+)`/g;
		this.escapeBackTicksRegex = /\\`/g;
		this.escapeBoldRegex = /\\\*/g;
		this.escapeItalicRegex = /\\_/g;
		this.escapeStrikeRegex = /\\~/g;
		this.escapeHeadingRegex = /\\#/g;
		this.linkRegex = /(https?:\/\/[^\s]+)/g;
		this.emojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/;
	}
  
	// Function to parse text and return HTML
	parse(text: string) {
		if (text == null || text == ''){
			return '';
		}

		//parse links
		text = this.parseLink(text);

		// Parse markdown codes
		text = this.escapeBackTicks(text);
		text = this.escapeItalic(text);
		text = this.escapeStrike(text);
		text = this.escapeBold(text);
		text = this.escapeHeading(text);

		text = this.parseBold(text);
		text = this.parseItalic(text);
		text = this.parseStrike(text);
		text = this.parseHeading(text);
		text = this.parseCode(text);
		text = this.parseMono(text);

		return text;
	}
  
	// Function to parse bold text
	parseBold(text: string) {
		return text.replace(this.boldRegex, '<strong>$1</strong>');
	}

	escapeBackTicks(text: string){
		return text.replace(this.escapeBackTicksRegex, '&#96;');
	}

	escapeBold(text: string){
		return text.replace(this.escapeBoldRegex, '&#42;');
	}

	escapeItalic(text: string){
		return text.replace(this.escapeItalicRegex, '&#95;');
	}

	escapeStrike(text: string){
		return text.replace(this.escapeStrikeRegex, '&#126;');
	}

	escapeHeading(text: string){
		return text.replace(this.escapeHeadingRegex, '&#35;');
	}
  
	// Function to parse italic text
	parseItalic(text: string) {
		return text.replace(this.italicRegex, '<em>$1</em>');
	}
  
	// Function to parse strike-through text
	parseStrike(text: string) {
		return text.replace(this.strikeRegex, '<del>$1</del>');
	}
  
	// Function to parse headings
	parseHeading(text: string) {
		text = text.replace(/^(#{1,6})\s(.*)$/gm, function(match, p1, p2) {
			const level = p1.length;
			return `<h${level}>${p2}</h${level}>`;
		});
		return text;
	}
  
	// Function to parse code blocks
	parseCode(text: string) {
		const regex = /```(\w*)([^`]+?)```/gs;
		return text.replace(regex, (match, lang: string, code: string) => {
			if (lang == '' || lang == undefined || !this.isSupportedLanguage(lang)) {
				lang = 'txt';
			}
			lang = `class="language-${lang} line-numbers" data-lang="${lang}"`;
			return `<pre ${lang}><div class="copy-btn" title="Copy to clipboard" data-action="Copy"></div><span class="line-row">${code.trim().split('\n').map(() => '<span class="line-number"></span>').join('')}</span><code>${formatCode(code)}</code></pre>`;
		});
	}
		
	isSupportedLanguage(lang: string) {
		const supportedLangs = ['js', 'ts', 'py', 'java', 'html', 'css', 'cpp', 'c', 'php', 'sh', 'sql', 'json', 'txt', 'xml', 'cs', 'go', 'rb', 'bat', 'rs', 'swift', 'kt', 'lua', 'dart', 'r', 'scala', 'vb', 'asm', 'ini', 'perl', 'coffee', 'h', 'm', 'pl', 'lisp', 'hs', 'erl', 'pas', 'd', 'groovy', 'fs', 'jl', 'vbnet', 'clojure', 'tcl', 'matlab', 'vbscript', 'objectivec', 'delphi', 'rust', 'elixir', 'fsharp', 'powershell', 'scheme', 'haskell', 'ocaml', 'prolog', 'pascal', 'livescript', 'julia', 'elm', 'erlang', 'dlang', 'coffeescript', 'csharp', 'c++', 'c#', 'objective-c'];
		return supportedLangs.includes(lang);
	}

	// Function to parse mono text
	parseMono(text: string) {
		return text.replace(this.monoRegex, '<code>$1</code>');
	}
  
	// Function to parse links
	parseLink(text: string) {
		return text.replace(this.linkRegex, '<a href=\'$&\' rel=\'noopener noreferrer\' target=\'_blank\'>$&</a>');
	}
}

function formatCode(inputCode: string, spacesPerIndent = 2) {
    const lines = inputCode.split('\n');
    let currentIndentation = 0;
    let formattedCode = '';

    lines.forEach(line => {
        // Trim leading and trailing whitespaces
        const trimmedLine = line.trim();

        // Update current indentation based on colons (for Python) or braces (for JavaScript)
        if (trimmedLine.endsWith(':') || trimmedLine.endsWith('{')) {
            formattedCode += ' '.repeat(currentIndentation) + trimmedLine + '\n';
            currentIndentation += spacesPerIndent;
        } else if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']') || trimmedLine.startsWith(')')) {
            currentIndentation = Math.max(0, currentIndentation - spacesPerIndent);
            formattedCode += ' '.repeat(currentIndentation) + trimmedLine + '\n';
        } else {
            formattedCode += ' '.repeat(currentIndentation) + trimmedLine + '\n';
        }
    });

    return formattedCode.trim();
}

// Trim leading and trailing whitespaces from the formatted code and return a shortened version if it exceeds 1000 characters
export function getTextData(message: string){
	const elem = document.createElement('div');
	elem.innerHTML = message;
	const text = elem.innerText;
	if(text.length > 150){
		return text.slice(0, 140) + '...' + text.slice(-20);
	}
	return text;
}

export function shortenString(message: string, maxLength: number){
	// example input: "Hello, this is a very long message. I want to shorten it."
	// example output: "Hello, this...shorten it."

	if (message.length <= maxLength){
		return message;
	}

	const firstHalf = message.slice(0, maxLength / 2);
	const secondHalf = message.slice(-maxLength / 2);

	return firstHalf + '...' + secondHalf;
}

/**
 * Checks if a string is a single or continuous group of emoji characters
 */
export function isEmoji(message: string): boolean{
	const regex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/;
	return regex.test(message);
}

/**
 * Parses emoji from text and returns the parsed text [e.g. :D => 😀, :P => 😛, etc]
 */
export function emojiParser(text: string){

	if (text == null || text == ''){
		return '';
	}

	const emojiMaps = {
		':)': '🙂',
		':\'(': '😢',
		':D': '😀',
		':P': '😛',
		':p': '😛',
		':O': '😮',
		':o': '😮',
		':|': '😐',
		':/': '😕',
		';*': '😘',
		':*': '😗',
		'>:(': '😠',
		':(': '😞',
		'o3o': '😗',
		'^3^': '😙',
		'^_^': '😊',
		'<3': '❤️',
		'>_<': '😣',
		'>_>': '😒',
		'-_-': '😑',
		'XD': '😆',
		'xD': '😆',
		'B)': '😎',
		';)': '😉',
		'T-T': '😭',
		':aww:': '🥺',
		':lol:': '😂',
		':haha:': '🤣',
		':hehe:': '😅',
		':meh:': '😶',
		':hmm:': '😏',
		':wtf:': '🤨',
		':yay:': '🥳',
		':yolo:': '🤪',
		':yikes:': '😱',
		':sweat:': '😅',
		':love:': '😍',
		':angry:': '😡',
		':heart:': '❤️',
		':fire:': '🔥',
		':cool:': '😎',
		':cry:': '😢',
		':sad:': '😞',
		':happy:': '😊',
		':wow:': '😲',
		':shock:': '😲',
		':sigh:': '😔',
		':sob:': '😭',
	};

	//find if the message contains the emoji
	for (const [key, value] of Object.entries(emojiMaps)){
		if (text.indexOf(key) != -1){
			const position = text.indexOf(key);
			//all charecter regex
			const regex = /[a-zA-Z0-9_!@#$%^&*()+\-=[\]{};':"\\|,.<>/?]/;
			//if there is any kind of charecters before or after the match then don't replace it. 
			if (RegExp(regex).exec(text.charAt(position - 1)) || RegExp(regex).exec(text.charAt(position + key.length))){
				continue;
			}else{
				text = text.replaceAll(key, value);
			}
		}
	}
	return text;
}

export function sanitizeImagePath(path: string){
	//path regex will contain normal characters, numbers, underscores, hyphens and base64 characters
	const regex = /[<>&'"\s]/g;

	if (!path.match(regex)){
		return path;
	}else{
		return '/images/danger-mini.webp';
	}
}

/**
 * Removes all charecter [<, >, ', "] from string
 */
export function sanitize(str: string){
	if (str == null || str == ''){
		return '';
	}
	str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\//g, '&#x2F;');
	return str;
}

export function filterBadWords(message: string){

    const words = message.split(' ');

    const filteredWords = words.map(word => {
		const lowerCaseWord = word.toLowerCase();
		if (badWords.has(lowerCaseWord)) {
			const firstLetter = word[0];
			const lastLetter = word[word.length - 1];
			const censoredPart = '*'.repeat(word.length - 2); // Replacing characters with '*'
			return `${firstLetter}${censoredPart}${lastLetter}`;
		}
		return word;
	});
    return filteredWords.join(' ');
}