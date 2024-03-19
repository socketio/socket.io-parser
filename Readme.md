
# socket.io-parser

[![Build Status](https://github.com/socketio/socket.io-devalue-parser/workflows/CI/badge.svg)](https://github.com/socketio/socket.io-devalue-parser/actions)

A fork of the default socket.io encoder and decoder, which uses
[devalue](https://github.com/Rich-Harris/devalue) over the vanilla
[JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) object,
for stringifying and parsing JavaScript objects.
This offers many improvements over the default parser, such as support for
dates, maps, sets, regular expressions, `undefined`, custom classes and more.
Check out [devalue](https://github.com/Rich-Harris/devalue) for details.


## Parser API

  socket.io-parser is the reference implementation of socket.io-protocol. Read
  the full API here:
  [socket.io-protocol](https://github.com/learnboost/socket.io-protocol).

## Example Usage

### Encoding and decoding a packet

```js
var parser = require('socket.io-devalue-parser');
var encoder = new parser.Encoder();
var packet = {
  type: parser.EVENT,
  data: 'test-packet',
  id: 13
};
encoder.encode(packet, function(encodedPackets) {
  var decoder = new parser.Decoder();
  decoder.on('decoded', function(decodedPacket) {
    // decodedPacket.type == parser.EVENT
    // decodedPacket.data == 'test-packet'
    // decodedPacket.id == 13
  });

  for (var i = 0; i < encodedPackets.length; i++) {
    decoder.add(encodedPackets[i]);
  }
});
```

### Encoding and decoding a packet with binary data

```js
var parser = require('socket.io-devalue-parser');
var encoder = new parser.Encoder();
var packet = {
  type: parser.BINARY_EVENT,
  data: {i: new Buffer(1234), j: new Blob([new ArrayBuffer(2)])},
  id: 15
};
encoder.encode(packet, function(encodedPackets) {
  var decoder = new parser.Decoder();
  decoder.on('decoded', function(decodedPacket) {
    // decodedPacket.type == parser.BINARY_EVENT
    // Buffer.isBuffer(decodedPacket.data.i) == true
    // Buffer.isBuffer(decodedPacket.data.j) == true
    // decodedPacket.id == 15
  });

  for (var i = 0; i < encodedPackets.length; i++) {
    decoder.add(encodedPackets[i]);
  }
});
```
See the test suite for more examples of how socket.io-devalue-parser is used.


## License

MIT
