import { MessageObj, messageDatabase, lastMessageId } from "$lib/messages";
import { get, writable } from "svelte/store";
import { chatRoomStore, selfInfoStore } from "$lib/store";
import { socket } from "$lib/components/socket";
import { badWords } from "./censoredWords";

export const showReplyToast = writable(false);

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

export function makeClasslist(message: MessageObj){

    message.classList = ' end';

    if (message.sender === get(selfInfoStore).uid){
        message.classList += ' self';
    }

    if (get(chatRoomStore).maxUsers > 2 || message.replyTo){
        message.classList += ' title';
    }

    if (get(messageDatabase).size > 0){

        let lastMessageObj = get(messageDatabase).get(get(lastMessageId));
		
        if (lastMessageObj instanceof MessageObj && lastMessageObj?.type != 'sticker' && lastMessageObj?.type != 'emoji'){
            if (lastMessageObj?.sender !== message.sender){
                message.classList += ' newGroup';
            }
            if (message.type == 'sticker'){
                message.classList += ' start';
                return message.classList;
            }
    
            if (lastMessageObj.sender === message.sender && message.type != 'emoji' && !message.replyTo){
                //last message is from the same user
                lastMessageObj.classList = lastMessageObj.classList.replace('end', '');
            } else {
                message.classList += ' start';
            }
        } else {
            message.classList += ' start';
        }

    } else {
        message.classList += ' start';
    }

	if (!message.classList.includes('start')){
		message.classList = message.classList.replace('title', '');
	}

    return message.classList;
}

export function sendMessage(message: MessageObj, tempId: string){
    socket.emit('newMessage', message, (messageId: string) => {
        messageDatabase.update(msg => {
            message.sent = true;
			message.id = messageId;
            msg.delete(tempId);
            msg.set(messageId, message);
            return msg;
        });

        lastMessageId.set(messageId);

        if (document.hasFocus()){
            socket.emit('seen', get(selfInfoStore).uid, get(lastMessageId));
        }
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
			//console.log(`Language found: ${lang} lang=='' ${lang == ''} lang==undefined ${lang == undefined} isSupportedLanguage ${this.isSupportedLanguage(lang)}`);
			if (lang == '' || lang == undefined || !this.isSupportedLanguage(lang)) {
				//console.log(`Unsupported language: ${lang}`);
				lang = 'txt';
			}
			console.log(`Language found: ${lang}`);
			lang = `class="language-${lang} line-numbers" data-lang="${lang}"`;
			return `
				<pre ${lang}>
					<button class="copy-btn" title="Copy to clipboard">Copy</button>
					<span class="line-row">
						${code.trim().split('\n').map((line: string, index: number) => `<span class="line-number">${index + 1}</span>`).join('')}
					</span>
					<code>
						${code.trim()}
					</code>
				</pre>
			`;
		});
	}
		
	isSupportedLanguage(lang: string) {
		const supportedLangs = ['js', 'py', 'java', 'html', 'css', 'cpp', 'c', 'php', 'sh', 'sql', 'json', 'txt', 'xml', 'cs', 'go', 'rb', 'bat'];
		return supportedLangs.includes(lang);
	}

	// Function to parse mono text
	parseMono(text: string) {
		return text.replace(this.monoRegex, '<code>$1</code>');
	}
  
	// Function to parse links
	parseLink(text: string) {
		//console.log(`Parsing links: ${text}`);
		return text.replace(this.linkRegex, '<a href=\'$&\' rel=\'noopener noreferrer\' target=\'_blank\'>$&</a>');
	}
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
		':sweat:': '😅'
	};

	//find if the message contains the emoji
	for (const [key, value] of Object.entries(emojiMaps)){
		if (text.indexOf(key) != -1){
			const position = text.indexOf(key);
			//all charecter regex
			const regex = /[a-zA-Z0-9_!@#$%^&*()+\-=[\]{};':"\\|,.<>/?]/;
			//if there is any kind of charecters before or after the match then don't replace it. 
			if (text.charAt(position - 1).match(regex) || text.charAt(position + key.length).match(regex)){
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