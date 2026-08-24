// One-time: pull the Comedy Castle logo out of a reference ticket PDF as a PNG.
const fs = require('fs'), zlib = require('zlib');
const buf = fs.readFileSync('reference/ticket-example-1.pdf');
const s = buf.toString('latin1');

function obj(num) {
  const m = new RegExp('(?:^|[^0-9])' + num + ' 0 obj').exec(s);
  const bodyStart = m.index + m[0].length;
  const head = s.slice(bodyStart, bodyStart + 1200);
  const sm = /stream\r?\n/.exec(head);
  const st = bodyStart + sm.index + sm[0].length;
  const data = buf.subarray(st, s.indexOf('endstream', st));
  const isFlate = head.slice(0, sm.index).indexOf('/FlateDecode') !== -1;
  return isFlate ? zlib.inflateSync(data) : data;
}

const W = 708, H = 156;
const palette = obj(13);   // 255 RGB entries, uncompressed
const idx = obj(26);       // one palette index per pixel
console.log('palette bytes', palette.length, '| pixel bytes', idx.length);

const raw = Buffer.alloc(H * (1 + W * 3));
let p = 0;
for (let y = 0; y < H; y++) {
  raw[p++] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    const c = idx[y * W + x] * 3;
    raw[p++] = palette[c];
    raw[p++] = palette[c + 1];
    raw[p++] = palette[c + 2];
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // 8-bit truecolour RGB

fs.writeFileSync('public/ticket-logo.png', Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]));
const out = fs.statSync('public/ticket-logo.png');
console.log('logo.png written:', W + 'x' + H, out.size, 'bytes');
