var normalize = require('..');
var through = require('through2');
var path = require('path');
var fs = require('vinyl-fs');
var File = require('vinyl');
var test = require('tape');

test('vinyl', function (t) {
  t.plan(2);
  fs.src([__dirname + '/vinyl/*.json'])
    .pipe(normalize())
    .pipe(through.obj(function (row, enc, cb) {
      t.equal(row.basedir, __dirname + '/vinyl');
      t.ok(row.vinyl instanceof File);
      cb();
    }));
});

