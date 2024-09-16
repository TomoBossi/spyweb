import CodeRunner from "../CodeRunner.js";
import { data } from "../shared.js";
import * as editor from "../editor.js";

export let tester = new CodeRunner({

  async: true,

  preInitHook: (_) => {},

  postInitHook: (_) => {},

  preRunHook: () => {},

  postRunHook: (output, _) => {}, // TODO append output to test output textarea

  postGetHook: (variable) => {
    if (variable === data.testStatus) {
      tester.storage[data.testStatus] = JSON.parse(tester.storage[data.testStatus]);
      if (true) {} // TODO do what is to be done when statuses are updated, e.g. go to current test suite object and update statuses
    }
  },

  storage: {}
});
