var normalize = require('..');
var through = require('through2');
var path = require('path');
var test = require('tape');

test('files', function (t) {
  var rows = {};
  var tr = through.obj();
  tr.pipe(normalize({ basedir: __dirname  })).pipe(through.obj(function (row, enc, cb) {
    rows[row.name] = row;
    cb();
  }, function () {
    t.equal(rows.x.scripts[0].file, __dirname + '/x.js');
    t.equal(rows.x.scripts[0].expose, rows.x.name);
    t.equal(rows.y.basedir, path.resolve(__dirname + '/../'));
    t.equal(rows.y.scripts.length, 2);
    t.equal(rows.y.scripts[1].file, path.resolve(__dirname + '/../z.js'));
    t.equal(rows.module_2.scripts[0].expose, 'z');
    t.end();
  }));

  tr.write({ name: 'x', main: 'x.js' });
  tr.write({ name: 'y', basedir: __dirname + '/../', scripts: ['y.js', 'z.js'] });
  tr.write({ main: 'z.js', expose: 'z' });
  tr.end();
});
