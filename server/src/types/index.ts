
interface Handlers {
	stripComments(line: string): string;
}

export type Matches = [Handlers, { ext: string, links: string[] }][];

export interface ExampleSettings {
	supportTags: boolean;
	excludeFilesContainingString: string[];
	includeOnlyFolders: string[];
	excludeFolders: string[];
	excludeFileFirstLetters: string[];
	peekFromLanguages: string[];
	trace: { server: string; };
}
