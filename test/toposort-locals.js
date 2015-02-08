var normalize = require('..');
var through = require('through2');
var path = require('path');
var test = require('tape');

test('toposort-locals', function (t) {
  var rows = [];
  var tr = through.obj();
  tr.pipe(normalize({ basedir: __dirname  })).pipe(through.obj(function (row, enc, cb) {
    rows.push(row);
    cb();
  }, function () {
    t.equal(rows[0].name, 'w');
    t.equal(rows[1].name, 'z');
    t.equal(rows[2].name, 'y');
    t.equal(rows[3].name, 'x');
    t.end();
  }));

  tr.write({ name: 'x', locals: ['w', 'y'] });
  tr.write({ name: 'y', locals: ['z'] });
  tr.write({ name: 'z', locals: [] });
  tr.write({ name: 'w' });
  tr.end();
});
