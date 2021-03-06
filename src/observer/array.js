let oldArrayProtoMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrayProtoMethods);
let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    const result = oldArrayProtoMethods[method].apply(this, args);
    // AOP 切片编程
    const ob = this.__ob__; // 拿到当前observe实例
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测
    return result;
  };
});
