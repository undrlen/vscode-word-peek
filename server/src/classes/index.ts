
import { readFileSync } from 'fs';
import { URI } from 'vscode-uri';
import { Location } from 'vscode-languageserver';
import {
  Position,
  TextDocument
} from 'vscode-languageserver-textdocument';
import { FindWordInDocument } from './FindWordInDocument';
import { ReadDirectories } from './ReadDirectories';
import { SassHandler } from './SassHandler';
import { ScssHandler } from './ScssHandler';
import { CssHandler } from './CssHandler';
import { BemHandler } from './BemHandler';
import { Sorter } from './Sorter';
import { Matches, ExampleSettings } from '../types';

export class Mediator {

  result: Location[][] = [];

  matches: Matches = [
    [new SassHandler(), { ext: 'sass', links: [] }],
    [new ScssHandler(), { ext: 'scss', links: [] }],
    [new ScssHandler(), { ext: 'less', links: [] }],
    [new CssHandler(), { ext: 'css', links: [] }],
  ];

  constructor(public textDocument: TextDocument, public focusPosition: Position, public workspaceFolder: string, public settings: ExampleSettings) { }

  word: string = new FindWordInDocument().find(this.textDocument, this.focusPosition, this.settings);
  links: string[] = new ReadDirectories().read(this.workspaceFolder, this.settings, this.matches);

  run(): Location[][] {
    new Sorter(this.links, this.matches).sort();
    const bem = new BemHandler(this.word);

    for (const [handler, obj] of this.matches) {
      const locations: Location[] = [];

      obj.links.forEach((link) => {
        readFileSync(link, 'utf-8')
          .split(/\r?\n/)
          .map((line) => handler.stripComments(line))
          .forEach((line, i) => {

            let word: string = line.includes(this.word) ? this.word : '';

            if (obj.ext !== 'css' && line.trim()) {
              bem.parent = line;
              if (!word) {
                word = bem.findWord(line);
              }
            }

            if (word) {
              locations.push({
                uri: URI.file(link).path,
                range: {
                  start: { line: i, character: line.indexOf(word) },
                  end: { line: i, character: line.indexOf(word) + word.length }
                }
              });
            }
          });
      });

      this.result.push(locations);
    }
    return this.result;
  }

}


