const withNativeArrayBuffer: boolean = typeof ArrayBuffer === "function";

const isView = (obj: any) => {
  return typeof ArrayBuffer.isView === "function"
    ? ArrayBuffer.isView(obj)
    : obj.buffer instanceof ArrayBuffer;
};

const toString = Object.prototype.toString;
const withNativeBlob =
  typeof Blob === "function" ||
  (typeof Blob !== "undefined" &&
    toString.call(Blob) === "[object BlobConstructor]");
const withNativeFile =
  typeof File === "function" ||
  (typeof File !== "undefined" &&
    toString.call(File) === "[object FileConstructor]");
const withNativeBuffer =
  typeof Buffer === "function" && typeof Buffer.isBuffer === "function";

/**
 * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
 *
 * @private
 */

export function isBinary(obj: any) {
  return (
    (withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
    (withNativeBlob && obj instanceof Blob) ||
    (withNativeFile && obj instanceof File) ||
    (withNativeBuffer && Buffer.isBuffer(obj))
  );
}

export function hasBinary(obj: any, known: object[] = [], toJSON?: boolean) {
  if (!obj || typeof obj !== "object" || known.includes(obj)) {
    return false;
  }

  known.push(obj);

  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i], known)) {
        return true;
      }
    }
    return false;
  }

  if (isBinary(obj)) {
    return true;
  }

  if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length < 3) {
    return hasBinary(obj.toJSON(), known, true);
  }

  for (const key in obj) {
    if (
      (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key]),
      known)
    ) {
      return true;
    }
  }

  return false;
}
