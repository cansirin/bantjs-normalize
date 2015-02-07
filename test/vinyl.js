var normalize = require('..');
var through = require('through2');
var path = require('path');
var fs = require('vinyl-fs');
var test = require('tape');

test('vinyl', function (t) {
  var rows = {};
  fs.src([__dirname + '/vinyl/*.json'])
    .pipe(normalize())
    .pipe(through.obj(function (row, enc, cb) {
      rows[row.id] = row;
      cb();
    }, function () {
      t.equal(rows.x.basedir, __dirname + '/vinyl');
      t.equal(rows.y.basedir, __dirname + '/vinyl');
      t.end();
    }));
});

