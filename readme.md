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
## 三.模板编译：将template编译成render函数
- 1.正则解析（起始）标签、属性、文本内容、结束标签，等待分别处理：（核心方法：parseHTML）
- 2.基于上面的解析，生成ast语法树：（核心思路：stack先进后出后进先出）
    - ast语法树：用对象描述js原生语法的
    - 虚拟dom：用对象描述dom节点的
- 3.根据ast语法树，生成render函数的结果：(核心方法generate)
    - let code = generate(root)
    - `render(){
   return _c('div',{style:{color:'red'}},_v('hello'+_s(name)),_c('span',undefined,''))
}`
- 4.最后生成`render`函数

```html
<div id="app">
    <span>hello</span>
</div>
```
```js
// ast语法树
let root = {
    tag: 'div',
    attrs: [{name: 'id', value: 'app'}],
    parent: null,
    type:1,
    children: [
        {
            tag: 'p',
            attrs: [],
            parent: root,
            children: [
                {
                    text: 'hello',
                    type: 3
                }
            ]
        }
    ]
}
// 虚拟dom
let virtualdom = {
  tag: "div",
  type: 1,
  children: [
    {
      tag: "span",
      type: 1,
      attrs: [],
      parent: "div对象",
    },
  ],
  attrs: [
    {
      name: "zf",
      age: 10,
    },
  ],
  parent: null,
}
```
p.s.
- vue1.0: 纯字符串编译，正则转换
- vue2.0: 虚拟dom，可以dom-diff操作

直接上代码
```js
// init.js
  import {initState} from './state'
+ import {compileToFunctions} from './compiler/index'
+ 
  export function initMixin (Vue) {
    Vue.prototype._init = function(options) {
      const vm = this
      this.$options = options
+     // 初始化状态
+     initState(vm);
+ 
+     // 页面挂载
+     if (vm.$options.el) {
+     	vm.$mount(vm.$options.el);
+     }
+   }
+   Vue.prototype.$mount = function(el) {
+     const vm = this
+     const options = this.$options
+     el = document.querySelector(el)
+ 
+     // 如果没有render方法,将template编译成render函数
+     if(!options.render) {
+       let template = options.template
+       if(!template && el) {
+         template = el.outerHTML
+       }
+       const render = compileToFunctions(template);
+       options.render = render;
+     }
    }
  }
```

```js
// compiler/parser-html.js
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
let root;
let currentParent;
let stack = [];
const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;

function createASTElement(tagName, attrs) {
  return {
    tag: tagName,
    type: ELEMENT_TYPE,
    children: [],
    attrs,
    parent: null,
  };
}
function start(tagName, attrs) {
  console.log(`开始${tagName}标签，attrs是`);
  console.log(attrs);
  let element = createASTElement(tagName, attrs);
  if (!root) {
    root = element;
  }
  currentParent = element;
  stack.push(element);
}
function end(tagName) {
  console.log(`结束${tagName}标签`);
  let element = stack.pop();
  currentParent = stack[stack.length - 1];
  if (currentParent) {
    element.parent = currentParent;
    currentParent.children.push(element);
  }
}
function chars(text) {
  console.log(`文本是${text}`);
  text = text.replace(/\s/g, "");
  if (text) {
    currentParent.children.push({
      type: TEXT_TYPE,
      text,
    });
  }
}
function parseHTML(html) {
  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd == 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      chars(text);
    }
  }
  // 前进n个
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      // 将标签删除
      advance(start[0].length);
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length); // 将属性删除
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
      }
      if (end) {
        // 去掉开始标签的 >
        advance(end[0].length);
        return match;
      }
    }
  }
}

export function compileToFunctions(template) {
  parseHTML(template);

  function gen(node) {
    if (node.type == 1) {
      return generate(node);
    } else {
      let text = node.text;
      if (!defaultTagRE.test(text)) {
        return `_v(${JSON.stringify(text)})`;
      }
      let lastIndex = (defaultTagRE.lastIndex = 0);
      let tokens = [];
      let match, index;

      while ((match = defaultTagRE.exec(text))) {
        index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
  function getChildren(el) {
    // 生成儿子节点
    const children = el.children;
    if (children) {
      const res = `${children.map((c) => gen(c)).join(",")}`;
      return res;
    } else {
      return false;
    }
  }
  function genProps(attrs) {
    // 生成属性
    let str = "";
    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];
      if (attr.name === "style") {
        let obj = {};
        attr.value.split(";").forEach((item) => {
          let [key, value] = item.split(":");
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0, -1)}}`;
  }
  function generate(el) {
    let children = getChildren(el);
    let code = `_c('${el.tag}',${
      el.attrs.length ? `${genProps(el.attrs)}` : "undefined"
    }${children ? `,${children}` : ""})`;
    return code;
  }
  let code = generate(root);
  let render = `with(this){return ${code}}`;
  let renderFn = new Function(render);
  return renderFn;
}
```
## 四.创建渲染watcher

- Watcher就是用来渲染的
`vm._render` 通过解析的`render`方法渲染出虚拟`dom`
`vm._update` 通过虚拟`dom`创建真实的`dom`

1)将 template模版转换成ast语法树(compile编译)->生成 render方法->生成虚拟dom->真实的dom 
重新生成虚拟dom->更新dom

先调用_render方法生成虚拟dom,通过_update方法将虚拟dom创建成真实的dom

### 1.初始化渲染Watcher
```js
// init.js
import {mountComponent} from './lifecycle'
Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    // 如果没有render方法
    if (!options.render) {
        let template = options.template;
        // 如果没有模板但是有el
        if (!template && el) {
            template = el.outerHTML;
        }

        const render= compileToFunctions(template);
        options.render = render;
    }
    mountComponent(vm,el);
}
```
```js
// lifecycle.js
export function lifecycleMixin() {
    Vue.prototype._update = function (vnode) {}
}
export function mountComponent(vm, el) {
    vm.$el = el;
    let updateComponent = () => {
        // 将虚拟节点 渲染到页面上
        vm._update(vm._render());
    }
    new Watcher(vm, updateComponent, () => {}, true);
}
```
```js
// render.js
export function renderMixin(Vue){
    Vue.prototype._render = function () {}
}
```
```js
// watcher.js
let id = 0;
class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        if (typeof exprOrFn == 'function') {
            this.getter = exprOrFn;
        }
        this.cb = cb;
        this.options = options;
        this.id = id++;
        this.get();
    }
    get() {
        this.getter();
    }
}
export default Watcher;
```

### 2.生成虚拟dom
```js
// render.js
import {createTextNode,createElement} from './vdom/create-element'
export function renderMixin(Vue){
    Vue.prototype._v = function (text) { // 创建文本
        return createTextNode(text);
    }
    Vue.prototype._c = function () { // 创建元素
        return createElement(...arguments);
    }
    Vue.prototype._s = function (val) {
        return val == null? '' : (typeof val === 'object'?JSON.stringify(val):val);
    }
    Vue.prototype._render = function () {
        const vm = this;
        const {render} = vm.$options;
        let vnode = render.call(vm);
        return vnode;
    }
}
```
```js
// 创建虚拟节点
export function createTextNode(text) {
    return vnode(undefined,undefined,undefined,undefined,text)
}
export function createElement(tag,data={},...children){
    let key = data.key;
    if(key){
        delete data.key;
    }
    return vnode(tag,data,key,children);
}
function vnode(tag,data,key,children,text){
    return {
        tag,
        data,
        key,
        children,
        text
    }
}
```
### 3.生成真实DOM元素
```js
// 将虚拟节点渲染成真实节点
import {patch} './observer/patch'
export function lifecycleMixin(Vue){
    Vue.prototype._update = function (vnode) {
        const vm = this;
        vm.$el = patch(vm.$el,vnode);
    }
}
export function patch(oldVnode,vnode){
    const isRealElement = oldVnode.nodeType;
    if(isRealElement){
        const oldElm = oldVnode;
        const parentElm = oldElm.parentNode;
        
        let el = createElm(vnode);
        parentElm.insertBefore(el,oldElm.nextSibling);
        parentElm.removeChild(oldVnode)
   		return el;
    } 
}
function createElm(vnode){
    let {tag,children,key,data,text} = vnode;
    if(typeof tag === 'string'){
        vnode.el = document.createElement(tag);
        updateProperties(vnode);
        children.forEach(child => { 
            return vnode.el.appendChild(createElm(child));
        });
    }else{
        vnode.el = document.createTextNode(text);
    }
    return vnode.el
}
function updateProperties(vnode){
    let newProps = vnode.data || {}; // 获取当前老节点中的属性 
    let el = vnode.el; // 当前的真实节点
    for(let key in newProps){
        if(key === 'style'){ 
            for(let styleName in newProps.style){
                el.style[styleName] = newProps.style[styleName]
            }
        }else if(key === 'class'){
            el.className= newProps.class
        }else{ // 给这个元素添加属性 值就是对应的值
            el.setAttribute(key,newProps[key]);
        }
    }
}
```
nextTick方法就是对异步方法对封装，优雅降级