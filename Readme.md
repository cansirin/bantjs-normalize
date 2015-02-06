# bant-normalize

given an array of config files, turns them into bant-consumable objects.

# usage

Assuming we have three modules, `about`, `team` and `contact`, and have a project tree like this:

```
├── about
│   ├── config.json
│   └── index.js
├── contact
│   ├── config.json
│   ├── index.js
│   └── somelib.js
└── team
    ├── config.json
        └── index.js
```

Now we want builder to concatenate `contact` module and all of its local/foreign local (`somelib.js`) dependencies into `about`, and leave out `team` but make sure it knows that `about` depends on it.

Here `somelib.js` that `contact` depends on is some lib that it can't require through browserify for some reason. Otherwise you don't have to explicitly define a file here that you have already required.

## about/config.json

```json
{
  "id": "about",
  "main": "index.js",
  "locals": [
    "contact"
  ],
  "dependencies": [
    "team"
  ]
}
```

### contact/config.json

```json
{
  "id": "contact",
  "main": "index.js",
  "dependencies": [
    "somelib.js"
  ]
}
```

### team/config.json

```json
{
  "id": "team",
  "main": "index.js",
  "browserify": {
    "entry": "true",
    "expose": "team"
  },
  "dependencies": [
    "//ajax.googleapis.com/ajax/libs/threejs/r69/three.min.js"
  ]
}
```

If you want to pass additional browserify options or override defaults you can add them into `browserify` field. 

# api

# normalize(files=[])

Returns a `Readable` stream in object mode.

# license

mit