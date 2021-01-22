export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];
const strats = {};
function mergeHook(parentVal, childValue) {
  if (childValue) {
    if (parentVal) {
      return parentVal.concat(childValue);
    } else {
      return [childValue];
    }
  } else {
    return parentVal;
  }
}
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});
function mergeAssets(parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
}
strats.components = mergeAssets;
export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      if (typeof parent[key] == "object" && typeof child[key] == "object") {
        options[key] = {
          ...parent[key],
          ...child[key],
        };
      } else if (child[key]) {
        options[key] = child[key];
      } else {
        options[key] = parent[key];
      }
    }
  }
  return options;
}
