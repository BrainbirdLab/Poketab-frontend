const randomChars = "ABCDEFGH**IJKLMNOPQRST**UVWXYZabcdefghij**klmnopqrstuvw**xyz0123456**789";

function* scrambleText(input: string) {
    let text = input.split("");

    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    while (true) {
        const index = getRandomInt(text.length);
        text[index] = randomChars[getRandomInt(randomChars.length)];
        yield text.join("");
    }
}

let interval: number | NodeJS.Timeout = 0;
let timeout: number | NodeJS.Timeout = 0;

export function startScrambleAnimation(initialText: string, sc: {value: string}, options: { speed: number, delay: number } = { speed: 100, delay: 0 }) {
    if (timeout) {
        clearTimeout(timeout);
    }
    if (interval) {
        clearInterval(interval);
    }
    sc.value = initialText;
    //use the delay
    timeout = setTimeout(() => {
        const generator = scrambleText(initialText);
        interval = setInterval(() => {
            const result = generator.next();
            if (!result.done && result.value) {
                sc.value = result.value;
            }
        }, options.speed); // Adjust the interval time as needed for the animation effect
    }, options.delay);
}

export function stopScrambleAnimation() {
    clearTimeout(timeout);
    clearInterval(interval);
}