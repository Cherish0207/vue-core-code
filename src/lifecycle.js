import { log } from "debug";
import Watcher from "./observer/watcher";
import { patch } from "./utils/patch";

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    vm.$el = patch(vm.$el, vnode);
  };
}
export function mountComponent(vm, el) {
  vm.$el = el;
  callHook(vm, "beforeMount");
  let updateComponent = () => {
    console.log("updateComponent");
    // 将虚拟节点 渲染到页面上
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, () => {}, true);
  callHook(vm, "mounted");
}
export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm);
    }
  }
}
