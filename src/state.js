import { observe } from "./observer/index.js";
import Watcher from "./observer/watcher.js";
import Dep from "./observer/dep.js";
import { proxy, isObject } from "./utils/index";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.watch) {
    initWatch(vm, opts.watch);
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
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
function initComputed(vm, computed) {
  // 存放计算属性的watcher
  const watchers = (vm._computedWatchers = {});
  for (const key in computed) {
    const userDef = computed[key];
    // 获取get方法
    const getter = typeof userDef === "function" ? userDef : userDef.get;
    // 创建计算属性watcher
    watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true }, key + '_computed');
    defineComputed(vm, key, userDef);
  }
}
const sharedPropertyDefinition = {};
function defineComputed(target, key, userDef) {
  console.log('computedGetter');
  if (typeof userDef === "function") {
    sharedPropertyDefinition.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  // 使用defineProperty定义
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        // 如果dirty为true
        watcher.evaluate(); // 计算出新值，并将dirty 更新为false
      }
      if (Dep.target) {
        // 计算属性在模板中使用 则存在Dep.target
        watcher.depend();
        console.log(watcher);
      }
      // 如果依赖的值不发生变化，则返回上次计算的结果
      return watcher.value;
    }
  };
}
