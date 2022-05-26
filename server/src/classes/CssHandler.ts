
export class CssHandler {

	startComment: boolean = false;

	stripComments(line: string): string {
		if (this.startComment) {
			if (line.includes('*/')) {
				this.startComment = false;
				return line.replace(/.*\*\//g, (str) => ' '.repeat(str.length));
			} else {
				return '';
			}
		} else if (line.includes('/*')) {
			this.startComment = true;
			if (line.includes('*/')) {
				this.startComment = false;
				return line.replace(/\/\*[^]*?\*\//g, (str) => ' '.repeat(str.length));
			} else {
				return line.replace(/\/\*.*/g, '');
			}
		}
		return line;
	}

}
