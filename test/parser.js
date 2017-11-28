var parser = require('../index.js');
var expect = require('expect.js');
var helpers = require('./helpers.js');

describe('parser', function(){

  it('exposes types', function(){
    expect(parser.CONNECT).to.be.a('number');
    expect(parser.DISCONNECT).to.be.a('number');
    expect(parser.EVENT).to.be.a('number');
    expect(parser.ACK).to.be.a('number');
    expect(parser.ERROR).to.be.a('number');
  });

  it('encodes connection', function(){
    helpers.test({
      type: parser.CONNECT,
      nsp: '/woot'
    });
  });

  it('encodes disconnection', function(){
    helpers.test({
      type: parser.DISCONNECT,
      nsp: '/woot'
    });
  });

  it('encodes an event', function(){
    helpers.test({
      type: parser.EVENT,
      data: ['a', 1, {}],
      nsp: '/'
    });
    helpers.test({
      type: parser.EVENT,
      data: ['a', 1, {}],
      id: 1,
      nsp: '/test'
    });
  });

  it('encodes an ack', function(){
    helpers.test({
      type: parser.ACK,
      data: ['a', 1, {}],
      id: 123,
      nsp: '/'
    });
  });

  it('encodes a circular object (return error)', function() {
    var john = new Object();  
    var mary = new Object();  
    
    john.sister = mary;  
    mary.brother = john;  

    var data = {
      type: parser.EVENT,
      data: john,
      id: 1,
      nsp: '/'
    }

    var error = JSON.stringify({ type: parser.ERROR, data: 'encode error' });
    var encoder = new parser.Encoder();

    encoder.encode(data, function(encodedPackets) {
      expect(encodedPackets[0]).to.be(error);
    });
  });

  it('decodes a bad binary packet', function(){
    try {
      var decoder = new parser.Decoder();
      decoder.add('5');
    } catch(e){
      expect(e.message).to.match(/Illegal/);
    }
  });
});
