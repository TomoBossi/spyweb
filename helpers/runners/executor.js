import CodeRunner from "../CodeRunner.js";
import * as editor from "../editor.js";
import { defaults } from "../../text.js";

let executor = new CodeRunner({

  async: false,

  preInitHook: (reset) => {
    reset? 
      editor.setOutput(`${defaults.executorResetLoadingMessage}\n`):
    editor.appendOutput(`\n${defaults.executorLoadingMessage}\n`);
    document.getElementById("run").setAttribute("enabled", false);
    document.getElementById("reset").setAttribute("enabled", false);
  },

  postInitHook: (_) => {
    editor.appendOutput(`${defaults.executorLoadedSuccessfullyMessage}\n`);
    document.getElementById("run").setAttribute("enabled", true);
    document.getElementById("reset").setAttribute("enabled", true);
  },

  preRunHook: () => {
    editor.setOutput("");
    document.getElementById("run").setAttribute("enabled", "false");
  },

  postRunHook: (output, duration) => {
    editor.setOutput(output);
    editor.appendOutput(`${output === ""?"":"\n"}${defaults.executionDurationMessage(duration)}\n`);
    editor.scrollOutput();
    document.getElementById("run").setAttribute("enabled", "true");
  },

  postGetHook: null,

  storage: {}
});

export default executor;
