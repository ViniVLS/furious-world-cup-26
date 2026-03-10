const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

function incrementVersion(version) {
    let parts = version.split('.').map(Number);

    // Incrementa a última parte
    let i = parts.length - 1;
    parts[i]++;

    // Ripple carry logic (máximo 9 por unidade)
    while (i >= 0 && parts[i] > 9) {
        parts[i] = 0;
        i--;
        if (i >= 0) {
            parts[i]++;
        } else {
            // Se estourar a primeira casa (ex: 9.9.9), adiciona um novo dígito no início
            parts.unshift(1);
        }
    }

    return parts.join('.');
}

const newVersion = incrementVersion(pkg.version);
pkg.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`[SKILL VERSION] Updated version to: ${newVersion}`);
