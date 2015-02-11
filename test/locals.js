var normalize = require('..');
var through = require('through2');
var path = require('path');
var test = require('tape');

test('compact', function (t) {
  t.plan(2);
  var tr = through.obj();
  var rows = [];
  tr.pipe(normalize()).pipe(through.obj(function (row, enc, cb) {
    rows.push(row);
    cb();
  }, function () {
    t.equal(rows.length, 3);
    t.equal(rows[2].name, 'j');
    t.end();
  }));

  tr.write({name: 'x', locals: ['y', 'j']});
  tr.write({name: 'y'});
  tr.write({name: 'z', locals: ['w', 'k', 'j']});
  tr.write({name: 'w'});
  tr.write({name: 'k'});
  tr.write({name: 'j'});
  tr.end();
});