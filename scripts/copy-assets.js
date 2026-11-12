'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
for (const dir of ['nodes', 'credentials']) {
	const walk = (rel) => {
		for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
			const r = path.join(rel, entry.name);
			if (entry.isDirectory()) walk(r);
			else if (/\.(svg|png|json)$/.test(entry.name)) {
				const dest = path.join(root, 'dist', r);
				fs.mkdirSync(path.dirname(dest), { recursive: true });
				fs.copyFileSync(path.join(root, r), dest);
			}
		}
	};
	walk(dir);
}
