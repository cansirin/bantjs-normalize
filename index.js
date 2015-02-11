var through = require('through2');
var path = require('path');
var defined = require('defined');
var debug = require('debug')('bant:normalize');
var compact = require('bant-compact');
var extend = require('util')._extend;
var inherits = require('util').inherits;
var Transform = require('readable-stream/transform');


module.exports = normalize;
inherits(normalize, Transform);

function normalize (opts) {
  if (!(this instanceof normalize)) return new normalize(opts);
  
  if (!opts) opts = {};

  this._opts = opts;
  this._raw = [];

  Transform.call(this, { objectMode: true });
}

normalize.prototype._transform = function (row, enc, cb) {
  var basedir, opts = this._opts;

  if (isVinyl(row)) {
    if (row.isStream()) throw 'not implemented';
    else if (row.isBuffer()) {
      basedir = path.dirname(row.path);
      var vinyl = row.clone();
      row = JSON.parse(row.contents);
      row.vinyl = vinyl;
      row.basedir = basedir;
    }
  }

  row.name = defined(row.name, row.expose);

  if ('string' === typeof row.name) {
    row.expose = defined(row.expose, row.name);
    row.basedir = path.resolve(defined(row.basedir, opts.basedir, process.cwd()));
    this._raw.push(row);
  }

  cb();
};

normalize.prototype._flush = function (cb) {
  var self = this,
      tree = compact(this._raw);
  
  tree.forEach(function (branch) {
    self.push(branch);
  });

  self.push(null);
};

function isVinyl (row) { return row && typeof row.isBuffer === 'function'; }

