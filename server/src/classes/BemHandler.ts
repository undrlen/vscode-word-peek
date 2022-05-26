
export class BemHandler {

	numberOfSpaces: number = 0;
	parents = new Map;

	constructor(public word: string) { }

	get parent(): string {
		return Array.from(this.parents).reduce(([a, b], [c, d]) => c === this.numberOfSpaces ? [NaN, b] : Number.isNaN(a) ? [a, b] : [c, d])[1];
	}

	set parent(line: string) {

		this.numberOfSpaces = line.search(/\S/);
		if (!this.numberOfSpaces) {
			this.parents.clear();
			this.parents.set(0, line.trim().substring(1));
		} else if (line.includes('&')) {
			this.parents.set(this.numberOfSpaces, line.replace('&', this.parent).trim());
		} else {
			this.parents.set(this.numberOfSpaces, this.parent + line.trim());
		}

	}

	get selectors(): string[] {

		let selector = "";
		const options: string[] = [];

		this.word
			.replace(/_?_[^_\s]+/g, (str) => " " + str)
			.split(" ")
			.forEach((el) => options.push(selector += el));

		return options.filter((_, i, arr) => i !== arr.length - 1);
	}

	findWord(line: string): string {
		if (line.trim()[0] === '&' && line.includes('_')) {

			if (this.parents.get(this.numberOfSpaces) === this.word) {
				return line.trim().substring(1);
			}

		} else if (line.includes('&')) {
			if (this.parent === this.word) {
				return '&';
			}
		} else {

			this.selectors.forEach((selector) => {
				if (line.trim().substring(line.trim().length - selector.length - 1) === '.' + selector) {
					this.parents.set(this.numberOfSpaces, selector);
				}
			});
		}

		return '';
	}
}
