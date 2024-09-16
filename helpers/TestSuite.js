import CaseGroup from "./CaseGroup.js";
import Case from "./Case.js";
import { data } from "./shared.js";

/*
Test Suite definition kwargs structure
kwargs = {
  label: <label>,             // Required
  caseGroups: [               // Required (at least one)
    {
      label: <"label">,       // Required, should be unique
      cases: [                // Required (at least one)
        {
          label: <"label">,   // Required
          setup: <`setup`>,   // Optional, defaults to `` if omitted
          python: <`python`>, // Required
          repeat: <repeat>,   // Optional, defaults to 1 (single execution) if omitted
          timeout: <timeout>  // Optional, defaults to 1000 (one whole second!) if omitted
        }, ...
      ]
    }, ...
  ]
};
*/

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

export default class TestSuite {
  constructor(kwargs) {
    this.status = 0; // -1: error, 0: never ran, 1: success, 2: running/queued
    this.label = kwargs.label; // name of the test suite, e.g. the name of the task or problem
    this.caseGroups = [];
    for (let cg of kwargs.caseGroups) {
      let cgKwargs = {
        label: cg.label,
        cases: []
      };
      for (let c of cg.cases) {
        let cKwargs = {
          label: c.label,
          python: c.python,
          setup: c.setup || ``,
          repeat: c.repeat || 1,
          timeout: c.timeout || 1000
        };
        cgKwargs.cases.push(new Case(cKwargs));
      }
      this.caseGroups.push(new CaseGroup(cgKwargs));
    }
  }

  resetStatus() {
    this.status = 0;
    for (let cg of this.caseGroups) {
      cg.status = 0;
      for (let c of cg) {
        c.status = 0;
      }
    }
  }

  resetPython(python, runner) {
    runner.run(prologue);
    runner.run(`${python}\n${epilogue}\n`, false);
  }

  testCaseGroup(runner, caseGroupIndex, targets = [], python = "", reset = false) {
    if (reset) {
      this.resetPython(python, runner);
    }
    tester.run(`print("> ${this.caseGroups[caseGroupIndex].label}\\n")`, false, true);
    for (let [i, c] of this.caseGroups[caseGroupIndex].cases.entries()) {
      if (targets.length == 0 || targets.includes(i)) {
        runner.run(c.generate(caseGroupIndex, i), false, true, c.timeout);
        runner.get(data.testStatus);
      }
    }
  }

  testSuite(runner, python = "", reset = false) {
    if (reset) {
      this.resetPython(python, runner);
    }
    for (let [i, _] of this.caseGroups) {
      this.testCaseGroup(runner, i)
    }
  }
}
