/**
 * One-time: repack the ticket font so browsers will load it.
 *
 * The font was lifted out of the office's reference PDF, and PDF embedders
 * pack the tables end to end with no padding. That is fine inside a PDF, but
 * the sfnt spec wants every table to start on a 4-byte boundary, and browsers
 * enforce it — Chrome's sanitiser rejected the whole file with
 * "OTS parsing error: cvt : misaligned table", so the front page fell back to
 * a plain serif.
 *
 * This only moves tables and fixes the checksums. Not one byte of glyph
 * outline, metric or cmap data changes, so the printed tickets are unaffected.
 */
const fs = require('fs');

const PATH = 'public/ticket-font.ttf';
const src = fs.readFileSync(PATH);

const numTables = src.readUInt16BE(4);
const tables = [];
for (let i = 0; i < numTables; i++) {
  const o = 12 + i * 16;
  tables.push({
    tag: src.toString('ascii', o, o + 4),
    data: src.subarray(src.readUInt32BE(o + 8), src.readUInt32BE(o + 8) + src.readUInt32BE(o + 12)),
  });
}
// The directory must stay sorted by tag.
tables.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));

/** sfnt checksum: the table read as big-endian uint32s, zero-padded to a multiple of 4. */
function checksum(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i += 4) {
    sum = (sum + buf.readUInt32BE(i)) >>> 0;
  }
  return sum;
}

const pad = (n) => (4 - (n % 4)) % 4;
const headerSize = 12 + numTables * 16;

let offset = headerSize;
for (const t of tables) {
  t.offset = offset;
  t.padded = Buffer.concat([t.data, Buffer.alloc(pad(t.data.length))]);
  offset += t.padded.length;
}

const out = Buffer.alloc(offset);
src.copy(out, 0, 0, 12); // sfnt version, numTables, searchRange, entrySelector, rangeShift

tables.forEach((t, i) => {
  const o = 12 + i * 16;
  out.write(t.tag.padEnd(4), o, 4, 'ascii');
  out.writeUInt32BE(checksum(t.padded), o + 4);
  out.writeUInt32BE(t.offset, o + 8);
  out.writeUInt32BE(t.data.length, o + 12); // the directory records the real length
  t.padded.copy(out, t.offset);
});

// checkSumAdjustment is defined over the whole file with its own slot zeroed.
const head = tables.find((t) => t.tag === 'head');
out.writeUInt32BE(0, head.offset + 8);
out.writeUInt32BE((0xb1b0afba - checksum(out)) >>> 0, head.offset + 8);

fs.writeFileSync(PATH, out);
console.log(`repacked ${PATH}: ${src.length} -> ${out.length} bytes, ${numTables} tables aligned`);
