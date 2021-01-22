export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    console.log(oldVnode, vnode);
    return createElm(vnode);
  }
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const oldElm = oldVnode;
    const parentElm = oldElm.parentNode;

    let el = createElm(vnode);
    parentElm.insertBefore(el, oldElm.nextSibling);
    parentElm.removeChild(oldVnode);
    return el;
  } else {
    // 1.如果标签不一致说明是两个不同元素
    if (oldVnode.tag !== vnode.tag) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }
    // 2.如果标签一致但是不存在则是文本节点
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        return (oldVnode.el.textContent = vnode.text);
      }
    }
    // 复用标签,并且更新属性
    let el = (vnode.el = oldVnode.el);
    updateProperties(vnode, oldVnode.data);
    // 3.比较孩子节点
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];
    // 新老都有需要比对儿子
    if (oldChildren.length > 0 && newChildren.length > 0) {
      updateChildren(el, oldChildren, newChildren);
    } else if (oldChildren.length > 0) {
      el.innerHTML = ""; // 老的有儿子新的没有清空即可
    } else if (newChildren.length > 0) {
      newChildren.forEach((child) => el.appendChild(createElm(child))); // 新的有儿子
    }
  }
}
function isSameVnode(oldVnode, newVnode) {
  // 如果两个人的标签和key 一样我认为是同一个节点 虚拟节点一样我就可以复用真实节点了
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
function updateChildren(parent, oldChildren, newChildren) {
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 优化向后追加逻辑
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
      // 优化向前追加逻辑
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode); // 比较孩子
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } // 头移动到尾部
    else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
      // 尾部移动到头部
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else {
      let map = makeIndexByKey(oldChildren);
      let moveIndex = map[newStartVnode.key];
      if (moveIndex == undefined) {
        // 老的中没有将新元素插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        // 有的话做移动操作
        let moveVnode = oldChildren[moveIndex];
        oldChildren[moveIndex] = undefined;
        parent.insertBefore(moveVnode.el, oldStartVnode.el);
        patch(moveVnode, newStartVnode);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let ele =
        newChildren[newEndIndex + 1] == null
          ? null
          : newChildren[newEndIndex + 1].el;
      parent.insertBefore(createElm(newChildren[i]), ele);
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i];
      if (child != undefined) {
        parent.removeChild(child.el);
      }
    }
  }
}
export function createElm(vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag === "string") {
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }
    vnode.el = document.createElement(tag);
    updateProperties(vnode);
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }
  if (vnode.componentInstance) {
    return true;
  }
}
function makeIndexByKey(children) {
  let map = {};
  children.forEach((item, index) => {
    map[item.key] = index;
  });
  return map;
}
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {};
  let el = vnode.el;
  // 比对样式
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 删除多余属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }
  for (let key in newProps) {
    if (key === "style") {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}
