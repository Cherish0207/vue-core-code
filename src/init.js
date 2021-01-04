import {initState} from './state'
export function initMixin (Vue) {
  Vue.prototype._init = function(options) {
    const vm = this
    this.$options = options
    initState(vm)
  }
}