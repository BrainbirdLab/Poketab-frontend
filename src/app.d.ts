// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface PageState {
			showQuickSettingsPanel?: boolean;
			showThemesPanel?: boolean;
			showStickersPanel?: boolean;
			showAttachmentPickerPanel?: boolean;
		}
	}
	const __VERSION__: string;
}

export {};
