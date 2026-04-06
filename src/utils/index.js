const utils = {
  parseLines(text, delimiter = ',') {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === delimiter && !inQuotes) {
        row.push(field);
        field = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') {
          i += 1;
        }
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        continue;
      }

      field += char;
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  },
  mapFields(text, mapping) {
    if (!Array.isArray(mapping)) {
      return text;
    }

    const maxIndex = mapping.reduce((max, index) => {
      if (Number.isInteger(index) && index >= 0) {
        return Math.max(max, index);
      }
      return max;
    }, -1);

    if (maxIndex === -1) {
      return text;
    }

    const output = new Array(maxIndex + 1).fill('_');
    for (let i = 0; i < text.length; i += 1) {
      const target = mapping[i];
      if (Number.isInteger(target) && target >= 0) {
        output[target] = text[i];
      }
    }
    return output.join('');
  },
  fold(o) {
    const that = this;
    if (Array.isArray(o)) {
      if (o.length > 5 && typeof o[0] === 'number') {
        return `[${o.slice(0, 5).map(v => that.fold(v)).join(', ')}, ...]`;
      }
      return `[${o.map(v => that.fold(v)).join(', ')}]`;
    } else if (typeof o === 'object') {
      let out = '{';
      out += Object.entries(o).map(([key, value]) => `"${key}": ${that.fold(value)}`).join(', ');
      out += '}';
      return out;
    }
    return JSON.stringify(o);
  },
  stringify(o, indent = '') {
    const that = this;
    if (Array.isArray(o)) {
      return `[${o.map(v => that.fold(v)).join(', ')}]`;
    } else if (typeof o === 'object') {
      let out = '{\n';
      out += Object.entries(o).map(([key, value]) => `${indent}  "${key}": ${that.stringify(value, `${indent}  `)}`).join(',\n');
      out += `\n${indent}}`;
      return out;
    }
    return JSON.stringify(o);
  },
};

export function nanoid(size = 10) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < size; i += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    id += alphabet[randomIndex];
  }
  return id;
}

export default utils;
