import assert from "node:assert/strict";
import test from "node:test";
import { extractImages } from "./image-inventory.mjs";

test("quoted greater-than preserves the following bound alt", () => {
  assert.deepEqual(extractImages('<img v-if="photos.length > 0" :alt="title" :src="photos[index]" />'),
    [{ src: "photos[index]", alt: "title" }]);
});

test("decorative empty alt is distinct from missing alt", () => {
  assert.deepEqual(extractImages('<img src="a.png" alt=""><img src="b.png">'),
    [{ src: "a.png", alt: "" }, { src: "b.png", alt: null }]);
});

test("mixed quotes and attribute-like text do not invent alt", () => {
  assert.deepEqual(extractImages(`<img :src="photo || 'fallback.png'" :alt='label > 0 ? "yes" : "no"'><img title=' alt="fake"'>`),
    [{ src: "photo || 'fallback.png'", alt: 'label > 0 ? "yes" : "no"' }, { src: "", alt: null }]);
});
