var normalize = require('..');
var test = require('tape');

test('externals', function (t) {
  var arr = [
    { name: 'x', main: './x.js', locals: ['y', 'j'] },
    { name: 'y', main: './y.js', locals: ['j', 'a'] },
    { name: 'k', main: './k.js', locals: ['a'] },
    { name: 'a', main: './a.js' },
    { name: 'j', main: './j.js' }
  ];

  var index = {}, externalsLen = 0;
  normalize(arr).forEach(function (node) {
    if (node._external) externalsLen++;
    index[node.name] = node;
  });

  t.equal(Object.keys(index).length, arr.length);
  t.equal(index['x']._external, true);
  t.equal(index['a']._external, true);
  t.equal(index['k']._external, true);
  t.equal(externalsLen, 3);
});