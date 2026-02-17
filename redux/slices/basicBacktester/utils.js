// /**
//  * Safely set a deep property on an object, creating missing
//  * intermediate objects/arrays as needed.
//  *
//  * @param {Object|Array} root   The object/array you want to mutate.
//  * @param {Array<string|number>} path   An array of keys/indices.
//  * @param {*} value            The value to assign at the leaf.
//  * @returns {Object|Array}    The mutated root (same reference you passed in).
//  *
//  * Example:
//  *   const state = {};
//  *   setDeepObjProp(state, ['positions', 'legs', 0, 'expanded'], true);
//  *   // => { positions: { legs: [ { expanded: true } ] } }
//  */
// export function setDeepObjProp(root, path, value) {
//   if (!Array.isArray(path) || path.length === 0) {
//     throw new Error('Path must be a non‑empty array');
//   }

//   // Walk the path, creating missing containers.
//   let current = root;

//   for (let i = 0; i < path.length; i++) {
//     const key = path[i];
//     const isLast = i === path.length - 1;

//     // If we are at the leaf, assign the value.
//     if (isLast) {
//       current[key] = value;
//       return root; // done
//     }

//     // If the next container does not exist, create it.
//     // Decide whether we need an array or an object:
//     const nextKey = path[i + 1];
//     const needArray = typeof nextKey === 'number';

//     if (current[key] === undefined || current[key] === null) {
//       // Create an empty array or object depending on the *next* key.
//       current[key] = needArray ? [] : {};
//     } else if (needArray && !Array.isArray(current[key])) {
//       // Existing container is not an array but we need one → replace.
//       current[key] = [];
//     } else if (!needArray && typeof current[key] !== 'object') {
//       // Existing container is a primitive but we need an object → replace.
//       current[key] = {};
//     }

//     // Move deeper.
//     current = current[key];
//   }

//   // Should never reach here because the loop returns on the leaf.
//   return root;
// }

export function setDeepObjProp(obj, path, value) {
  if (path.length === 1) {
    obj[path] = value;
    return;
  }
  return setDeepObjProp(obj[path[0]], path.slice(1), value);
}