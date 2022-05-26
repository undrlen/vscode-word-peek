
import { URI } from 'vscode-uri';
import { Mediator } from './classes';

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult,
  ReferenceParams,
  Location,
} from 'vscode-languageserver/node';

import {
  TextDocument
} from 'vscode-languageserver-textdocument';

import { ExampleSettings } from './types';

const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;

connection.onInitialize((params: InitializeParams) => {

  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      referencesProvider: true,
    }
  };
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
});

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = {
  supportTags: false,
  excludeFilesContainingString: ['.min.'],
  includeOnlyFolders: [],
  excludeFolders: ['node_modules'],
  excludeFileFirstLetters: ['_'],
  peekFromLanguages: [
    'html'
  ],
  trace: { server: 'verbose' }
};
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.wordPeek || defaultSettings)
    );
  }
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'wordPeek'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

async function getData(params: ReferenceParams): Promise<Location[]> {

  const folders = await connection.workspace.getWorkspaceFolders();
  if (!folders?.length) {
    return [];
  }
  const folder = folders.filter((el) => params.textDocument.uri.substring(0, el.uri.indexOf(el.name) + el.name.length) === el.uri);
  if (!folder.length) {
    return [];
  }

  const settings: ExampleSettings = await getDocumentSettings(params.textDocument.uri);
  for (const document of documents.all()) {
    if (document.uri === params.textDocument.uri) {
      return new Mediator(document, params.position, URI.parse(folder[0].uri).fsPath, settings).run().flat();
    }
  }
  return [];
}

connection.onReferences((params: ReferenceParams): Promise<Location[]> => {
  return getData(params);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
