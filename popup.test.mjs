// run: node popup.test.mjs
import assert from "node:assert";
import { looksSecret, hueFromString, migrate, parseImport } from "./popup.js";

// secret detection drives masking — the bit that matters for safety
assert.ok(looksSecret("pass") && looksSecret("API Token") && looksSecret("secretKey"));
assert.ok(!looksSecret("user") && !looksSecret("host") && !looksSecret("name"));

// hue is deterministic and in range
assert.strictEqual(hueFromString("ssh prod"), hueFromString("ssh prod"));
const h = hueFromString("db staging");
assert.ok(h >= 0 && h < 360);

// migration from the old {serviceName, serviceToken} shape
const out = migrate([{ serviceName: "ssh prod", serviceToken: "abc" }]);
assert.strictEqual(out[0].title, "ssh prod");
assert.deepStrictEqual(out[0].fields, [{ label: "token", value: "abc" }]);
assert.ok(out[0].id);

// import accepts current shape, the {entries:[...]} wrapper, and v1 backups
const cur = parseImport('[{"title":"x","fields":[{"label":"user","value":"root"}]}]');
assert.strictEqual(cur[0].fields[0].value, "root");
assert.ok(cur[0].id);
const wrapped = parseImport('{"entries":[{"title":"y","fields":[]}]}');
assert.strictEqual(wrapped[0].title, "y");
const old = parseImport('[{"serviceName":"db","serviceToken":"pw"}]');
assert.deepStrictEqual(old[0].fields, [{ label: "token", value: "pw" }]);
assert.throws(() => parseImport('{"nope":1}'));
assert.throws(() => parseImport("not json"));

console.log("ok");
