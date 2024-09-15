import CodeRunner from "../CodeRunner.js";

export let result;

// afters days of deep thought, this is the best I could come up with
// it fuckign sucks
const globals = "RESERVEDGLOBALSARRAY";
const imports = "RESERVEDIMPORTNAMEARRAY";
const empty = "RESERVEDINSPECTEMPTY";
const signature = "RESERVEDINSPECTSIGNATURE";
const getfile = "RESERVEDINSPECTGETFILE";
const ismodule = "RESERVEDINSPECTISMODULE";
const getmodule = "RESERVEDINSPECTGETMODULE";
const name = "RESERVEDOBJECTNAMEITERATOR";
const obj = "RESERVEDOBJECTITERATOR";
const k = "RESERVEDKEYITERATOR";
const v = "RESERVEDVALUEITERATOR";
const p = "RESERVEDPARAMETERITERATOR";

export const environment = "RESERVEDLOCALENVIRONMENTDICTIONARY";

const prologue = `
${globals} = ["__builtins__", "__doc__", "${globals}", "${imports}", "${environment}"]
${imports} = ["sys", "io", "${empty}", "${signature}", "${getfile}", "${ismodule}", "${getmodule}", "${environment}"]
from inspect import Parameter as ${empty}, signature as ${signature}, getfile as ${getfile}, ismodule as ${ismodule}, getmodule as ${getmodule}
${empty} = ${empty}.empty
`;

const epilogue = `
${environment} = {"local_functions": {}, "imports": {"partial_imports": {}, "true_imports": []}, "names": []}
for (${name}, ${obj}) in [(${k}, ${v}) for ${k}, ${v} in globals().items()]:
  if ${name} not in ${imports}:
    if callable(${obj}):
      try:
        if ${getfile}(${obj}) == "<exec>":
          ${environment}["local_functions"][${name}] = {
            "parameters": [${p} for ${p}, _ in ${signature}(${obj}).parameters.items()], 
            "parameters_literal": str(${signature}(${obj}))
          }
          ${environment}["names"].append(${name})
        else:
          raise(TypeError)
      except:
        if ${getmodule}(${obj}).__name__ in ${environment}["imports"]["partial_imports"]:
          ${environment}["imports"]["partial_imports"][${getmodule}(${obj}).__name__].append(f"{${obj}.__name__} as {${name}}")
        else:
          ${environment}["imports"]["partial_imports"][${getmodule}(${obj}).__name__] = [f"{${obj}.__name__} as {${name}}"]
        ${environment}["names"].append(${name})
    elif ${ismodule}(${obj}):
      ${environment}["imports"]["true_imports"].append(f"{${obj}.__name__} as {${name}}")
      ${environment}["names"].append(${name})
for ${name} in [${k} for ${k} in globals()]:
  if ${name} not in ${globals} + ${imports} + ${environment}["names"]:
    del globals()[${name}]
sys.stdout = io.StringIO() # clear stdout (output)
`;

let tester = new CodeRunner({
  async: true,
  preInitHook: (_) => {},
  postInitHook: (_) => {},
  preRunHook: () => {},
  postRunHook: (output, _) => result = output.data
});

export function run(python, test) {
  // ran separately so that error message line numbers match editor code
  tester.run(prologue);
  tester.run(`${python}\n${epilogue}\n${test}\n`, false, true);
}