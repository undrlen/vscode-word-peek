import { PathLike, readdirSync } from "fs";
import { ExampleSettings, Matches } from "../types";

export class ReadDirectories {
  links: Set<string> = new Set();
  customLinks: string[] = [];

  findCustomFoldersLink(folder: PathLike, includeOnlyFolders: string[]): void {

    readdirSync(folder, { withFileTypes: true }).forEach((item) => {
      if (item.isDirectory() && includeOnlyFolders.length) {

        if (includeOnlyFolders.some((dir) => item.name === dir)) {
          this.customLinks.push(folder + "\\" + item.name);
        }
        this.findCustomFoldersLink(folder + "\\" + item.name, includeOnlyFolders.filter((el) => el !== item.name));
      }
    });
  }

  readOneDirectory(
    folder: PathLike,
    extensions: string[],
    excludeFileFirstLetters: string[],
    excludeFolders: string[],
    excludeFilesContainingString: string[]
  ): void {
    readdirSync(folder, { withFileTypes: true }).forEach((item) => {
      if (
        item.isDirectory() &&
        excludeFolders.every((folder) => item.name !== folder)
      ) {
        this.readOneDirectory(
          folder + "\\" + item.name,
          extensions,
          excludeFileFirstLetters,
          excludeFolders,
          excludeFilesContainingString
        );
      } else if (
        item.isFile() &&
        extensions.some(
          (ext) => item.name.substring(item.name.length - ext.length) === ext
        ) &&
        excludeFileFirstLetters.every(
          (symbol) => symbol !== item.name.slice(0, symbol.length)
        ) &&
        excludeFilesContainingString.every((str) => !item.name.includes(str))
      ) {
        this.links.add(folder + "\\" + item.name);
      }
    });
  }

  read(folder: PathLike, settings: ExampleSettings, matches: Matches): string[] {

    const {
      excludeFileFirstLetters,
      excludeFolders,
      excludeFilesContainingString,
      includeOnlyFolders,
    } = settings;
    const extensions = matches.map(([, obj]) => "." + obj.ext);

    if (includeOnlyFolders.length) {
      this.findCustomFoldersLink(
        folder,
        includeOnlyFolders
      );
      this.customLinks.forEach((link) => {
        this.readOneDirectory(
          link,
          extensions,
          excludeFileFirstLetters,
          excludeFolders,
          excludeFilesContainingString
        );
      });
      return Array.from(this.links);
    }

    this.readOneDirectory(
      folder,
      extensions,
      excludeFileFirstLetters,
      excludeFolders,
      excludeFilesContainingString
    );

    return Array.from(this.links);
  }
}
