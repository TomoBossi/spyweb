// Editor
const editorPlaceholder = `"""
  _____                _____                      
 |  __ \\              / ____/                     
 | |__) |__ _ __  ___| |     ___  _ __ ___  _ __  
 |  ___/ _ \\ '_ \\/ __| |    / _ \\| '_ ' _ \\| '_ \\ 
 | |  |  __/ | | \\__ \\ |___| (_) | | | | | | |_) |
 |_|   \\___|_| |_|___/\\_____\\___/|_| |_| |_| .__/ 
                                           | |    
                                           |_|

Subí tu archivo .py o pegá/escribí tu código acá

Por ejemplo:
"""

import random

def dado(caras):
  """
  Simula tirar un dado de la cantidad de caras pasada por parámetro
  """
  resultado = random.randint(1, caras)
  return resultado

d20 = dado(20)
print(d20)
`;

const outputTextAreaPlaceholder = `Acá vas a ver las salidas o errores de la ejecución de tu código`;

let editor = monaco.editor.create(document.getElementById("monaco_editor"), {
  automaticLayout: true,
  value: editorPlaceholder,
  language: "python",
  theme: "vs-dark",
  fontSize: 14.5,
});

let outputTextArea = monaco.editor.create(
  document.getElementById("monaco_output"),
  {
    automaticLayout: true,
    value: outputTextAreaPlaceholder,
    theme: "vs-dark",
    fontSize: 14.5,
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "on", // (lineNumber) => "out" + lineNumber,
  }
);

document.getElementById("load").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = (e) => editor.setValue(e.target.result);
    reader.readAsText(file);
  }
});

function download() {
  const blob = new Blob([editor.getValue()], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "script.py";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById("download").addEventListener("click", () => download());
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    download();
  }
});

const editorWrapper = document.getElementById("monaco_editor_wrapper");
const outputWrapper = document.getElementById("monaco_output_wrapper");

function resizeOutputTextArea() {
  outputWrapper.style.height = (window.innerHeight - editorWrapper.getBoundingClientRect().bottom) + 'px';
}

const resizeObserver = new ResizeObserver((_) => resizeOutputTextArea());
resizeObserver.observe(editorWrapper);
resizeObserver.observe(document.body);

// Editor-only querystring parameter
function editorOnly() {
  const params = new URLSearchParams(window.location.href.split("?").pop());
  if (params.has("editor_only")) {
    return params.get("editor_only");
  }
  return false;
}

const editorAreaWrapper = document.getElementById("monaco_wrapper");
if (editorOnly()) {
  editorAreaWrapper.style.maxWidth = "100%";
  editorAreaWrapper.style.width = "100%";
  editorAreaWrapper.style.resize = "none";
  editorAreaWrapper.style.borderRight = "0px";
}

////////////////////////////////////////////////////////////////////////////////

// Executor
let executor;
let running = false;
let loadingExecutor = true;

function initExecutor() {
  document.getElementById("run").setAttribute("enabled", false);
  document.getElementById("stop").setAttribute("enabled", false);
  executor = new Worker("executor.js");
  executor.postMessage(null);
  executor.onmessage = () => {
    loadingExecutor = false;
    document.getElementById("run").setAttribute("enabled", true);
  };
}

initExecutor();

function runningToggle() {
  document.getElementById("run").setAttribute("enabled", running);
  document.getElementById("stop").setAttribute("enabled", !running);
  running = !running;
}

function run(python) {
  outputTextArea.setValue("");
  if (!running && !loadingExecutor) {
    executor.postMessage(python);
    runningToggle();
    executor.onmessage = (output) => {
      if (output.data) {
        updateOutput(output.data);
      }
      runningToggle();
    };
  }
}

function stop() {
  if (running) {
    executor.terminate();
    updateOutput("Ejecución interrumpida\n");
    loadingExecutor = true;
    runningToggle();
    initExecutor();
  }
}

function updateOutput(output) {
  outputTextArea.setValue(output);
}

document.getElementById("run").addEventListener("click", () => run(editor.getValue()));
document.getElementById("stop").addEventListener("click", () => stop());

////////////////////////////////////////////////////////////////////////////////

function test(rawCode, tests) {
  script = sanitizeCode(rawCode) + "\n" + tests;
  run();
}

function sanitizeCode(rawCode) {
  let result = [];
  let lines = rawCode.split("\n");
  let n = lines.length;
  let lineIndex = 0;
  let defStartIndex = 0;
  let defEndIndex = 0;
  let insideDef = false;

  while (lineIndex < n) {
    let line = lines[lineIndex];

    if (line.slice(0, 7) == "import ") {
      result = result.concat(line);
    }

    if (insideDef) {
      if (line.includes(" return ") || lineIndex == n - 1) {
        defEndIndex = lineIndex;
      }

      if (![" ", "\n"].includes(line[0]) || lineIndex == n - 1) {
        insideDef = false;
        result = result.concat(
          lines.slice(defStartIndex, defEndIndex + 1)
        );
        lineIndex--;
      }
    } else if (line.slice(0, 4) == "def ") {
      defStartIndex = lineIndex;
      defEndIndex = lineIndex;
      insideDef = true;
    }

    lineIndex++;
  }
  result = result.join("\n");
  console.log(result);
  return result;
}

// let tasks = [
//     { value: 'figuritas', label: 'Figuritas' },
//     { value: '10mil', label: '10 mil' },
//     { value: 'incendio', label: 'Incendio Forestal' },
// ];
