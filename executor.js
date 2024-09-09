importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

async function load() {
  self.pyodide = await loadPyodide();
}

function parsedErrorMessage(e, python) {
  let message = "";
  let index = 0;
  let logging = false;
  let depth = 0;
  let file;
  let lineNumber;
  let submodule;
  let lineContent;
  const lines = e.message.split("\n");
  for (let [i, line] of lines.entries()) {
    [_, file, lineNumber, submodule] = line.match(/File "(\S+)", line (\d+), in (\S+)/) || [];
    if (lineNumber !== undefined) {
      if (file === "<exec>") {
        logging = true;
        lineContent = python.split("\n")[lineNumber - 1].trim();
        if (submodule === "<module>") {
          message += "\t".repeat(depth) + `Error en la linea ${lineNumber} de este archivo: ${lineContent}\n`;
        } else {
          message += "\t".repeat(depth) + `Error en la linea ${lineNumber} de este archivo, en "${submodule}": ${lineContent}\n`;
        }
      } else if (logging) {
        message += "\t".repeat(depth) + `Error en el archivo "${file}", en "${submodule}"\n`;
      }
      index = i;

      if (logging) {
        depth += 1;
      }
    }
  }
  return message + "\n" + lines.slice(index + 1).join("\n");
}

let pyodideReadyPromise = load();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const python = event.data;
  if (python === null) {
    self.postMessage(null);
  } else {
    let output = "";
    self.pyodide.globals.set("print", (s) => (output += String(s) + "\n"));
    try {
      await pyodide.loadPackagesFromImports(python);
      const { _, error } = await pyodide.runPythonAsync(python);
      if (error) {
        self.postMessage(output + error);
      } else {
        self.postMessage(output);
      }
    } catch (e) {
      self.postMessage(output + parsedErrorMessage(e, python));
    }
  }
};
