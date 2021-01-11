二.今日内容
- vue的生命周期的实现原理?
- Mixin的实现原理(掌握 mixin能倣些什么?)
- Vue中的依赖收集是如何实现的? 
- vue中是如何实现异步更新数据? 
- vue的组件系统如何实现的?

三.手写Vue其他特性
前两周
- watch的实现原理及 computed的实现原理 
- vue中的Dow-DIFF的原理
- 实现vue中的插件机制vue,use/vue. install(源码剖析)
- 5月3日会讲一天vue核心应用
第三周
- 5月6日和8日讲解 Vuerouter 和 vuex 原理
- 5月10日单元测试及手写 VUESSR
第四周
- 5月13日和5月15日 组件库搭建及自己的组件库使用
- 5月17日vue3.0向应式原理及 vue3.0 使用
第五周
・5月20日和5月22日讲解Vue项目 element-ui+vue全家桶+koa+ mongo+ docker部署

strats:
{
  'beforeCreate': mergeHook,
  'created': mergeHook,
  'beforeMount': mergeHook,
  'mounted': mergeHook,
  'beforeUpdate': mergeHook,
  'updated': mergeHook,
  'beforeDestroy': mergeHook,
  'destroyed': mergeHook,
}