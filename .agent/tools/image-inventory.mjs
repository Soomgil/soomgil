// Keep quoted Vue expressions intact, including comparisons containing >.
export function extractImages(template) {
  return [...template.matchAll(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)].map((tag) => {
    const attrs = new Map();
    for (const match of tag[1].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
    }
    return {
      src: attrs.get("src") ?? attrs.get(":src") ?? "",
      // null means absent; an explicitly empty alt is valid for decoration.
      alt: attrs.get("alt") ?? attrs.get(":alt") ?? null,
    };
  });
}
