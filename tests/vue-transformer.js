const { parse } = require('@vue/compiler-sfc');
const babelJest = require('babel-jest');

module.exports = {
  process(source, filename, config, options) {
    const { descriptor } = parse(source);
    return babelJest.process(descriptor.script.content, filename, config, options);
  },
};
