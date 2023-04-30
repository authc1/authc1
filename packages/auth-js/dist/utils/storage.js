var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/storage.ts
var storage_exports = {};
__export(storage_exports, {
  clear: () => clear,
  getItem: () => getItem,
  removeItem: () => removeItem,
  setItem: () => setItem
});
module.exports = __toCommonJS(storage_exports);
function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getItem(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}
function removeItem(key) {
  localStorage.removeItem(key);
}
function clear() {
  localStorage.clear();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clear,
  getItem,
  removeItem,
  setItem
});
