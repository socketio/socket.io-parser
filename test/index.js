import * as env from "./support/env.js";

const blobSupported = (function () {
  try {
    new Blob(["hi"]);
    return true;
  } catch (e) {}
  return false;
})();

/**
 * Create a blob builder even when vendor prefixes exist
 */
const BlobBuilderImpl =
  typeof BlobBuilder !== "undefined"
    ? BlobBuilder
    : typeof WebKitBlobBuilder !== "undefined"
    ? WebKitBlobBuilder
    : typeof MSBlobBuilder !== "undefined"
    ? MSBlobBuilder
    : typeof MozBlobBuilder !== "undefined"
    ? MozBlobBuilder
    : false;
const blobBuilderSupported =
  !!BlobBuilderImpl &&
  !!BlobBuilderImpl.prototype.append &&
  !!BlobBuilderImpl.prototype.getBlob;

await import("./parser.js");

if (!env.browser) {
  await import("./buffer.js");
}

if (typeof ArrayBuffer !== "undefined") {
  await import("./arraybuffer.js");
}

if (blobSupported || blobBuilderSupported) {
  await import("./blob.js");
}
