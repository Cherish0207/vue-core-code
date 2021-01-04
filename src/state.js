import {observe} from './observer/index.js'

export function initState (vm) {
  const opts = vm.$options
  if(opts.data) {
    initData(vm)
  }
  // if(opts.props) {
  //   initProps(vm)
  // }
  // if(opts.methods) {
  //   initMethod(vm)
  // }
  // if(opts.computed) {
  //   initComputed(vm)
  // }
  // if(opts.watch) {
  //   initWatch(vm)
  // }
}

function initData(){
  let data = this.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  observe(data)
}
// function initProps(){}
// function initMethod(){}
// function initComputed(){}
// function initWatch(){}