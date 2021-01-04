import {arrayMethods} from './array';

function proxy(vm,source,key){
  Object.defineProperty(vm,key,{
      get(){
          return vm[source][key];
      },
      set(newValue){
          vm[source][key] = newValue;
      }
  });
}

class Observer {
  constructor(data) {
    Object.defineProperty(value,'__ob__',{
      enumerable:false,
      configurable:false,
      value:this
    });
    for(let key in data){ // 将_data上的属性全部代理给vm实例
      proxy(vm,'_data',key)
    }
    if(Array.isArray(data)) {
      value.__proto__ = arrayMethods
      this.observeArray(data)
    }else {
      this.walk(data)
    }
  }
  observeArray(array) {
    array.forEach(item => {
      observe(item)
    })
  }
  walk(data) {
    let keys = Object.keys(data)
    keys.forEach(key => {
      value = data[key]
      defineReactive(data, key, value)
    })
  }
}

function defineReactive(data, key, value) {
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(newValue) {
      if(newValue == value) return;
      observe(newValue);
      value = newValue
    }
  })
}
export function observe(data) {
  if(typeof data === 'object' && data !== null) {
    return new Observer(data)
  }
}