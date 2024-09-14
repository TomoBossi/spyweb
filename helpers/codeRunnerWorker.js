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
          message +=
            "\t".repeat(depth) +
            `Error en este archivo, linea ${lineNumber}: ${lineContent}\n`;
        } else {
          message +=
            "\t".repeat(depth) +
            `Error en este archivo, linea ${lineNumber}, en "${submodule}": ${lineContent}\n`;
        }
      } else if (logging) {
        message +=
          "\t".repeat(depth) +
          `Error en el archivo "${file}", en "${submodule}"\n`;
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
  const [ python, clear ] = event.data;
  if (python === null) {
    self.postMessage(null); // Dummy msg to notify caller on initialization
  } else {
    let output = "";
    try {
      if (clear) {
        pyodide.runPython("globals().clear()\n");
      }

      pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
      `);

      await pyodide.loadPackagesFromImports(python);
      pyodide.runPython(python);

      if (output === "") {
        output = pyodide.runPython("sys.stdout.getvalue()");
      }

      self.postMessage(output);
    } catch (e) {
      self.postMessage(parsedErrorMessage(e, python));
    }
  }
};
