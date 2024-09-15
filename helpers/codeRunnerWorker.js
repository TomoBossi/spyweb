importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

const maxOutputSize = 1000;

let pyodideReadyPromise = load();

async function load() {
  self.pyodide = await loadPyodide();
}

function parsedErrorMessage(e, python, test = false) {
  let logging = false;
  let message = "";
  let index = 0;
  let depth = 0;
  let file;
  let lineNumber;
  let submodule;
  let lineContent;
  const lines = e.message.split("\n");
  const assertionError = lines[lines.length - 2] === "AssertionError";
  for (let [i, line] of lines.entries()) {
    [_, file, lineNumber] = line.match(/File "(\S+)", line (\d+)/) || [];
    [_, submodule] = line.match(/, in (\S+)/) || [];
    if (lineNumber !== undefined) {
      if (file === "<exec>") {
        logging = true;
        lineContent = python.split("\n")[lineNumber - 1].trim();
        if (assertionError) {
          return `No se cumple este caso de prueba: ${lineContent.slice(7, -1)}`;
        }
        if (submodule === "<module>" || submodule === undefined) {
          message +=
            "\t".repeat(depth) +
            `Error en este ${test ? "caso de prueba":`archivo, linea ${lineNumber}`}: ${lineContent}\n`;
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
  const [ python, clear, test, outputLinesLimit ] = event.data;
  if (python === null) {
    self.postMessage(null); // Dummy msg to notify caller on initialization
  } else {
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

      let output = pyodide.runPython(`
        n = ${outputLinesLimit}
        i = sys.stdout.seek(0, io.SEEK_END)
        lines = []
        buffer = []
        while i > 0 and len(lines) < n:
          chunk_size = min(1024, i) # read 1024b = 1kb per iteration
          i -= chunk_size
          sys.stdout.seek(i)
          buffer.append(sys.stdout.read(chunk_size))
          lines = ''.join(reversed(buffer)).splitlines(True)
          if len(lines) >= n:
            lines = lines[-n:]
        ''.join(lines)
      `);

      self.postMessage(output);
    } catch (e) {
      self.postMessage(parsedErrorMessage(e, python, test));
    }
  }
};
