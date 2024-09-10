importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

const maxOutputSize = 1000;
let pyodideReadyPromise = load();

async function load() {
  self.pyodide = await loadPyodide();
}

function parsedErrorMessage(e, python) {
  let logging = false;
  let message = "";
  let index = 0;
  let depth = 0;
  let file;
  let lineNumber;
  let submodule;
  let lineContent;
  const lines = e.message.split("\n");
  for (let [i, line] of lines.entries()) {
    [_, file, lineNumber] = line.match(/File "(\S+)", line (\d+)/) || [];
    [_, submodule] = line.match(/, in (\S+)/) || [];
    if (lineNumber !== undefined) {
      if (file === "<exec>") {
        logging = true;
        lineContent = python.split("\n")[lineNumber - 1].trim();
        if (submodule === "<module>" || submodule === undefined) {
          message += "\t".repeat(depth) + `Error en este archivo, linea ${lineNumber}: ${lineContent}\n`;
        } else {
          message += "\t".repeat(depth) + `Error en este archivo, linea ${lineNumber}, en "${submodule}": ${lineContent}\n`;
        }
      } else if (logging) {
        message += "\t".repeat(depth) + `Error en el archivo "${file}", en "${submodule}"\n`;
      }
      if (logging) {
        index = i;
        depth += 1;
      }
    }
  }
  return message + "\n" + lines.slice(index + 1).join("\n");
}

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const python = event.data;
  if (python === null) {
    self.postMessage(null); // Dummy msg to notify main thread
  } else {
    let output = [];
    self.pyodide.globals.set("print", (s) => {
      output.push(...(String(s).split("\n")));
      output = output.slice(-maxOutputSize);
      return output;
    });
    try {
      await pyodide.loadPackagesFromImports(python);
      await pyodide.runPythonAsync(python);
      self.postMessage(output.join("\n") + "\n");
    } catch (e) {
      self.postMessage(output.join("\n") + "\n" + parsedErrorMessage(e, python));
    }
  }
};