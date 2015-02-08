var through = require('through2');
var path = require('path');
var defined = require('defined');
var toposort = require('toposort');
var debug = require('debug')('bant:normalize');


module.exports = function (opts) {
  if (!opts) opts = {};

  var rows = [];

  return through.obj(write, end);

  function write (row, enc, cb) { 
    if (isVinylBuffer(row) && row.isBuffer()) {
      var basedir = path.dirname(row.path);
      row = JSON.parse(row.contents);
      row.basedir = basedir;
    }
    rows.push(row);
    cb(); 
  }

  function end () { normalize.bind(this, rows, opts)(); }
};

function normalize (rows, opts) {
  var self = this,
      nodes = [], edges = [], index = {};

  rows.forEach(function (row, i) {
    var files = [],
        basedir = path.resolve(defined(row.basedir, opts.basedir, process.cwd())),
        scripts = [];

    row.basedir = basedir;
    row.name = defined(row.name, 'module_' + i);
    row.locals = defined(row.locals, []);

    if (has(row, 'main')) {
      var obj = {
        file: row.main,
        expose: defined(row.expose, row.name),
        entry: true
      };

      if (!isStream(row.main))
        obj.file = path.resolve(basedir, row.main);
      else
        obj.basedir = basedir;

      scripts.push(obj);
    }
    
    row.scripts = scripts.concat(defined(row.scripts, []).filter(Boolean)
      .map(function (file) {
        var obj = { file: row.main };
        if (!isStream(file))
          obj.file = path.resolve(basedir, file);
        else
          obj.basedir = basedir;
        return obj;
      }));
    
    nodes.push(row.name);
    row.locals.forEach(function (name) {
      edges.push([row.name, name]);
    });

    index[row.name] = row;
  });

  rows = toposort.array(nodes, edges).reverse().map(function (name) {
    return index[name];
  });

  rows.forEach(function (row) { self.push(row); });

  self.push(null);
}

function isVinylBuffer (row) { return row && typeof row.isBuffer === 'function'; }

function has (row, key) { return row && row.hasOwnProperty(key); }

function isStream (s) { return s && typeof s.pipe === 'function'; }

