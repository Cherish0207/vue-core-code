import { mergeOptions } from "../utils/mergeOptions";
export function initGlobalAPI(Vue) {
  // 整合了所有的全局相关的内容
  Vue.options = {};

  initMixin(Vue);

  // _base 就是Vue的构造函数
  Vue.options._base = Vue;
  Vue.options.components = {};

  // initExtend
  initExtend(Vue);

  // 注册API方法
  initAssetRegisters(Vue);
}
function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    // 将属性合并到Vue.options上
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
export default function initAssetRegisters(Vue) {
  Vue.component = function (id, definition) {
    definition.name = definition.name || id;
    definition = this.options._base.extend(definition);
    this.options["components"][id] = definition;
  };
}
export function initExtend(Vue) {
  let cid = 0;
  Vue.extend = function (extendOptions) {
    const Super = this;
    const Sub = function VueComponent(options) {
      this._init(options);
    };
    Sub.cid = cid++;
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    console.log(Super.options);
    console.log(extendOptions);
    Sub.options = mergeOptions(Super.options, extendOptions);
    return Sub;
  };
}
