
export class ScssHandler {

	startComment: boolean = false;

	stripBraces(line: string): string {

		if (line.includes('{') && line.includes('}')) {
			return line.replace(/{.*}/g, '');
		} else {
			return line.replace(/{|}/g, '');
		}

	}

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
		} else if (line.includes('//')) {
			return line.replace(/\/\/.*/g, '');
		}

		if (line.includes('{') || line.includes('}')) {
			return this.stripBraces(line);
		}
		return line;
	}

}
