let popupTimeout: number | null = null;
/**
 * Shows a toast message for 1 second
 * @param {string} text Text to show in the popup
 */

const styles = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 100px;
    left: 50%;
    background: #000000bb;
    padding: 10px;
    border-radius: 15px;
    font-size: 0.6rem;
    transform: translateX(-50%);
    backdrop-filter: blur(2px);
    z-index: 110;
    visibility: hidden;
    opacity: 0;
    transition: 100ms ease-in-out;
`;

export function showToastMessage(text: string) {

	const body = document.querySelector('body');

	let popup = document.querySelector('.toast-message') as HTMLDivElement;

	if (!popup) {
		popup = document.createElement('div') as HTMLDivElement;
		popup.classList.add('toast-message');
		popup.style.cssText = styles;
		body?.appendChild(popup);
	}

	popup.textContent = text;
	popup.style.visibility = 'visible';
	popup.style.opacity = '1';

	if (popupTimeout) {
		clearTimeout(popupTimeout);
	}

	popupTimeout = setTimeout(function () {
		if (!popup) return;
		popup.style.visibility = 'hidden';
		popup.style.opacity = '0';
		setTimeout(() => {
			popup.remove();
		}, 150);
		popupTimeout = null;
	}, 1000);
}