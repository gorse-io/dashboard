const Module = require('module');
const https = require('https');

const originalLoad = Module._load;

Module._load = function load(request, parent, isMain) {
  if (request === 'spdy') {
    return {
      createServer: https.createServer,
    };
  }

  return originalLoad.apply(this, arguments);
};
