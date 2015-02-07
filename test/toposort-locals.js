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
    t.equal(rows[0].id, 'w');
    t.equal(rows[1].id, 'z');
    t.equal(rows[2].id, 'y');
    t.equal(rows[3].id, 'x');
    t.end();
  }));

  tr.write({ id: 'x', locals: ['w', 'y'] });
  tr.write({ id: 'y', locals: ['z'] });
  tr.write({ id: 'z', locals: [] });
  tr.write({ id: 'w' });
  tr.end();
});
