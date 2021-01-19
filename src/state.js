import { observe } from "./observer/index.js";
import { proxy, isObject } from "./utils/index";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.watch) {
    initWatch(vm, opts.watch);
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
function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key];
    // 如果结果值是数组循环创建watcher
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}
function createWatcher(vm, exprOrFn, handler, options) {
  // 如果是对象则提取函数 和配置
  if (isObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  // 如果是字符串就是实例上的函数
  if (typeof handler == "string") {
    handler = vm[handler];
  }
  return vm.$watch(exprOrFn, handler, options);
}
