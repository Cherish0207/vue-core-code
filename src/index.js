import { initMixin, stateMixin } from "./init.js";
import { lifecycleMixin } from "./lifecycle.js";
import { renderMixin } from "./render.js";
import { initGlobalAPI } from "./initGlobalApi/index";
import { compileToFunction } from "./compiler/index.js";
import { patch, createElm } from "./utils/patch";
function Vue(options) {
  this._init(options);
}
initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
initGlobalAPI(Vue);
stateMixin(Vue);

// 1.创建第一个虚拟节点
let vm1 = new Vue({ data: { name: "zf" } });
let render1 = compileToFunction(`
<ul>
<li style="background: red" >aa</li>
<li style="background: blue" >bb</li>
<li style="background: green" >cc</li>
</ul>`, vm1);
console.log(render1);
let oldVnode = render1.call(vm1);
// 2.创建第二个虚拟节点
let vm2 = new Vue({ data: { name: "jw" } });
let render2 = compileToFunction(`
<ul>
<li style="background: skyblue" >ff</li>
<li style="background: orange" >ee</li>
<li style="background: pink" >dd</li>
<li style="background: red" >aa</li>
<li style="background: blue" >bb</li>
<li style="background: green" >cc</li>
</ul>`, vm2);
console.log(render2);
let newVnode = render2.call(vm2);
// 3.通过第一个虚拟节点做首次渲染
document.body.appendChild(createElm(oldVnode));
// 4.调用patch方法进行对比操作
// console.log(oldVnode, newVnode);
setTimeout(() => {
  patch(oldVnode, newVnode);
}, 5000)

export default Vue;
