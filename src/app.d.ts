// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		// Variables for the modals
		interface PageState {
			showQuickSettingsPanel?: boolean;
			showThemesPanel?: boolean;
			showStickersPanel?: boolean;
			showAttachmentPickerPanel?: boolean;
			viewImage?: string;
		}
	}
	const __VERSION__: string;
}

export {};
