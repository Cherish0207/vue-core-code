import { isObject, def } from "../utils/index";
import { arrayMethods } from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // 给每一个监控过的对象都添加一个__ob__属性
    def(data, "__ob__", this);
    if (Array.isArray(data)) {
      data.__proto__ = arrayMethods;
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  observeArray(array) {
    array.forEach((item) => {
      observe(item);
    });
  }
  walk(data) {
    let keys = Object.keys(data);
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  observe(value);
  let dep = new Dep();
  Object.defineProperty(data, key, {
    get() {
      if(Dep.target){ // 如果取值时有watcher
        console.log('get dep.depend');
        dep.depend(); // 让watcher保存dep，并且让dep 保存watcher
      }
      return value;
    },
    set(newValue) {
      console.log('set');
      if (newValue == value) return;
        observe(newValue);
        value = newValue;
        dep.notify(); // 通知渲染watcher去更新
      },
  });
}
export function observe(data) {
  if (isObject(data)) {
    return new Observer(data);
  }
}
