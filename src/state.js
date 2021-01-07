import {observe} from './observer/index.js'

export function initState (vm) {
  const opts = vm.$options
  if(opts.data) {
    initData(vm)
  }
}

function initData(){
  let data = this.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  observe(data)
}
