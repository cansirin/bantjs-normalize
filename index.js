var fs = require('fs');
var path = require('path');
var splicer = require('labeled-stream-splicer');
var xtend = require('xtend');
var Readable = require('stream').Readable;
var concat = require('concat-stream');
var through = require('through2');
var defined = require('defined');
var inherits = require('util').inherits;
var isRelative = require('is-relative');
var Readable = require('readable-stream/readable');
var debug = require('debug')('bant:normalize');

module.exports = normalize;
inherits(normalize, Readable);

function normalize (files, opts) {
  if (!(this instanceof normalize)) return new normalize(files);
  Readable.call(this, { objectMode: true });

  if (!opts) opts = {};
  
  if (!files) throw 'missing files';

  var self = this;

  self.pipeline = this._createPipeline();
  self._files = files;
  self._ids = [];
  self._buf = [];
  self._pending = files.length + 1;
  self._baseurl = opts._baseurl;

  self.pipeline.on('readable', function () {
    var row;
    while (null !== (row = self.pipeline.read()))
      self._buf.push(row);
  }).on('end', function () {
    self.emit('_drainbuf');
    self.push(null);
  });
}

normalize.prototype._read = function (n) {
  var row, self = this;

  if (self._pending > self._files.length) {
    self._pending -= 1;
    [].concat(self._files).filter(Boolean).forEach(function (file, i) {
      fs.createReadStream(file).pipe(concat(function (s) {
        var obj;
        try {
          obj = JSON.parse(s);
        } catch (e) {
          throw 'malformed json ' + file;
        }
        obj._dir = path.dirname(file);
        obj.id = defined(obj.id, 'module_' + i);
        self._ids.push(obj.id);
        self.pipeline.write(obj);
        debug('added ' + file);
        if (!(--self._pending)) self.pipeline.end();
      }));
    });
  }

  while ((row = self._buf.shift()) != null) {
    self.push(row);
  }

  if (!self._waiting) {
    self._waiting = true;
    self.once('_drainbuf', function () {
      self._read(n);
    });
  }
};

normalize.prototype._defaults = function () {
  return through.obj(function (row, enc, cb) {
    if ('string' === typeof row.main) {
      row.main = path.join(row._dir, row.main);
      row.locals = defined(row.locals, []);
      row.dependencies = defined(row.dependencies, []);
      row.browserify = defined(row.browserify, {});
      row._externals = defined(row._externals, []);
      row._internals = defined(row._internals, []);
      row._foreignLocals = defined(row._foreignLocals, []);
      row.browserify = xtend(row.browserify, {
        entry: defined(row.browserify.entry, true),
        expose: defined(row.browserify.expose, row.id)
      });
      this.push(row);
    }
    cb();
  });
};

normalize.prototype._dependencies = function () {
  var self = this;
  return through.obj(function (row, enc, cb) {
    row.dependencies.filter(Boolean).forEach(function (name) {
      if (!~self._ids.indexOf(name)) {
        if (isRelative(name)) {
          row._foreignLocals.push(path.resolve(row._dir, name));
        } else {
          row._externals.push(name);
        }
      } else {
        name = defined(self._baseurl, '/') + name;
        row._internals.push(name);
      }
    });
    this.push(row);
    cb();
  });
};

normalize.prototype._createPipeline = function () {
  var pipeline = splicer.obj([
    'defaults', [ this._defaults() ],
    'dependencies', [ this._dependencies() ]
  ]);
  return pipeline;
};

function has (obj, key) { return obj.hasOwnProperty(key); }

