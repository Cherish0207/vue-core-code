var a = `[a-zA-Z_]`
const w = `0-9_a-zA-Z`
const c = `[\\-${w}\.]`
const ac = a+c + '*'
var startTagOpen = new RegExp(`^<((?:${ac}\:)?${ac})`);
var res = '<div style="color:red">hello  <span>{{name}}</span></div>'.match(startTagOpen)
console.log(res);