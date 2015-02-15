var normalize = require('..');
var test = require('tape');

test('defaults', function (t) {
  var arr = [
    { name: 'x', main: './x.js', basedir: __dirname + '/bar' },
    { name: 'y', main: './y.js', expose: 'z' }
  ];

  var rows = normalize(arr, { basedir: __dirname + '/foo' });

  t.equal(rows.length, 2);
  t.equal(rows[0].main, __dirname + '/bar/x.js');
  t.equal(rows[1].main, __dirname + '/foo/y.js');
  t.equal(rows[1].expose, 'z');
  t.end();
});