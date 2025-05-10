const utils = {
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
