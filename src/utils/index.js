export function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

export function parseLines(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\r' && next === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function mapFields(value, fields) {
  const mapped = [];

  fields.forEach((targetIndex, sourceIndex) => {
    mapped[targetIndex] = value[sourceIndex];
  });

  return Array.from(
    { length: Math.max(...fields) + 1 },
    (_, index) => mapped[index] || '_',
  ).join('');
}

const utils = {
  parseLines,
  mapFields,
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

export default utils;
