import { initState } from "./state";
import { compileToFunctions } from "./compiler/index";
import { mountComponent, callHook } from "./lifecycle";
import { mergeOptions } from "./utils/mergeOptions";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    this.$options = mergeOptions(vm.constructor.options,options);

    // 初始化状态
    callHook(vm,'beforeCreate');
    initState(vm);
    callHook(vm,'created');
    
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
      const render = compileToFunctions(template);
      options.render = render;
    }
    mountComponent(vm, el);
  };
}
