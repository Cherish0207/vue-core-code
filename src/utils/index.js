/**
 *
 * @param {*} data 当前数据是不是对象
 */
export function isObject(data) {
  return typeof data === "object" && data !== null;
}

/**
 *
 * @param {*} data
 * @param {*} key
 * @param {*} value 定义不可枚举属性
 */
export function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false,
    configurable: false,
    value,
  });
}
/**
 * 
 * @param {*} vm 
 * @param {*} source 
 * @param {*} key 
 */
export function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}