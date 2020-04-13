const props = PropertiesService.getScriptProperties();

// https://medium.com/javascript-scene/reduce-composing-software-fe22f0c39a1d
function pipe(init: any, ...fns: ((x: any) => any)[]) {
  return fns.reduce((v, f) => f(v), init);
}
