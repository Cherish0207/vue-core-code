import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler.js";
let id = 0;
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.user = !!options.user;
    // 把当前的属性编程取值表达式，当取之是
    if (typeof exprOrFn == "function") {
      this.getter = exprOrFn;
    } else {
      this.getter = function () {
        // 将表达式转换成函数
        let path = exprOrFn.split(".");
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]];
        }
        return obj;
      };
    }
    this.cb = cb;
    this.options = options;
    this.id = id++;
    this.deps = [];
    this.depsId = new Set();
    this.value = this.get(); // 将初始值记录到value属性上
  }
  get() {
    pushTarget(this);
    const value = this.getter.call(this.vm); // 执行函数 （依赖收集）
    popTarget();
    return value;
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  update() {
    console.log("update");
    queueWatcher(this);
  }
  run() {
    console.log("run");
    const oldValue = this.value;
    const newValue = this.get();
    this.value = newValue;
    if (this.user) {
      this.cb.call(this, newValue, oldValue);
    }
  }
}

export default Watcher;
