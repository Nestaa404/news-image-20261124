// THE WORLD IN ONE DAY — TUESDAY 24 NOVEMBER 2026
// A one-day world news newspaper drawn from scratch with a 5x7 bitmap font
// I defined myself, rendered to a 1024x1024 PNG with a hand-rolled encoder.
// Node 22, standard library only (node:fs, node:path, node:zlib).
// No network, no clock, no randomness: two runs write identical bytes.

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

// ---------------------------------------------------------------------------
// 5x7 bitmap font, defined from scratch in this file.
// Each glyph is 7 rows of 5 bits ("1" = ink). Space is blank.
// ---------------------------------------------------------------------------

const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  a: ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  b: ["10000", "10000", "11110", "10001", "10001", "10001", "11110"],
  c: ["00000", "00000", "01110", "10001", "10000", "10001", "01110"],
  d: ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  f: ["00110", "01001", "01000", "11110", "01000", "01000", "01000"],
  g: ["00000", "01111", "10001", "10001", "01111", "00001", "01110"],
  h: ["10000", "10000", "11110", "10001", "10001", "10001", "10001"],
  i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
  j: ["00010", "00000", "00110", "00010", "00010", "00010", "01100"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
  m: ["00000", "00000", "11010", "10101", "10101", "10101", "10101"],
  n: ["00000", "00000", "11110", "10001", "10001", "10001", "10001"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  p: ["00000", "11110", "10001", "10001", "11110", "10000", "10000"],
  q: ["00000", "00000", "01111", "10001", "10001", "01111", "00001"],
  r: ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  t: ["01000", "01000", "11110", "01000", "01000", "01000", "00110"],
  u: ["00000", "00000", "10001", "10001", "10001", "10011", "01101"],
  v: ["00000", "00000", "10001", "10001", "10001", "01010", "00100"],
  w: ["00000", "00000", "10001", "10001", "10101", "10101", "01010"],
  x: ["00000", "00000", "10001", "01010", "00100", "01010", "10001"],
  y: ["00000", "00000", "10001", "10001", "01111", "00001", "01110"],
  z: ["00000", "00000", "11111", "00010", "00100", "01000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "*": ["00000", "00100", "10101", "01110", "10101", "00100", "00000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "<": ["00010", "00100", "01000", "10000", "01000", "00100", "00010"],
  ">": ["01000", "00100", "00010", "00001", "00010", "00100", "01000"],
  "[": ["01110", "01000", "01000", "01000", "01000", "01000", "01110"],
  "]": ["01110", "00010", "00010", "00010", "00010", "00010", "01110"],
  "|": ["00100", "00100", "00100", "00100", "00100", "00100", "00100"],
  "°": ["00100", "01010", "00100", "00000", "00000", "00000", "00000"],
  "•": ["00000", "00100", "01110", "01110", "00100", "00000", "00000"],
  "—": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "–": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "×": ["00000", "00000", "10001", "01110", "01110", "10001", "00000"],
  "→": ["00000", "00100", "00010", "11111", "00010", "00100", "00000"],
};

// Normalize curly punctuation to the glyphs above.
function norm(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/—/g, "—")
    .replace(/–/g, "-");
}

function glyphOf(ch: string): string[] {
  return FONT[ch] ?? FONT["?"];
}

// ---------------------------------------------------------------------------
// Canvas: a plain RGB buffer with drawing primitives.
// ---------------------------------------------------------------------------

const W = 1024;
const H = 1024;

type RGB = [number, number, number];

const PAPER: RGB = [246, 241, 231];
const INK: RGB = [25, 23, 19];
const RED: RGB = [166, 30, 30];
const NAVY: RGB = [29, 58, 95];
const BLUE: RGB = [46, 109, 164];
const GRAY: RGB = [107, 101, 92];
const GREEN: RGB = [46, 110, 58];
const WATER: RGB = [191, 217, 232];
const LAND: RGB = [217, 207, 178];
const SAND: RGB = [232, 222, 196];
const ORANGE: RGB = [214, 110, 30];
const LIGHT: RGB = [255, 255, 255];
const RULE: RGB = [25, 23, 19];

class Canvas {
  buf: Uint8Array;
  constructor() {
    this.buf = new Uint8Array(W * H * 3);
    this.fillRect(0, 0, W, H, PAPER);
  }
  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    this.buf[i] = c[0];
    this.buf[i + 1] = c[1];
    this.buf[i + 2] = c[2];
  }
  fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(W, Math.ceil(x + w));
    const y1 = Math.min(H, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * W + xx) * 3;
        this.buf[i] = c[0];
        this.buf[i + 1] = c[1];
        this.buf[i + 2] = c[2];
      }
    }
  }
  hline(x: number, y: number, w: number, c: RGB, t = 1): void {
    this.fillRect(x, y, w, t, c);
  }
  vline(x: number, y: number, h: number, c: RGB, t = 1): void {
    this.fillRect(x, y, t, h, c);
  }
  // Bresenham line.
  line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1): void {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      if (t === 1) this.set(x, y, c);
      else this.fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  circle(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = -r; y <= r; y++) {
      const half = Math.floor(Math.sqrt(r * r - y * y));
      for (let x = -half; x <= half; x++) this.set(cx + x, cy + y, c);
    }
  }
  ring(cx: number, cy: number, r: number, c: RGB, t = 1): void {
    for (let a = 0; a < 360; a += 2) {
      const rad = (a * Math.PI) / 180;
      const x = Math.round(cx + r * Math.cos(rad));
      const y = Math.round(cy + r * Math.sin(rad));
      if (t === 1) this.set(x, y, c);
      else this.fillRect(x - 1, y - 1, t, t, c);
    }
  }
  // Filled polygon (scanline, even-odd). Points are [x, y] pairs.
  polygon(pts: Array<[number, number]>, c: RGB): void {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [, y] of pts) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    for (let y = Math.max(0, Math.ceil(minY)); y <= Math.min(H - 1, Math.floor(maxY)); y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const x0 = Math.max(0, Math.ceil(xs[k]));
        const x1 = Math.min(W - 1, Math.floor(xs[k + 1]));
        for (let x = x0; x <= x1; x++) this.set(x, y, c);
      }
    }
  }
  // Text: scale 1 = 5x7 px per glyph, 1 px gap between glyphs.
  text(x: number, y: number, s: string, scale: number, c: RGB): void {
    const t = norm(s);
    let cx = x;
    for (const ch of t) {
      const g = glyphOf(ch);
      for (let r = 0; r < 7; r++) {
        const row = g[r];
        for (let col = 0; col < 5; col++) {
          if (row[col] === "1") {
            this.fillRect(cx + col * scale, y + r * scale, scale, scale, c);
          }
        }
      }
      cx += 6 * scale;
    }
  }
  textWidth(s: string, scale: number): number {
    const t = norm(s);
    if (t.length === 0) return 0;
    return t.length * 6 * scale - scale;
  }
  textCentered(cx: number, y: number, s: string, scale: number, c: RGB): void {
    this.text(cx - Math.floor(this.textWidth(s, scale) / 2), y, s, scale, c);
  }
}

// Greedy word wrap: returns lines of at most maxChars characters.
function wrap(text: string, maxChars: number): string[] {
  const words = norm(text).split(/\s+/).filter((w) => w.length > 0);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur === "") {
      cur = w;
    } else if (cur.length + 1 + w.length <= maxChars) {
      cur += " " + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------------------
// PNG encoder (8-bit RGB, filter 0, zlib via node stdlib). Deterministic.
// ---------------------------------------------------------------------------

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table.push(c >>> 0);
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(cv: Canvas): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(cv.buf.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Content — Tuesday 24 November 2026, from the news dossier.
// All facts are as reported that day. Tanker counts: the dossier is
// inconsistent (2, 3, 4 in different places), so only the lead story states
// the IRGC's claim of four tankers; the timeline and number strip name no
// tanker count. No Shenzhou-24 launch story or map point: it launched 25 Nov.
// ---------------------------------------------------------------------------

const TIMELINE: Array<[string, string]> = [
  ["03:00", "IRGC claims tankers hit mines in Hormuz"],
  ["07:00", "Car bomb wounds 23 in Colombia"],
  ["09:52", "Virginia, Oregon sue SpaceX over Grok"],
  ["12:15", "Sanofi agrees $41bn Insmed takeover"],
  ["18:25", "COP31 fails: no deal, first since 2009"],
  ["19:40", "Putin warns retaliation is unavoidable"],
  ["21:01", "CENTCOM denies Iran's mine claim"],
  ["22:00", "US markets close: S&P -0.50%, Dow up"],
];

const BIG_NUMBERS: Array<[string, string]> = [
  ["$41BN", "Sanofi buys Insmed"],
  ["700,000+", "Russian troops killed in war"],
  ["161", "Ukraine battles in 24 hours"],
  ["5,838", "US measles cases in 2026"],
  ["133", "Illinois points, Big Ten record"],
];

type MainStory = {
  kicker: string;
  headline: string;
  body: string;
  badge: string;
  badgeColor: RGB;
  art: "hormuz" | "ukraine" | "markets";
};

const MAIN_STORIES: MainStory[] = [
  {
    kicker: "STRAIT OF HORMUZ",
    headline: "IRAN SAYS FOUR TANKERS HIT MINES; US DENIES",
    body: "IRGC says four tankers hit mines and burned, naming no ships. CENTCOM denies it: the lane is clear and still in use.",
    badge: "REPORTED - REUTERS",
    badgeColor: RED,
    art: "hormuz",
  },
  {
    kicker: "UKRAINE WAR",
    headline: "PUTIN WARNS OF RETALIATION OVER REFINERY STRIKES",
    body: "A night strike on Zaporizhzhia kills 2 and wounds 40. Putin says retaliation for refinery strikes is 'unavoidable'.",
    badge: "CONFIRMED - REUTERS",
    badgeColor: NAVY,
    art: "ukraine",
  },
  {
    kicker: "GLOBAL MARKETS",
    headline: "SANOFI BUYS INSMED FOR $41BN; CHIP SHARES SLIDE",
    body: "Sanofi agrees to buy US biotech Insmed for US$41bn. Chip shares slide: Nvidia falls 5.86% after Monday's 31% surge.",
    badge: "CONFIRMED - CNBC",
    badgeColor: NAVY,
    art: "markets",
  },
];

type MidStory = { headline: string; summary: string; source: string };
const MID_STORIES: MidStory[] = [
  { headline: "ISRAELI STRIKES KILL SIX IN GAZA", summary: "Police post hit in Khan Younis; 6 dead.", source: "REUTERS" },
  { headline: "US MEASLES DEATH TOLL REACHES 14", summary: "Wisconsin reports 3rd death of 2026.", source: "REUTERS" },
  { headline: "COP31 FAILS, FIRST SINCE 2009", summary: "EU rejects text omitting fossil fuels.", source: "CARBON BRIEF" },
  { headline: "TWO STATES SUE SPACEX OVER GROK", summary: "Grok made sexual images of children.", source: "NPR" },
  { headline: "MALAYSIA REPATRIATES 6,500 MIGRANTS", summary: "1,500 by navy ships; 5,303 by plane.", source: "AFP" },
  { headline: "CAR BOMB WOUNDS 23 IN VILLAVICENCIO", summary: "Blast wrecks Meta governor's office.", source: "AP" },
  { headline: "EU COURT BACKS PUSHBACKS", summary: "Pushbacks allowed in border emergency.", source: "DEUTSCHE WELLE" },
  { headline: "NATO VOWS TO DEFEND SPACE", summary: "Russia 'readies nuclear satellite'.", source: "DEFENSE NEWS" },
  { headline: "5.6 QUAKE SHAKES NEPAL", summary: "Near China border; no deaths reported.", source: "STRAITS TIMES" },
  { headline: "ILLINOIS SCORES 133, A RECORD", summary: "Coleman 35 points in 133-83 win.", source: "FIELD LEVEL" },
];

// 24 one-line stories. Left column 1-12, right column 13-24.
const ALSO: string[] = [
  "Trump orders faster federal executions",
  "Watchdog: ICE training cuts too far",
  "47,000 women killed by partners",
  "Fighting traps Ebola team in Congo",
  "Somalia, Uganda step up vs Shabaab",
  "Hasina plans December return to Dhaka",
  "Iran flogs singer Ahmadi 74 times",
  "BepiColombo reaches Mercury orbit",
  "Astronomers find most distant quasar",
  "Germany first to access Ukraine Delta",
  "Iraq PM orders takeover of Kurdish oil",
  "Mexico to try 'El Chapo Isidro' itself",
  "S. Korea offers $375k for AI cheats",
  "UN: Gaza war erased 77 years' gains",
  "Real Madrid rout PSV 5-1 in Europe",
  "Emmys: Schofield, Leon win top acting",
  "Nigeria holds interest rate at 23%",
  "Sweden to vote on PM Kristersson",
  "Slowakia scraps expat postal voting",
  "IMF approves $425m plan for Guinea",
  "Heme found in 115m-year-old fossil",
  "DeepMind quantum method 290x cheaper",
  "Claude paper claims VP is not VNP",
  "Thanksgiving storm hits US East Coast",
];

// World map: longitude/latitude of each numbered story location.
// Numbers match the headlines: 1-3 are the lead stories, 1-10 the middle list.
const MAP_POINTS: Array<{ lon: number; lat: number; n: string; label: string; dx: number; dy: number; ox?: number; oy?: number }> = [
  { lon: 56, lat: 26, n: "1", label: "HORMUZ", dx: 8, dy: -4 },
  { lon: 35, lat: 47, n: "2", label: "UKRAINE", dx: 8, dy: -4, ox: 14, oy: 0 },
  { lon: 2, lat: 49, n: "3", label: "PARIS", dx: -34, dy: -4, ox: -18, oy: 0 },
  { lon: 34, lat: 31, n: "1", label: "", dx: 8, dy: 8 },
  { lon: -89, lat: 44, n: "2", label: "WISCONSIN", dx: -58, dy: -4 },
  { lon: 30, lat: 37, n: "3", label: "ANTALYA", dx: 8, dy: 8, ox: -14, oy: 0 },
  { lon: -77, lat: 39, n: "4", label: "VIRGINIA", dx: 8, dy: -12 },
  { lon: 101, lat: 3, n: "5", label: "MALAYSIA", dx: 8, dy: -4 },
  { lon: -73, lat: 4, n: "6", label: "COLOMBIA", dx: 8, dy: -12 },
  { lon: 7, lat: 48, n: "7", label: "", dx: 8, dy: -12, ox: 14, oy: 0 },
  { lon: 4, lat: 52, n: "8", label: "", dx: -32, dy: -12 },
  { lon: 87, lat: 27, n: "9", label: "NEPAL", dx: 8, dy: 8 },
  { lon: -88, lat: 40, n: "10", label: "ILLINOIS", dx: 8, dy: 8, ox: 10, oy: 7 },
];

// ---------------------------------------------------------------------------
// Section drawing.
// ---------------------------------------------------------------------------

const M = 14; // outer margin
const CW = W - 2 * M; // content width = 996

function drawMasthead(cv: Canvas): void {
  cv.textCentered(W / 2, 12, "THE WORLD IN ONE DAY", 5, INK);
  cv.textCentered(W / 2, 54, "TUESDAY 24 NOVEMBER 2026", 3, RED);
  cv.hline(M, 80, CW, RULE, 3);
  cv.hline(M, 85, CW, RULE, 1);
}

function drawTimeline(cv: Canvas): void {
  cv.text(M, 88, "THE DAY IN UTC", 2, NAVY);
  cv.text(W - M - cv.textWidth("ALL TIMES UTC - TUESDAY 24 NOV 2026", 1), 91, "ALL TIMES UTC - TUESDAY 24 NOV 2026", 1, GRAY);
  const colW = CW / 4;
  const rowY = [106, 150];
  TIMELINE.forEach(([time, ev], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = M + col * colW;
    const y = rowY[row];
    cv.text(x, y, time + " UTC", 2, RED);
    const lines = wrap(ev, 20);
    lines.slice(0, 2).forEach((ln, li) => {
      cv.text(x, y + 16 + li * 14, ln, 2, INK);
    });
    if (col < 3) cv.vline(Math.round(x + colW - 8), y + 2, 42, [200, 192, 176], 1);
  });
  cv.hline(M, 198, CW, RULE, 1);
}

function drawBigNumbers(cv: Canvas): void {
  const cellW = CW / 5;
  BIG_NUMBERS.forEach(([num, label], i) => {
    const x = M + i * cellW;
    cv.textCentered(x + cellW / 2, 206, num, 4, NAVY);
    const lines = wrap(label, 16);
    lines.slice(0, 2).forEach((ln, li) => {
      cv.textCentered(x + cellW / 2, 238 + li * 14, ln, 2, INK);
    });
    if (i < BIG_NUMBERS.length - 1) cv.vline(Math.round(x + cellW - 2), 208, 52, [200, 192, 176], 1);
  });
  cv.hline(M, 270, CW, RULE, 2);
}

// --- Lead-story illustrations (drawn with code primitives) ---

function drawHormuzArt(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fillRect(x, y, w, h, WATER);
  // Iran (top) and Oman (bottom) land masses.
  cv.polygon(
    [
      [x, y],
      [x + w, y],
      [x + w, y + 18],
      [x + w * 0.62, y + 30],
      [x + w * 0.4, y + 24],
      [x, y + 30],
    ],
    LAND,
  );
  cv.polygon(
    [
      [x, y + h],
      [x + w, y + h],
      [x + w, y + h - 16],
      [x + w * 0.55, y + h - 26],
      [x + w * 0.3, y + h - 20],
      [x, y + h - 14],
    ],
    LAND,
  );
  cv.text(x + 8, y + 4, "IRAN", 1, INK);
  cv.text(x + w - 34, y + h - 12, "OMAN", 1, INK);
  // Four tankers in the strait.
  const shipY = y + 44;
  for (let s = 0; s < 4; s++) {
    const sx = x + 24 + s * 74;
    cv.fillRect(sx, shipY, 52, 12, INK);
    cv.fillRect(sx + 8, shipY - 8, 20, 8, INK);
    cv.fillRect(sx + 36, shipY - 6, 5, 6, RED);
    // Burning tanker: flames on the last ship.
    if (s === 3) {
      cv.polygon(
        [
          [sx + 12, shipY - 8],
          [sx + 18, shipY - 24],
          [sx + 24, shipY - 8],
        ],
        ORANGE,
      );
      cv.polygon(
        [
          [sx + 26, shipY - 8],
          [sx + 32, shipY - 20],
          [sx + 38, shipY - 8],
        ],
        RED,
      );
    }
  }
  // Mines: spiky black circles in the channel, clear of the ships.
  const mines: Array<[number, number]> = [
    [x + 60, shipY + 22],
    [x + 150, shipY + 26],
    [x + 250, shipY + 20],
  ];
  for (const [mx, my] of mines) {
    for (let a = 0; a < 8; a++) {
      const rad = (a * Math.PI) / 4;
      cv.line(mx, my, Math.round(mx + 10 * Math.cos(rad)), Math.round(my + 10 * Math.sin(rad)), INK, 2);
    }
    cv.circle(mx, my, 6, INK);
  }
}

function drawUkraineArt(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fillRect(x, y, w, h, SAND);
  cv.text(x + 8, y + 6, "UKRAINIAN GENERAL STAFF - 24 HOURS", 1, GRAY);
  const bars: Array<[string, string, number]> = [
    ["BATTLES", "161", 161],
    ["AIR STRIKES", "73", 73],
    ["DRONES", "7,475", 7475],
    ["TROOPS KILLED", "1,848", 1848],
  ];
  const maxV = 7475;
  bars.forEach(([label, val, v], i) => {
    const by = y + 22 + i * 16;
    cv.text(x + 8, by, label, 1, INK);
    const barX = x + 108;
    const barW = Math.max(8, Math.round((v / maxV) * 130));
    cv.fillRect(barX, by, barW, 9, i === 3 ? RED : NAVY);
    cv.text(barX + barW + 6, by, val, 1, INK);
  });
}

function drawMarketsArt(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fillRect(x, y, w, h, LIGHT);
  cv.hline(x, y + h - 22, w, [200, 192, 176], 1);
  cv.vline(x + 10, y + 6, h - 28, [200, 192, 176], 1);
  // Nvidia falling line (red).
  const nv: Array<[number, number]> = [
    [20, 22],
    [80, 30],
    [140, 40],
    [200, 52],
    [260, 62],
  ];
  for (let i = 0; i + 1 < nv.length; i++) {
    cv.line(x + nv[i][0], y + nv[i][1], x + nv[i + 1][0], y + nv[i + 1][1], RED, 3);
  }
  // Sanofi rising line (blue).
  const sf: Array<[number, number]> = [
    [20, 56],
    [80, 48],
    [140, 38],
    [200, 26],
    [260, 16],
  ];
  for (let i = 0; i + 1 < sf.length; i++) {
    cv.line(x + sf[i][0], y + sf[i][1], x + sf[i + 1][0], y + sf[i + 1][1], BLUE, 3);
  }
  cv.text(x + 16, y + 6, "SANOFI +9.76%", 1, BLUE);
  // White plate behind the Nvidia label so the falling line never strikes it.
  const nvLabel = "NVIDIA -5.86%";
  cv.fillRect(x + 194, y + 50, cv.textWidth(nvLabel, 1) + 4, 11, LIGHT);
  cv.text(x + 196, y + 52, nvLabel, 1, RED);
  cv.text(x + 8, y + h - 18, "DOW +0.85%  NASDAQ -1.48%", 1, INK);
}

function drawBadge(cv: Canvas, x: number, y: number, text: string, color: RGB): void {
  const pad = 8;
  const tw = cv.textWidth(text, 2);
  cv.fillRect(x, y, tw + pad * 2, 20, color);
  cv.text(x + pad, y + 3, text, 2, LIGHT);
}

function drawMainStoriesReal(cv: Canvas): void {
  const colW = 324;
  const xs = [M, M + colW + 12, M + 2 * (colW + 12)];
  MAIN_STORIES.forEach((s, i) => {
    const x = xs[i];
    cv.text(x, 276, s.kicker, 2, RED);
    const artY = 294;
    if (s.art === "hormuz") drawHormuzArt(cv, x, artY, colW, 88);
    else if (s.art === "ukraine") drawUkraineArt(cv, x, artY, colW, 88);
    else drawMarketsArt(cv, x, artY, colW, 88);
    const headLines = wrap(s.headline, 18);
    headLines.slice(0, 3).forEach((ln, li) => {
      cv.text(x, 388 + li * 21, ln, 3, INK);
    });
    const bodyLines = wrap(s.body, 27);
    bodyLines.slice(0, 5).forEach((ln, li) => {
      cv.text(x, 455 + li * 14, ln, 2, INK);
    });
    drawBadge(cv, x, 529, s.badge, s.badgeColor);
  });
  cv.hline(M, 554, CW, RULE, 2);
}

function drawMiddleStories(cv: Canvas): void {
  cv.text(M, 560, "THE REST OF THE DAY", 2, NAVY);
  const colW = (CW - 24) / 2;
  MID_STORIES.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (colW + 24);
    const y = 578 + row * 32;
    const num = String(i + 1);
    cv.circle(x + 8, y + 7, 8, RED);
    cv.text(x + 8 - Math.floor(cv.textWidth(num, 1) / 2), y + 4, num, 1, LIGHT);
    cv.text(x + 20, y, s.headline, 2, INK);
    cv.text(x + 20, y + 16, s.summary, 2, GRAY);
    const tagW = cv.textWidth(s.source, 1) + 8;
    const tagX = Math.round(x + colW - tagW);
    cv.fillRect(tagX, y, tagW, 10, NAVY);
    cv.text(tagX + 4, y + 1, s.source, 1, LIGHT);
  });
  cv.hline(M, 740, CW, RULE, 1);
}

// Simplified world map from lon/lat polygons, drawn in code.
const CONTINENTS: Array<Array<[number, number]>> = [
  // North America
  [[-168, 66], [-140, 70], [-120, 72], [-95, 80], [-80, 73], [-55, 60], [-65, 45], [-75, 35], [-80, 25], [-90, 20], [-97, 16], [-105, 20], [-115, 28], [-125, 40], [-125, 49], [-140, 60], [-165, 60]],
  // Greenland
  [[-55, 60], [-45, 60], [-30, 68], [-20, 70], [-40, 76], [-58, 76]],
  // South America
  [[-80, 10], [-75, 5], [-60, 0], [-50, -5], [-35, -8], [-40, -20], [-48, -28], [-58, -35], [-65, -40], [-70, -52], [-73, -40], [-73, -20], [-77, -12], [-80, 0]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 48], [0, 51], [5, 53], [8, 57], [18, 56], [21, 55], [28, 59], [30, 60], [23, 65], [18, 69], [12, 71], [5, 60], [-5, 58], [-10, 50], [-10, 43], [-6, 36]],
  // Africa
  [[-6, 35], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 11], [48, 0], [40, -10], [35, -18], [32, -26], [26, -33], [20, -35], [15, -27], [12, -18], [9, -1], [4, 6], [-8, 5], [-13, 8], [-17, 15], [-16, 20], [-10, 30]],
  // Asia
  [[30, 60], [40, 68], [60, 69], [90, 75], [120, 73], [150, 70], [170, 66], [180, 65], [170, 60], [160, 55], [140, 40], [130, 35], [127, 35], [120, 30], [110, 20], [105, 10], [100, 8], [95, 15], [90, 22], [80, 8], [75, 20], [66, 25], [60, 25], [55, 26], [50, 29], [48, 30], [43, 35], [36, 36], [30, 41], [28, 45], [30, 50]],
  // Australia
  [[113, -22], [114, -30], [115, -35], [124, -33], [130, -32], [137, -35], [140, -38], [147, -39], [150, -37], [153, -27], [150, -22], [146, -19], [142, -15], [142, -11], [136, -12], [132, -12], [126, -14], [122, -17], [118, -20]],
];

function drawWorldMap(cv: Canvas): void {
  cv.text(M, 746, "WHERE THE NEWS HAPPENED", 2, NAVY);
  const mapX = M;
  const mapY = 764;
  const mapW = CW;
  const mapH = 36;
  cv.fillRect(mapX, mapY, mapW, mapH, WATER);
  const px = (lon: number) => mapX + ((lon + 170) / 360) * mapW;
  const py = (lat: number) => mapY + ((75 - lat) / 130) * mapH;
  for (const poly of CONTINENTS) {
    cv.polygon(
      poly.map(([lon, lat]) => [Math.round(px(lon)), Math.round(py(lat))] as [number, number]),
      LAND,
    );
  }
  for (const p of MAP_POINTS) {
    const tx = Math.round(px(p.lon));
    const ty = Math.round(py(p.lat));
    // Illinois sits almost on top of Wisconsin: offset its dot with a leader.
    const cx = tx + (p.ox ?? 0);
    const cy = ty + (p.oy ?? 0);
    if (p.ox !== undefined || p.oy !== undefined) {
      cv.line(tx, ty, cx, cy, RED, 1);
    }
    cv.circle(cx, cy, 5, RED);
    cv.ring(cx, cy, 5, LIGHT, 1);
    if (p.label !== "") cv.text(cx + p.dx, cy + p.dy, p.label, 1, INK);
    cv.text(cx - Math.floor(cv.textWidth(p.n, 1) / 2), cy - 3, p.n, 1, LIGHT);
  }
}

function drawAlso(cv: Canvas): void {
  cv.text(M, 804, "ALSO ON TUESDAY 24 NOVEMBER", 2, NAVY);
  const colW = (CW - 24) / 2;
  ALSO.forEach((item, i) => {
    const col = i < 12 ? 0 : 1;
    const row = i % 12;
    const x = M + col * (colW + 24);
    const y = 822 + row * 15;
    const num = String(i + 1);
    cv.text(x, y, num + ".", 2, RED);
    cv.text(x + 32, y, item, 2, INK);
  });
}

function drawFooter(cv: Canvas): void {
  cv.hline(M, 1002, CW, RULE, 2);
  cv.textCentered(
    W / 2,
    1008,
    "DATE CHECK: EVERY STORY HERE IS FROM TUESDAY 24 NOVEMBER 2026.",
    2,
    INK,
  );
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------

function build(): Buffer {
  const cv = new Canvas();
  drawMasthead(cv);
  drawTimeline(cv);
  drawBigNumbers(cv);
  drawMainStoriesReal(cv);
  drawMiddleStories(cv);
  drawWorldMap(cv);
  drawAlso(cv);
  drawFooter(cv);
  return encodePNG(cv);
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "entry.png");
  fs.writeFileSync(outPath, build());
  console.log("wrote " + outPath);
}

main();
