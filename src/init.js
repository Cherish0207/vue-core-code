import { initState } from "./state";
import { compileToFunction } from "./compiler/index";
import { mountComponent, callHook } from "./lifecycle";
import { mergeOptions } from "./utils/mergeOptions";
import { nextTick } from "./utils/next-tick";
import Watcher from "./observer/watcher";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    this.$options = mergeOptions(vm.constructor.options, options);

    // 初始化状态
    callHook(vm, "beforeCreate");
    initState(vm);
    callHook(vm, "created");

    // 页面挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = this.$options;
    el = document.querySelector(el);

    // 如果没有render方法,将template编译成render函数
    if (!options.render) {
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
      }
      const render = compileToFunction(template);
      options.render = render;
    }
    mountComponent(vm, el);
  };
}

export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  };
  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    options.user = true; // 标记为用户watcher
    // 核心就是创建个watcher
    const watcher = new Watcher(this, exprOrFn, cb, options, exprOrFn + '用户watcher');
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
  };
}
