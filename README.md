# aria2.js

JavaScript (Node.js and browsers) library for [aria2, "The next generation download utility."](https://aria2.github.io/)

## Introduction

aria2.js controls aria2 via its [JSON-RPC interface](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface) and features.

- Node.js and browsers support
- multiple transports
    - [HTTP](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface)
    - [WebSocket](https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-over-websocket)
- promise API

See [aria2 methods](https://aria2.github.io/manual/en/html/aria2c.html#methods)
and [aria2 notifications](https://aria2.github.io/manual/en/html/aria2c.html#notifications).

## Getting started

Start aria2 with rpc, example:

`aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`

```sh
npm install aria2
```

### Browser

```javascript
import Aria2 from '@baptistecdr/aria2/dist/esm-browser/bundle.js';

const serverOptions = {
  "host": "localhost",
  "port": 6800,
  "secure": true,
  "secret": "",
  "path": "/jsonrpc",
};

const aria2 = new Aria2(serverOptions);
```

See [main.html](examples/browser/index.html) for a complete example.

### Node.js

```javascript
import Aria2 from "@baptistecdr/aria2";

const serverOptions = {
  host: "localhost",
  port: 6800,
  secure: false,
  secret: "",
  path: "/jsonrpc",
};

const aria2 = new Aria2(serverOptions);
```

See [main.js](examples/node/main.js) for a complete example.

```shell
node examples/node/main.js
```

⚠️ The WebSocket module is in experimental state in Node.js 20.x and 21.x, you need to use the `--experimental-websocket` flag to enable it. See [Node.js WebSocket documentation](https://nodejs.org/dist/latest/docs/api/globals.html#websocket) for more information.

## Usage

Default options match aria2c defaults and are

```json
{
  "host": "localhost",
  "port": 6800,
  "secure": false,
  "secret": "",
  "path": "/jsonrpc"
}
```

`secret` is optional and refers  to [--rpc-secret](https://aria2.github.io/manual/en/html/aria2c.html#cmdoption--rpc-secret). If you define it, it will be added to every call for you.

If the WebSocket is open (via the [open method](#open)) aria2.js will use the WebSocket transport, otherwise the HTTP transport.

The `"aria2."` prefix can be omitted from both methods and notifications.

### open

`aria2.open()` opens the WebSocket connection. All subsequent requests will use the WebSocket transport instead of HTTP.

```javascript
aria2
    .open()
    .then(() => console.log("open"))
    .catch((err) => console.error(err));
```

```javascript
try {
    await aria2.open();
    console.log("open")
} catch (err) {
    console.error(err);
}
```

### close

`aria2.close()` closes the WebSocket connection. All subsequent requests will use the HTTP transport instead of WebSocket.

```javascript
aria2
    .close()
    .then(() => console.log("closed"))
    .catch((err) => console.error(err));
```

```javascript
try {
    await aria2.close();
    console.log("closed")
} catch (err) {
    console.error(err);
}
```

### call

`aria2.call()` calls a method. Parameters are provided as arguments.

Example using [`addUri`](https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri) method to download from a magnet link.

```javascript
const magnet =
    "magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E&dn=bbb_sunflower_1080p_30fps_normal.mp4&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&ws=http%3a%2f%2fdistribution.bbb3d.renderfarming.net%2fvideo%2fmp4%2fbbb_sunflower_1080p_30fps_normal.mp4";
const [guid] = await aria2.call("addUri", [magnet], {dir: "/tmp"});
```

### multicall

`aria2.multicall()` is a helper for [system.multicall](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall). It returns an array of results or throw if any of the call failed.

```javascript
const multicall = [
    [methodA, param1, param2],
    [methodB, param1, param2],
];

const results = await aria2.multicall(multicall);
```

### batch

`aria2.batch()` is a helper for [batch](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall). It behaves the same as [multicall](#multicall) except it returns an array of promises which gives more flexibility in handling errors.

```javascript
const batch = [
    [methodA, param1, param2],
    [methodB, param1, param2],
];

const promises = await aria2.batch(batch);
```

### listNotifications

`aria2.listNotifications()` is a helper for [system.listNotifications](https://aria2.github.io/manual/en/html/aria2c.html#system.listNotifications). The difference with `aria2.call('listNotifications')` is that it removes the `"aria2."` prefix from the results.

```javascript
const notifications = await aria2.listNotifications();
/*
[
  'onDownloadStart',
  'onDownloadPause',
  'onDownloadStop',
  'onDownloadComplete',
  'onDownloadError',
  'onBtDownloadComplete'
]
*/

// notifications logger example
notifications.forEach((notification) => {
    aria2.on(notification, (params) => {
        console.log("aria2", notification, params);
    });
});
```

### listMethods

`aria2.listMethods()` is a helper for [system.listMethods](https://aria2.github.io/manual/en/html/aria2c.html#system.listMethods). The difference with `aria2.call('listMethods')` is that it removes the `"aria2."` prefix for the results.

```javascript
const methods = await aria2.listMethods();
/*
[ 'addUri',
  [...]
  'system.listNotifications' ]

*/
```

### events

```javascript
// emitted when the WebSocket is open.
aria2.on("open", () => {
    console.log("aria2 OPEN");
});

// emitted when the WebSocket is closed.
aria2.on("close", () => {
    console.log("aria2 CLOSE");
});

// emitted for every message sent.
aria2.on("output", (m) => {
    console.log("aria2 OUT", m);
});

// emitted for every message received.
aria2.on("input", (m) => {
    console.log("aria2 IN", m);
});
```

Additionally, every [aria2 notifications](https://aria2.github.io/manual/en/html/aria2c.html#notifications) received will be emitted as an event (with and without the `"aria2."` prefix). Only available when using WebSocket, see [open](#open).

```javascript
aria2.on("onDownloadStart", ([guid]) => {
    console.log("aria2 onDownloadStart", guid);
});
```

## How to build

- Install [Node.JS LTS](https://nodejs.org/)
- Clone the project
- Run `npm install`
- Run `npm run test`
- Run `npm run build`

## Bugs and feature requests

Have a bug or a feature request? Please first search for existing and closed issues. If your problem or idea is not
addressed yet, [please open a new issue](https://github.com/baptistecdr/aria2.js/issues/new).

## Contributing

Contributions are welcome!
