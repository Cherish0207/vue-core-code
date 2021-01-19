import parseHTML from "./parser-html";
import generate from "./generate";

export function compileToFunction(template) {
  let root = parseHTML(template);
  let code = generate(root);
  let render = `with(this){return ${code}}`;
  let renderFn = new Function(render);
  return renderFn;
}
