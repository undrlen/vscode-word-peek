
import { join } from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		join('server', 'out', 'server.js')
	);

	function getDocumentSelector() {
		return workspace.getConfiguration('wordPeek').peekFromLanguages
			.map((lang) => ({ language: lang, scheme: 'file' }));
	}

	function afterGettingConfig() {

		if (client) {
			client.stop();
		}
		// The debug options for the server
		// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
		const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

		// If the extension is launched in debug mode then the debug server options are used
		// Otherwise the run options are used
		const serverOptions: ServerOptions = {
			run: { module: serverModule, transport: TransportKind.ipc },
			debug: {
				module: serverModule,
				transport: TransportKind.ipc,
				options: debugOptions
			}
		};

		if (!workspace.workspaceFolders) {
			return;
		}

		// Options to control the language client
		const clientOptions: LanguageClientOptions = {
			documentSelector: getDocumentSelector()
		};

		// Create the language client and start the client.
		client = new LanguageClient(
			'wordPeek',
			'Word Peek',
			serverOptions,
			clientOptions
		);

		// Start the client. This will also launch the server
		client.start();
	}

	afterGettingConfig();
	workspace.onDidChangeConfiguration(afterGettingConfig);

}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
