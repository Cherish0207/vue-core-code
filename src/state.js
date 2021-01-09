import { observe } from "./observer/index.js";
import { proxy } from "./utils/index";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}
function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? data.call(vm) : data;
  for (let key in data) {
    // 将_data上的属性全部代理给vm实例
    proxy(vm, "_data", key);
  }
  observe(data);
}
