import {Decoder, PacketType} from "../build/esm/index.js";
import * as helpers from "./helpers.js";
import expect from "expect.js";

describe("Buffer", () => {
  it("encodes a Buffer", () => {
    return helpers.test_bin({
      type: PacketType.EVENT,
      data: ["a", Buffer.from("abc", "utf8")],
      id: 23,
      nsp: "/cool",
    });
  });

  it("encodes a nested Buffer", () => {
    return helpers.test_bin({
      type: PacketType.EVENT,
      data: ["a", { b: ["c", Buffer.from("abc", "utf8")] }],
      id: 23,
      nsp: "/cool",
    });
  });

  it("encodes a binary ack with Buffer", () => {
    return helpers.test_bin({
      type: PacketType.ACK,
      data: ["a", Buffer.from("xxx", "utf8"), {}],
      id: 127,
      nsp: "/back",
    });
  });

  it("throws an error when adding an attachment with an invalid 'num' attribute (string)", () => {
    const decoder = new Decoder();

    expect(() => {
      decoder.add('51-[[1,2],"hello",{"_placeholder":3,"num":4},true,"splice"]');
      decoder.add(Buffer.from("world"));
    }).to.throwException(/^illegal attachments$/);
  });

  it("throws an error when adding an attachment with an invalid 'num' attribute (out-of-bound)", () => {
    const decoder = new Decoder();

    expect(() => {
      decoder.add('51-[[1,2],"hello",{"_placeholder":3,"num":4},true,1]');
      decoder.add(Buffer.from("world"));
    }).to.throwException(/^illegal attachments$/);
  });

  it("throws an error when adding an attachment without header", () => {
    const decoder = new Decoder();

    expect(() => {
      decoder.add(Buffer.from("world"));
    }).to.throwException(/^got binary data when not reconstructing a packet$/);
  });

  it("throws an error when decoding a binary event without attachments", () => {
    const decoder = new Decoder();

    expect(() => {
      decoder.add('51-[[1,2],"hello",{"_placeholder":3,"num":4},true,0]');
      decoder.add('2[[1],"hello"]');
    }).to.throwException(/^got plaintext data when reconstructing a packet$/);
  });
});
