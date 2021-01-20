import Watcher from "./observer/watcher";
import { patch } from "./utils/patch";

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const prevVnode = vm._vnode; // 保留上一次的vnode
    vm._vnode = vnode;
    if (!prevVnode) {
      vm.$el = patch(vm.$el, vnode); // 需要用虚拟节点创建出真实节点 替换掉 真实的$el
      // 我要通过虚拟节点 渲染出真实的dom
    } else {
      vm.$el = patch(prevVnode, vnode); // 更新时做diff操作
    }
  };
}
export function mountComponent(vm, el) {
  vm.$el = el;
  callHook(vm, "beforeMount");
  let updateComponent = () => {
    // console.log("updateComponent");
    // 将虚拟节点 渲染到页面上
    vm._update(vm._render());
    // callHook(vm, "updated");
  };
  new Watcher(vm, updateComponent, () => {}, true, '渲染watcher');
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
