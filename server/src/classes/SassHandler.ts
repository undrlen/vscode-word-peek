
export class SassHandler {

  startComment: boolean = false;
  numberOfSpaces: number = 0;

  stripComments(line: string): string {

    if (this.startComment) {
      if (line.search(/\S/) > this.numberOfSpaces) {
        return '';
      } else {
        this.startComment = false;
        this.numberOfSpaces = 0;
        return line;
      }
    } else if (line.includes('/*')) {
      this.startComment = true;
      if (line.includes('*/')) {
        this.startComment = false;
        return line.replace(/\/\*[^]*?\*\//g, (str) => ' '.repeat(str.length));
      } else {
        this.numberOfSpaces = line.search(/\S/);
        return line.replace(/\/\*.*/g, '');
      }
    } else if (line.includes('//')) {
      this.startComment = true;
      this.numberOfSpaces = line.search(/\S/);
      return line.replace(/\/\/.*/g, '');
    }

    return line;
  }

}
