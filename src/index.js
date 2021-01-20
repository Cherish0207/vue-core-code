import { initMixin, stateMixin } from "./init.js";
import { lifecycleMixin } from "./lifecycle.js";
import { renderMixin } from "./render.js";
import { initGlobalAPI } from "./initGlobalApi/index";
function Vue(options) {
  this._init(options);
}
initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
initGlobalAPI(Vue);
stateMixin(Vue);

export default Vue;
