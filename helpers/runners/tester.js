import CodeRunner from "../CodeRunner.js";

export let result;

const globals = "RESERVEDGLOBALSARRAY";
const imports = "RESERVEDIMPORTNAMEARRAY";
const objects = "RESERVEDIMPORTANTOBJECTSDICTIONARY";
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

const preTestPrologue = `\n
${globals} = ["__builtins__", "__doc__", "${globals}", "${imports}", "${objects}"]
${imports} = ["sys", "io", "${empty}", "${signature}", "${getfile}", "${ismodule}", "${getmodule}", "${objects}"]
from inspect import Parameter as ${empty}, signature as ${signature}, getfile as ${getfile}, ismodule as ${ismodule}, getmodule as ${getmodule}
${empty} = ${empty}.empty
\n`;

const preTestEpilogue = `\n
${objects} = {"local_functions": {}, "imports": {"partial_imports": {}, "true_imports": []}, "objects": []}
for (${name}, ${obj}) in [(${k}, ${v}) for ${k}, ${v} in globals().items()]:
  if ${name} not in ${imports}:
    if callable(${obj}):
      try:
        if ${getfile}(${obj}) == "<exec>":
          ${objects}["local_functions"][${name}] = {
            "parameters": [${p} for ${p}, _ in ${signature}(${obj}).parameters.items()], 
            "parameters_literal": str(${signature}(${obj}))
          }
          ${objects}["objects"].append(${name})
        else:
          raise(TypeError)
      except:
        if ${getmodule}(${obj}).__name__ in ${objects}["imports"]["partial_imports"]:
          ${objects}["imports"]["partial_imports"][${getmodule}(${obj}).__name__].append(f"{${obj}.__name__} as {${name}}")
        else:
          ${objects}["imports"]["partial_imports"][${getmodule}(${obj}).__name__] = [f"{${obj}.__name__} as {${name}}"]
        ${objects}["objects"].append(${name})
    elif ${ismodule}(${obj}):
      ${objects}["imports"]["true_imports"].append(f"{${obj}.__name__} as {${name}}")
      ${objects}["objects"].append(${name})
for ${name} in [${k} for ${k} in globals()]:
  if ${name} not in ${globals} + ${imports} + ${objects}["objects"]:
    del globals()[${name}]
sys.stdout = io.StringIO() # clear stdout (output)
\n`;

let tester = new CodeRunner({
  async: true,
  preInitHook: (_) => {},
  postInitHook: (_) => {},
  preRunHook: () => {},
  postRunHook: (output, _) => result = output.data
});

export function run(python, test) {
  tester.run(preTestPrologue);
  tester.run(`${python}\n${preTestEpilogue}\n${test}\n`, false, true);
}