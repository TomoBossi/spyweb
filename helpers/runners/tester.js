import CodeRunner from "../CodeRunner.js";
import * as editor from "../editor.js";

let tester = new CodeRunner({
  preInitHook: (_) => {},
  postInitHook: (_) => [],
  preRunHook: () => {},
  postRunHook: (output, _) => console.log(output.data)
});

export const preTestPrologue = `\n
RESERVEDIMPORTNAMEARRAY = ["sys", "io", "RESERVEDINSPECTEMPTY", "RESERVEDIMPORTNAMEARRAY", "RESERVEDINSPECTSIGNATURE", "RESERVEDINSPECTGETFILE", "RESERVEDINSPECTISMODULE", "RESERVEDINSPECTGETMODULE", "RESERVEDOUTPUTDICTIONARY"]
from inspect import Parameter as RESERVEDINSPECTEMPTY, signature as RESERVEDINSPECTSIGNATURE, getfile as RESERVEDINSPECTGETFILE, ismodule as RESERVEDINSPECTISMODULE, getmodule as RESERVEDINSPECTGETMODULE
RESERVEDINSPECTEMPTY = RESERVEDINSPECTEMPTY.empty
\n`

export const preTestEpilogue = `\n
RESERVEDOUTPUTDICTIONARY = {"local_functions": {}, "imports": {"partial_imports": {}, "true_imports": []}}
for (name, obj) in [(k, v) for k, v in locals().items()]:
  if name not in RESERVEDIMPORTNAMEARRAY:
    if callable(obj):
      try:
        if RESERVEDINSPECTGETFILE(obj) == "<exec>":
          RESERVEDOUTPUTDICTIONARY["local_functions"][name] = {
            "parameters": [parameter for parameter, _ in RESERVEDINSPECTSIGNATURE(obj).parameters.items()], 
            "parameters_literal": str(RESERVEDINSPECTSIGNATURE(obj))
          }
        else:
          raise(TypeError)
      except:
        if RESERVEDINSPECTGETMODULE(obj).__name__ in RESERVEDOUTPUTDICTIONARY["imports"]["partial_imports"]:
          RESERVEDOUTPUTDICTIONARY["imports"]["partial_imports"][RESERVEDINSPECTGETMODULE(obj).__name__].append(f"{obj.__name__} as {name}")
        else:
          RESERVEDOUTPUTDICTIONARY["imports"]["partial_imports"][RESERVEDINSPECTGETMODULE(obj).__name__] = [f"{obj.__name__} as {name}"]
    elif RESERVEDINSPECTISMODULE(obj):
      RESERVEDOUTPUTDICTIONARY["imports"]["true_imports"].append(f"{obj.__name__} as {name}")
sys.stdout = io.StringIO()
print(RESERVEDOUTPUTDICTIONARY)
\n`

export function getFunctions(python) {
  tester.run(preTestPrologue + python + preTestEpilogue);
}