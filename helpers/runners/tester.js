// import CodeRunner from "../CodeRunner.js";
// import * as editor from "../editor.js";

// let tester = new CodeRunner({
//   preInitHook: (reset) => {},
//   postInitHook: (_) => getFunctions(editor.getInput()),
//   preRunHook: () => {},
//   postRunHook: (output, _) => console.log(output.data)
// });

// function getFunctions(python) {
//   tester.run(signatureGetterEpilogue + python + signatureGetterPrologue, true, true);
// }

const preTestPrologue = `
RESERVEDIMPORTNAMEARRAY = ["RESERVEDINSPECTSIGNATURE", "RESERVERINSPECTGETFILE", "RESERVEDINSPECTISMODULE", "RESERVEDINSPECTGETMODULE"]
from inspect import signature as RESERVEDINSPECTSIGNATURE, getfile as RESERVERINSPECTGETFILE, ismodule as RESERVEDINSPECTISMODULE, getmodule as RESERVEDINSPECTGETMODULE
`
const preTestEpilogue = `
RESERVEDOUTPUTDICTIONARY = {"local_functions": {}, "partial_imports": {}, "true_imports": []}
for (name, obj) in [(k, v) for k, v in locals().items()]:
  if name not in RESERVEDIMPORTNAMEARRAY:
    if callable(obj):
      if RESERVERINSPECTGETFILE(obj) == "<exec>":
        RESERVEDOUTPUTDICTIONARY["local_functions"][name] = [name for name, _ in RESERVEDINSPECTSIGNATURE(obj).parameters.items()]
      else:
        if RESERVEDINSPECTGETMODULE(obj).__name__ in RESERVEDOUTPUTDICTIONARY["partial_imports"]:
          RESERVEDOUTPUTDICTIONARY["partial_imports"][RESERVEDINSPECTGETMODULE(obj).__name__].append(f"{obj.__name__} as {name}")
        else:
          RESERVEDOUTPUTDICTIONARY["partial_imports"][RESERVEDINSPECTGETMODULE(obj).__name__] = [f"{obj.__name__} as {name}"]
    elif RESERVEDINSPECTISMODULE(obj):
      RESERVEDOUTPUTDICTIONARY["true_imports"].append(f"{obj.__name__} as {name}")
print(RESERVEDOUTPUTDICTIONARY)
`