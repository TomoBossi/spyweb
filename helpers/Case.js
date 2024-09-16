import { data } from "./shared.js";
import { defaults } from "../text.js";

export default class Case {
  constructor(kwargs) {
    this.status = 0; // -1: error, 0: never ran, 1: success, 2: running/queued
    this.label = kwargs.label; // short description of the test
    this.python = kwargs.python; // test code snippet (string literal)
    this.repeat = kwargs.repeat; // 1: runs only once, n; n > 1: runs n times
    this.timeout = kwargs.timeout; // total allowed time in ms for all <repeat> iterations
  }

  generate(groupIndex, caseIndex) {
    return `
${data.testResult} = True
print('\\t- "${this.label}"')
for ${data.i} in range(${this.repeat}):
  try:
    ${data.lineno} = ${data.getframeinfo}(${data.currentframe}()).lineno
    ${this.python.split("\n").filter(line => !/^\s*$/.test(line)).join("\n    ")}
  except Exception as e:
    ${data.testResult} = False
    if ${this.repeat}:
      print(f"\\t\\t${defaults.testerErrorMessageRepetition(data.i)}\\n")
    else:
      print(f"\\t\\t${defaults.testerErrorMessage(data.i)}\\n")
    ${data.lineno} = ${data.extractTb}(e.__traceback__)[0].lineno - ${data.lineno} - 1
    for ${data.j}, line in enumerate([${this.python.split("\n").filter(line => !/^\s*$/.test(line)).map(line => line = `"\\t\\t${line}"`)}]):
      print(line, end = "\\n" if ${data.j} != ${data.lineno} else f" <- {'${defaults.testerBlameErrorMessage(null)}' if not (type(e).__name__ == 'AssertionError') else '${defaults.testerBlameErrorMessageAssert(null)}'}\\n")
    print(f"\\t\\t---\\n\\t\\t{type(e).__name__}{f': {e}' if not (type(e).__name__ == 'AssertionError') else ''}\\n")
    break
${data.testStatus}[${groupIndex}][${caseIndex}] = 1 if ${data.testResult} else -1
if ${data.testResult}:
  print(f"\\t\\t${defaults.testerSuccessMessage(null)}\\n")`
  }
}