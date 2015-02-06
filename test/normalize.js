var test = require('tap').test;
var normalize = require('..');
var through = require('through2');
var path = require('path');

test(function (t) {
  t.plan(11);
  normalize([
    __dirname + '/fixtures/x.json',
    __dirname + '/fixtures/y.json',
    __dirname + '/fixtures/z.json'
  ])
  .pipe(through.obj(function (row, enc, cb) {
    if (row.id === 'x') {
      t.equal(path.dirname(row.main), __dirname + '/fixtures');
      t.ok(!!~row._foreignLocals.indexOf(__dirname + '/baz'));
      t.ok(!!~row._foreignLocals.indexOf(__dirname + '/fixtures/foo'));
      t.ok(!!~row._externals.indexOf('//bar'));
      t.ok(row.browserify.entry);
      t.equal(row.browserify.expose, 'x');
    } else if (row.id === 'y') {
      t.notok(row.browserify.entry);
      t.equal(row.browserify.expose, 'bar');
      t.ok(!!~row._internals.indexOf('/x'));
      t.ok(!!~row._foreignLocals.indexOf(__dirname + '/fixtures/baz'));
    } else if (row.id == 'module_2') t.ok(true);
    cb();
  }));
});
