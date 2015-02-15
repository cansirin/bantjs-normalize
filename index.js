var xtend = require('xtend');
var defined = require('defined');
var debug = require('debug')('bant:normalize');
var cluster = require('bant-cluster');
var path = require('path');

module.exports = function (arr, opts) {
  if (!opts) opts = {};

  var nodes = [];

  arr.forEach(function (row) {
    if (!row.main) {
      debug('skipping ' + row.file + ' (missing main field)');
      return;
    }

    if (!row.name) {
      debug('skipping ' + row.file + ' (missing name field)');
      return;
    }

    var basedir = defined(row.basedir, opts.basedir, path.dirname(row.main));

    var node = xtend(row, {
      main: path.resolve(basedir, row.main),
      basedir: basedir,
      expose: defined(row.expose, row.name)
    });

    nodes.push(node);
  });

  var clusters = cluster(nodes);

  nodes = nodes.map(function (node) {
    var external = find(clusters, node.name);
    if (external)
      node = xtend(node, external, { _external: true });
    return node;
  });

  return nodes;
};

function find (arr, name) {
  var ix = findIndex();
  if (ix !== -1) return arr[ix];

  function findIndex () {
    var ix = -1,
        len = arr ? arr.length : 0;

    while (++ix < len) {
      if (arr[ix].name === name)
        return ix;
    }
    return -1;
  }
}
