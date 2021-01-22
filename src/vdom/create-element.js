import { isReservedTag, isObject } from "../utils/index";
// 创建虚拟节点
export function createTextNode(text) {
  return vnode(undefined, undefined, undefined, undefined, text);
}
export function createElement(vm, tag, data = {}, ...children) {
  let key = data.key;
  if (key) {
    delete data.key;
  }
  if (typeof tag === "string") {
    if (isReservedTag(tag)) {
      return vnode(tag, data, key, children);
    } else {
      // 如果是组件需要拿到组件的定义,通过组件的定义创造虚拟节点
      let Ctor = vm.$options.components[tag];
      return createComponent(vm, tag, data, key, children, Ctor);
    }
  }
}
function createComponent(vm, tag, data, key, children, Ctor) {
  // 获取父类构造函数
  const baseCtor = vm.$options._base;
  console.log(baseCtor);
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }
  data.hook = {
    // 组件的生命周期钩子
    init(vnode) {
      let child = vnode.componentInstance = new Ctor({})
      child.$mount()
      console.log(vnode);
    },
  };
  return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, {
    Ctor,
    children,
  });
}
function vnode(tag, data, key, children, text, componentOptions) {
  return { tag, data, key, children, text, componentOptions };
}
