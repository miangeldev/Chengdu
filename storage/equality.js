// Preserve historical JSON comparison semantics while reusing immutable rows.
// COW snapshots and append-only prefixes share their unchanged record objects.
export function equal(first, second) {
  if (first === second) return true;
  if (Array.isArray(first) && Array.isArray(second) && first.length === second.length) {
    let shared = true;
    for (let index = 0; index < first.length; index++) {
      if (first[index] !== second[index]) { shared = false; break; }
    }
    if (shared) return true;
  }
  return JSON.stringify(first) === JSON.stringify(second);
}
