
import { Matches } from '../types';

export class Sorter {

  constructor(public links: string[], public matches: Matches) { }

  sort() {
    for (const [, item] of this.matches) {
      for (const link of this.links) {
        if (item.ext === link.substring(link.lastIndexOf('.') + 1)) {
          item.links.push(link);
        }
      }
    }
  }

}
