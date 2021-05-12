const utils = {
  parseLines(text, sep) {
    const table = [];
    let quoted = false;
    let fields = [];
    let cell = '';
    const lines = text.split(/\r?\n/);
    lines.forEach((line) => {
      // start of line
      if (quoted) {
        cell += '\r\n';
      }
      // skip empty line
      if (line.length === 0) {
        return;
      }
      // parse line
      for (let i = 0; i < line.length; i += 1) {
        if (line[i] === sep && !quoted) {
          // end of field
          fields.push(cell);
          cell = '';
        } else if (line[i] === '"') {
          if (quoted) {
            if (i + 1 >= line.length || line[i + 1] !== '"') {
              // end of quoted
              quoted = false;
            } else {
              i += 1;
              cell += '"';
            }
          } else {
            // start of quoted
            quoted = true;
          }
        } else {
          cell += line[i];
        }
      }
      // end of line
      if (!quoted) {
        fields.push(cell);
        table.push(fields);
        cell = '';
        fields = [];
      }
    });
    return table;
  },
  mapFields(data, placement) {
    if (data.length !== placement.length) {
      throw 'the length of data and placement must be equal';
    }
    const length = Math.max.apply(null, placement);
    const mapping = new Array(length).fill('_');
    for (let i = 0; i < placement.length; i += 1) {
      mapping[placement[i]] = data[i];
    }
    return mapping.join('');
  },
};

export default utils;
