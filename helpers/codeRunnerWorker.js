importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

let data = {};

let pyodideReadyPromise = load();

async function load() {
  self.pyodide = await loadPyodide();
}

function parsedErrorMessage(e, python, output, test = false) {
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
          return `${test?`${output}\n`:""}${data.conditionNotMet}: ${lineContent.slice(7, -1)}\n`;
        }
        if (submodule === "<module>" || submodule === undefined) {
          message +=
            "\t".repeat(depth) +
            `${test ? `${data.errorInCurrentTestCase}`:`${data.errorInCurrentFile}, ${data.line} ${lineNumber}`}: ${lineContent}\n`;
        } else {
          message +=
            "\t".repeat(depth) +
            `${data.errorInCurrentFile}, ${data.line} ${lineNumber}, ${data.in} "${submodule}": ${lineContent}\n`;
        }
      } else if (logging) {
        message +=
          "\t".repeat(depth) +
          `${data.errorInFile} "${file}", ${data.in} "${submodule}"\n`;
      }
      if (logging) {
        index = i;
        depth += 1;
      }
    }
  }
  return `${test?`${output}\n`:""}${message}\n${lines.slice(index + 1).join("\n")}`;
}

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const [ initData, python, clear, test, timeout, outputLinesLimit, get, print ] = event.data;
  if (initData !== null) {
    data = initData;
    self.postMessage([ null , null ]); // dummy msg to notify caller on initialization
  } else if (get !== null) {
    try {
      self.postMessage([ String(pyodide.runPython(get)), false ]);
    } catch (e) {
      self.postMessage([ e.message, true ]);
    }
  } else if (print !== null) {
    try {
      pyodide.runPython(`print(${print}\\n)`)
      self.postMessage([ null, false ]);
    } catch (e) {
      self.postMessage([ e.message, true ]);
    }
  } else {
    try {
      if (clear) {
        pyodide.runPython("globals().clear()\n");
      }

      pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
        def ${data.getOutput}():
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
          return ''.join(lines)
      `);

      await pyodide.loadPackagesFromImports(python);
      pyodide.runPython(python);

      self.postMessage([ pyodide.runPython(`${data.getOutput}()`), false ]);
    } catch (e) {
      self.postMessage([ parsedErrorMessage(e, python, pyodide.runPython(`${data.getOutput}()`), test), true ]);
    }
  }
};
