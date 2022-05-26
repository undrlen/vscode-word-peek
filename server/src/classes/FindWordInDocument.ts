import {
  Range,
  Position,
  TextDocument
} from 'vscode-languageserver-textdocument';
import { ExampleSettings } from '../types';

export class FindWordInDocument {

  find(textDocument: TextDocument, focusPos: Position, settings: ExampleSettings): string {
    let currentPosInLine = 0;
    const range: Range = {
      start: { line: focusPos.line, character: 0 },
      end: { line: focusPos.line + 1, character: 0 }
    };
    const re = settings.supportTags ? new RegExp("(\/?>|<\/?|\"|\'|\`)", "g") : new RegExp("(\"|\'|\`)", "g");
    return textDocument.getText(range)
      .replace(re, (str) => ' '.repeat(str.length))
      .split(" ")
      .filter((el) => focusPos.character >= currentPosInLine && focusPos.character < (currentPosInLine += el.length + 1))
      .join()
      .trim();
  }
}
