import CodeRunner from "../CodeRunner.js";
import Case from "../Case.js";
import { data } from "../shared.js";
import * as editor from "../editor.js";
import CaseGroup from "../CaseGroup.js";

// afters days of deep thought, this is the best I could come up with
// it fuckign sucks
const prologue = `
${data.globals} = ["__builtins__", "__doc__", "${data.globals}", "${data.imports}", "${data.getOutput}", "${data.environment}"]
${data.imports} = ["sys", "io", "${data.empty}", "${data.signature}", "${data.getfile}", "${data.ismodule}", "${data.getmodule}", "${data.getframeinfo}", "${data.currentframe}", "${data.extractTb}", "${data.environment}"]
from inspect import Parameter as ${data.empty}, signature as ${data.signature}, getfile as ${data.getfile}, ismodule as ${data.ismodule}, getmodule as ${data.getmodule}, getframeinfo as ${data.getframeinfo}, currentframe as ${data.currentframe}
from traceback import extract_tb as ${data.extractTb}
${data.empty} = ${data.empty}.empty
`;

const epilogue = `
${data.environment} = {"local_functions": {}, "imports": {"partial_imports": {}, "true_imports": []}, "names": []}
for (${data.name}, ${data.obj}) in [(${data.k}, ${data.v}) for ${data.k}, ${data.v} in globals().items()]:
  if ${data.name} not in ${data.imports}:
    if callable(${data.obj}):
      try:
        if ${data.getfile}(${data.obj}) == "<exec>":
          ${data.environment}["local_functions"][${data.name}] = {
            "parameters": [${data.p} for ${data.p}, _ in ${data.signature}(${data.obj}).parameters.items()], 
            "parameters_literal": str(${data.signature}(${data.obj}))
          }
          ${data.environment}["names"].append(${data.name})
        else:
          raise(TypeError)
      except:
        if ${data.getmodule}(${data.obj}).__name__ in ${data.environment}["imports"]["partial_imports"]:
          ${data.environment}["imports"]["partial_imports"][${data.getmodule}(${data.obj}).__name__].append(f"{${data.obj}.__name__} as {${data.name}}")
        else:
          ${data.environment}["imports"]["partial_imports"][${data.getmodule}(${data.obj}).__name__] = [f"{${data.obj}.__name__} as {${data.name}}"]
        ${data.environment}["names"].append(${data.name})
    elif ${data.ismodule}(${data.obj}):
      ${data.environment}["imports"]["true_imports"].append(f"{${data.obj}.__name__} as {${data.name}}")
      ${data.environment}["names"].append(${data.name})
for ${data.name} in [${data.k} for ${data.k} in globals()]:
  if ${data.name} not in ${data.globals} + ${data.imports} + ${data.environment}["names"]:
    del globals()[${data.name}]
${data.testStatus} = []
for ${data.k} in [${data.testSuiteDimension}]:
  ${data.testStatus}.append([0]*${data.k}) # init test status array (Source of Truth)
sys.stdout = io.StringIO() # clear stdout (output)
`;

export let tester = new CodeRunner({

  async: true,

  preInitHook: (_) => {},

  postInitHook: (_) => {},

  preRunHook: () => {},

  postRunHook: (output, _) => {
    // TODO append output to test output textarea
  },

  postGetHook: (variable) => {
    if (variable === data.testStatus) {
      tester.storage[data.testStatus] = JSON.parse(tester.storage[data.testStatus]);
      if (true) {}
      // TODO do what is to be done when statuses are updated
    }
  },

  storage: {}
});

export function testCaseGroup(python, caseGroup, targets = [], reset = false) {
  if (reset) {
    tester.run(prologue);
    tester.run(`${python}\n${epilogue}\n`, false);
  }
  tester.run(`print("> ${caseGroup.label}\\n")`, false, true);
  for (let [i, c] of caseGroup.cases.entries()) {
    if (targets.length == 0 || targets.includes(i)) {
      tester.run(c.generate(caseGroup.index, i), false, true);
      tester.get(data.testStatus);
    }
  }
  // if (<all success>) { .every(Boolean) // TODO
    // tester.run(`print("> ${caseGroup.label}\\n")`, false, true);
  // }
}

// Demo
export let testCase = new Case({
  repeat: 100,
  label: "Los dados del cubilete tienen caras entre 1 y 6",
  python: `
cubilete = tirar_cubilete()
for indice in range(len(cubilete)):
  assert(1 <= cubilete[indice] <= 6)
  `
});

export let testCaseGroup = new CaseGroup({
  index: 0,
  label: "tirar_cubilete()",
  cases: [testCase]
});