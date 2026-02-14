export function range(start, stop, step) {
    return Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );
}

export function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

export function setDeepObjProp(obj, path, value) {
  if (path.length === 1) {
    obj[path] = value;
    return;
  }
  return setDeepObjProp(obj[path[0]], path.slice(1), value);
}
  