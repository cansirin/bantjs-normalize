var through = require('through2');
var defined = require('defined');
var path = require('path');


module.exports = function (opts) {
  if (!opts) opts = {};

  var rows = [];

  return through.obj(write, end);

  function write (row, enc, cb) { 
    if (isVinylBuffer(row) && row.isBuffer()) {
      var basedir = row.base;
      row = JSON.parse(row.contents);
      row.basedir = basedir;
    }
    rows.push(row);
    cb(); 
  }

  function end () { normalize.bind(this, rows, opts)(); }
};

function normalize (rows, opts) {
  var self = this;

  rows.forEach(function (row, i) {
    var files = [],
        basedir = path.resolve(defined(row.basedir, opts.basedir, process.cwd())),
        scripts = [];

    row.basedir = basedir;
    row.id = defined(row.id, 'module_' + i);

    if (has(row, 'main')) {
      row.main = path.resolve(basedir, row.main);
      scripts.push({
        file: row.main,
        expose: defined(row.expose, row.id),
        entry: true
      });
    }
    
    row.scripts = scripts.concat(defined(row.scripts, []).filter(Boolean)
      .map(function (file) {
        return { file: path.resolve(basedir, file) };
      }));
    
    self.push(row);
  });

  self.push(null);
}

function isVinylBuffer (row) { return row && typeof row.isBuffer === 'function'; }

function has (row, key) { return row && row.hasOwnProperty(key); }

