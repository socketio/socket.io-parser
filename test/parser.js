const { PacketType, Decoder, Encoder, isPacketValid } = require("..");
const expect = require("expect.js");
const helpers = require("./helpers.js");

describe("socket.io-parser", () => {
  it("exposes types", () => {
    expect(PacketType.CONNECT).to.be.a("number");
    expect(PacketType.DISCONNECT).to.be.a("number");
    expect(PacketType.EVENT).to.be.a("number");
    expect(PacketType.ACK).to.be.a("number");
    expect(PacketType.CONNECT_ERROR).to.be.a("number");
    expect(PacketType.BINARY_EVENT).to.be.a("number");
    expect(PacketType.BINARY_ACK).to.be.a("number");
  });

  it("encodes connection", () => {
    return helpers.test({
      type: PacketType.CONNECT,
      nsp: "/woot",
      data: {
        token: "123",
      },
    });
  });

  it("encodes disconnection", () => {
    return helpers.test({
      type: PacketType.DISCONNECT,
      nsp: "/woot",
    });
  });

  it("encodes an event", () => {
    return helpers.test({
      type: PacketType.EVENT,
      data: ["a", 1, {}],
      nsp: "/",
    });
  });

  it("encodes an event (with an integer as event name)", () => {
    return helpers.test({
      type: PacketType.EVENT,
      data: [1, "a", {}],
      nsp: "/",
    });
  });

  it("encodes an event (with ack)", () => {
    return helpers.test({
      type: PacketType.EVENT,
      data: ["a", 1, {}],
      id: 1,
      nsp: "/test",
    });
  });

  it("encodes an ack", () => {
    return helpers.test({
      type: PacketType.ACK,
      data: ["a", 1, {}],
      id: 123,
      nsp: "/",
    });
  });

  it("encodes an connect error", () => {
    return helpers.test({
      type: PacketType.CONNECT_ERROR,
      data: "Unauthorized",
      nsp: "/",
    });
  });

  it("encodes an connect error (with object)", () => {
    return helpers.test({
      type: PacketType.CONNECT_ERROR,
      data: {
        message: "Unauthorized",
      },
      nsp: "/",
    });
  });

  it("throws an error when encoding circular objects", () => {
    const a = {};
    a.b = a;

    const data = {
      type: PacketType.EVENT,
      data: a,
      id: 1,
      nsp: "/",
    };

    const encoder = new Encoder();

    expect(() => encoder.encode(data)).to.throwException();
  });

  it("decodes a bad binary packet", () => {
    try {
      const decoder = new Decoder();
      decoder.add("5");
    } catch (e) {
      expect(e.message).to.match(/Illegal/);
    }
  });

  it("throw an error upon parsing error", () => {
    expect(() => new Decoder().add("999")).to.throwException(
      /^unknown packet type 9$/
    );

    expect(() => new Decoder().add(999)).to.throwException(
      /^Unknown type: 999$/
    );
  });

  it("should resume decoding after calling destroy()", () => {
    return new Promise((resolve) => {
      const decoder = new Decoder();

      decoder.on("decoded", (packet) => {
        expect(packet.data).to.eql(["hello"]);
        resolve();
      });

      decoder.add('51-["hello"]');
      decoder.destroy();
      decoder.add('2["hello"]');
    });
  });

  it("should ensure that a packet is valid", async () => {
    function decode(str) {
      return new Promise((resolve) => {
        const decoder = new Decoder();

        decoder.on("decoded", (data) => {
          resolve(data);
        });

        decoder.add(str);
      });
    }

    expect(isPacketValid(await decode("0"))).to.eql(true);
    expect(isPacketValid(await decode('442["some","data"'))).to.eql(false);
    expect(isPacketValid(await decode('0/admin,"invalid"'))).to.eql(false);
    expect(isPacketValid(await decode("0[]"))).to.eql(false);
    expect(isPacketValid(await decode("1/admin,{}"))).to.eql(false);
    expect(isPacketValid(await decode('2/admin,"invalid'))).to.eql(false);
    expect(isPacketValid(await decode("2/admin,{}"))).to.eql(false);
    expect(isPacketValid(await decode('2[{"toString":"foo"}]'))).to.eql(false);
    expect(isPacketValid(await decode('2[true,"foo"]'))).to.eql(false);
    expect(isPacketValid(await decode('2[null,"bar"]'))).to.eql(false);
    expect(isPacketValid(await decode('2["connect"]'))).to.eql(false);
    expect(isPacketValid(await decode('2["disconnect","123"]'))).to.eql(false);
  });
});
