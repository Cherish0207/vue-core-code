import { isObject, def } from "../utils/index";
import { arrayMethods } from "./array";

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
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newValue) {
      if (newValue == value) return;
      observe(newValue);
      value = newValue;
    },
  });
}
export function observe(data) {
  if (isObject(data)) {
    return new Observer(data);
  }
}
