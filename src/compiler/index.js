import parseHTML from "./parser-html";
import generate from "./generate";

export function compileToFunctions(template, vm) {
  let root = parseHTML(template);
  let code = generate(root, vm);
  let render = `with(this){return ${code}}`;
  let renderFn = new Function(render);
  return renderFn;
}
