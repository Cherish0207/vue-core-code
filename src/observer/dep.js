let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = [];
  }
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this); // 让watcher,去存放dep
    }
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
}
let stack = [];
export function pushTarget(watcher) {
  console.log('pushTarget');
  Dep.target = watcher;
  stack.push(watcher);
}
export function popTarget() {
  console.log('popTarget');
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;
