// Pyodide @ https://pyodide.org/en/stable/usage/quickstart.html#setup
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');

async function load() {
  self.pyodide = await loadPyodide();
}

function parsedErrorMessage(e) {
  let lineNumber = '';
  let index = 0;
  const lines = e.message.split('\n');
  for (let [i, line] of lines.entries()) {
    if (line.match('  File "<exec>"')) {
      lineNumber = `Error on line ${line.split(',')[1].split(' ')[2]}\n`;
      index = i; 
      break;
    }
  }
  return lineNumber + lines.slice(index + 1).join('\n');
}

let pyodideReadyPromise = load();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const python = event.data;
  if (python === null) {
    self.postMessage(null); 
  } else {
    let output = '';
    self.pyodide.globals.set('print', s => output += String(s) + '\n');
    try {
      await pyodide.loadPackagesFromImports(python);
      const { _, error } = await pyodide.runPythonAsync(python);
      if (error) {
        self.postMessage(output + error);
      } else {
        self.postMessage(output);
      }
    } catch (e) {
      self.postMessage(output + parsedErrorMessage(e));
    }
  }
};