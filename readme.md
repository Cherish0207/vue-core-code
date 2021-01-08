#  手写Vue核心原理
##  一.使用Rollup搭建开发环境
### 1.什么是Rollup?
Rollup 是一个 JavaScript 模块打包器,可以将小块代码编译成大块复杂的代码， rollup.js更专注于Javascript类库打包 （开发应用时使用Wwebpack，开发库时使用Rollup）

### 2.环境搭建

安装rollup环境：
- rollup （打包工具）
- @babel/core （babel核心模块）
- @babel/preset-env （babel将高级语法转低级语法）
- rollup-plugin-babel （桥梁）
- rollup-plugin-serve （实现静态服务）
- cross-env （设置环境变量）
```
npm install @babel/preset-env @babel/core rollup rollup-plugin-babel rollup-plugin-serve cross-env -D
```

rollup.config.js文件编写
```js
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
export default {
    input: './src/index.js',
    output: {
        format: 'umd', // 模块化类型
        file: 'dist/umd/vue.js', 
        name: 'Vue', // 打包后的全局变量的名字
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        process.env.ENV === 'development'?serve({
            open: true,
            openPage: '/public/index.html',
            port: 3000,
            contentBase: ''
        }):null
    ]
}
```

配置.babelrc文件
```json
{
    "presets": [
        "@babel/preset-env"
    ]
}
```
执行脚本配置
- -c 根据配置文件打包
- -w实时打包
```json
"scripts": {
    "build:dev": "rollup -c",
    "serve": "cross-env ENV=development rollup -c -w"
}
```

## 二.Vue响应式原理

`index.js` : 导出 `vue` 构造函数
* Vue的核心代码，只是 `Vue` 的一个声明
* 通过引入文件的方式给 `Vue` 原型添加方法
```js
import {initMixin} from './init';
function Vue(options) {
    this._init(options);
}
initMixin(Vue); // 给原型上新增_init方法，_init方法中进行Vue的初始化操作
export default Vue;
```
init方法中初始化vue状态
```js
import {initState} from './state';
export function initMixin(Vue){
    Vue.prototype._init = function (options) {
        const vm  = this;
        vm.$options = options
        // 初始化状态
        initState(vm)
    }
}
```
根据不同属性进行初始化操作
```js
export function initState(vm){
    const opts = vm.$options;
    if(opts.props){
        initProps(vm);
    }
    if(opts.methods){
        initMethod(vm);
    }
    if(opts.data){
        // 初始化data
        initData(vm);
    }
    if(opts.computed){
        initComputed(vm);
    }
    if(opts.watch){
        initWatch(vm);
    }
}
function initProps(){}
function initMethod(){}
function initData(){}
function initComputed(){}
function initWatch(){}
```
### 1.初始化数据 --- observe 核心模块
* 目的：对象劫持 —— 当用户改变数据时，希望可以得到通知，然后刷新页面 
* （MVVM模式-数据变化可以驱动视图变化）
* 方法：
* vue2: `es5` 的 `object. defineproperty` 给属性增加get方法和set方法，把 `data` 中的数据都使用 `object. defineproperty` 重新定义.(不能兼容ie8及以下, 所以vue2无法兼容ie8版本)
* 缺点：需要递归解析对象中的属性,依次増加set和get方法。如果数据的层次过多影响性能。
* vue3: `proxy` 性能更好，不需要设置get set, 不需要递归

```js
import {observe} from './observer/index.js'
function initData(vm){
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    observe(data);
}
```
### 2.递归属性劫持
```js
class Observer { // 观测值
    constructor(value){
        this.walk(value);
    }
    walk(data){ // 让对象上的所有属性依次进行观测
        let keys = Object.keys(data);
        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            let value = data[key];
            defineReactive(data,key,value);
        }
    }
}
function defineReactive(data,key,value){
    observe(value);
    Object.defineProperty(data,key,{
        get(){
            return value
        },
        set(newValue){
            if(newValue == value) return;
            observe(newValue);
            value = newValue
        }
    })
}
export function observe(data) {
    if(typeof data !== 'object' || data == null){
        return;
    }
    return new Observer(data);
}
```
### 3.数组方法的劫持
```js
import {arrayMethods} from './array';
class Observer { // 观测值
    constructor(value){
        if(Array.isArray(value)){
            value.__proto__ = arrayMethods; // 重写数组原型方法
            this.observeArray(value);
        }else{
            this.walk(value);
        }
    }
    observeArray(value){
        for(let i = 0 ; i < value.length ;i ++){
            observe(value[i]);
        }
    }
}
```
重写数组原型方法
```js
let oldArrayProtoMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrayProtoMethods);
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
];
methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        const result = oldArrayProtoMethods[method].apply(this, args);
        const ob = this.__ob__;
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2)
            default:
                break;
        }
        if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测
        return result
    }
})
```
增加__ob__属性
```js
class Observer { 
    constructor(value){
        Object.defineProperty(value,'__ob__',{
            enumerable:false,
            configurable:false,
            value:this
        });
        // ...
    }
 }
 ```
给所有响应式数据增加标识，并且可以在响应式上获取Observer实例上的方法

### 4.数据代理
```js
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
function initData(vm){
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    for(let key in data){ // 将_data上的属性全部代理给vm实例
        proxy(vm,'_data',key)
    }
    observe(data);
}
```