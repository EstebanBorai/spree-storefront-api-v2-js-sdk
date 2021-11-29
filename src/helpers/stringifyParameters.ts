// Based on https://github.com/ljharb/qs/blob/master/lib/stringify.js

const toISO = Date.prototype.toISOString

const serializeDate = (date) => {
  return toISO.call(date)
}

const isBuffer = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj))
}

const isNonNullishPrimitive = (v) => {
  return (
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'boolean' ||
    typeof v === 'symbol' ||
    typeof v === 'bigint'
  )
}

const hexTable = (() => {
  const array = []

  for (let i = 0; i < 256; ++i) {
    array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase())
  }

  return array
})()

const replace = String.prototype.replace

const percentTwenties = /%20/g

const rfc1738Formatter = (value) => {
  return replace.call(value, percentTwenties, '+')
}

const encode = (str, charset, format) => {
  // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) {
    return str
  }

  let string = str
  if (typeof str === 'symbol') {
    string = Symbol.prototype.toString.call(str)
  } else if (typeof str !== 'string') {
    string = String(str)
  }

  if (charset === 'iso-8859-1') {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
      return '%26%23' + parseInt($0.slice(2), 16) + '%3B'
    })
  }

  let out = ''
  for (let i = 0; i < string.length; ++i) {
    let c = string.charCodeAt(i)

    if (
      c === 0x2d || // -
      c === 0x2e || // .
      c === 0x5f || // _
      c === 0x7e || // ~
      (c >= 0x30 && c <= 0x39) || // 0-9
      (c >= 0x41 && c <= 0x5a) || // a-z
      (c >= 0x61 && c <= 0x7a) || // A-Z
      (format === rfc1738Formatter && (c === 0x28 || c === 0x29)) // ( )
    ) {
      out += string.charAt(i)
      continue
    }

    if (c < 0x80) {
      out = out + hexTable[c]
      continue
    }

    if (c < 0x800) {
      out = out + (hexTable[0xc0 | (c >> 6)] + hexTable[0x80 | (c & 0x3f)])
      continue
    }

    if (c < 0xd800 || c >= 0xe000) {
      out = out + (hexTable[0xe0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3f)] + hexTable[0x80 | (c & 0x3f)])
      continue
    }

    i += 1
    c = 0x10000 + (((c & 0x3ff) << 10) | (string.charCodeAt(i) & 0x3ff))
    out +=
      hexTable[0xf0 | (c >> 18)] +
      hexTable[0x80 | ((c >> 12) & 0x3f)] +
      hexTable[0x80 | ((c >> 6) & 0x3f)] +
      hexTable[0x80 | (c & 0x3f)]
  }

  return out
}

const isArray = Array.isArray

const push = Array.prototype.push

const pushToArray = function (arr, valueOrArray) {
  push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray])
}

const rfc3986Formatter = (value): string => {
  return String(value)
}

const generateBracketsArrayPrefix = (prefix: string, _key: string): string => {
  return prefix + '[]'
}

const stringify = (
  object, // required
  prefix, // required
  generateArrayPrefix = generateBracketsArrayPrefix,
  strictNullHandling = false,
  skipNulls = false,
  encoder = encode,
  filter = undefined,
  sort = null,
  allowDots = false,
  serializeDate,
  format = 'RFC3986',
  formatter = rfc3986Formatter,
  encodeValuesOnly = false,
  charset = 'utf-8'
) => {
  let obj = object

  if (obj instanceof Date) {
    obj = serializeDate(obj)
  }

  if (obj === null) {
    obj = ''
  }

  if (isNonNullishPrimitive(obj) || isBuffer(obj)) {
    if (encoder) {
      const keyValue = encodeValuesOnly ? prefix : encoder(prefix, charset, format)

      return [formatter(keyValue) + '=' + formatter(encoder(obj, charset, format))]
    }

    return [formatter(prefix) + '=' + formatter(String(obj))]
  }

  const values = []

  if (typeof obj === 'undefined') {
    return values
  }

  const objKeys = Object.keys(obj)

  for (let i = 0; i < objKeys.length; ++i) {
    const key = objKeys[i]
    const value = obj[key]

    const keyPrefix = isArray(obj) ? generateArrayPrefix(prefix, key) : prefix + ('[' + key + ']')

    pushToArray(
      values,
      stringify(
        value,
        keyPrefix,
        generateArrayPrefix,
        strictNullHandling,
        skipNulls,
        encoder,
        filter,
        sort,
        allowDots,
        serializeDate,
        format,
        formatter,
        encodeValuesOnly,
        charset
      )
    )
  }

  return values
}

/**
 * Serializes object into a query string understood by Spree.
 * Spree uses the "brackets" format for serializing arrays which
 * is a different format than used by URLSearchParams.
 */
const stringifyParameters = (object: Record<string, any>): string => {
  const obj = object

  const keys = []

  const objKeys = Object.keys(obj)

  for (let i = 0; i < objKeys.length; ++i) {
    const key = objKeys[i]

    pushToArray(
      keys,
      stringify(
        obj[key],
        key,
        generateBracketsArrayPrefix,
        false,
        false,
        encode,
        undefined,
        null,
        false,
        serializeDate,
        'RFC3986',
        rfc3986Formatter,
        false,
        'utf-8'
      )
    )
  }

  const joined = keys.join('&')

  return joined
}

export default stringifyParameters
