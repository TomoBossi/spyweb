import CodeRunner from "../CodeRunner.js";
import * as editor from "../editor.js";

let executor = new CodeRunner({

  preInitHook: (reset) => {
    reset? 
      editor.setOutput("Reiniciando ejecutor...\n"):
    editor.appendOutput("\nIniciando ejecutor...\n");
    document.getElementById("run").setAttribute("enabled", false);
    document.getElementById("reset").setAttribute("enabled", false);
  },

  postInitHook: (_) => {
    editor.appendOutput("Ejecutor iniciado con éxito :D\n");
    document.getElementById("run").setAttribute("enabled", true);
    document.getElementById("reset").setAttribute("enabled", true);
  },

  preRunHook: () => {
    editor.setOutput("");
    document.getElementById("run").setAttribute("enabled", "false");
  },

  postRunHook: (output, duration) => {
    if (output.data) {
      editor.setOutput(output.data);
      editor.appendOutput(`\nEjecutado en ${duration.toFixed(3)} segundos\n`);
      editor.scrollOutput();
    }
    document.getElementById("run").setAttribute("enabled", "true");
  }
});

export default executor;