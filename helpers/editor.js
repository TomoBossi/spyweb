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

const outputTextAreaPlaceholder = `Acá vas a ver las salidas o errores de la ejecución de tu código\n`;

let editorTextArea = monaco.editor.create(document.getElementById("monaco_editor"), {
  automaticLayout: true,
  value: editorPlaceholder,
  language: "python",
  theme: "vs-dark",
  fontSize: 14.5
});

const outputTextArea = monaco.editor.create(
  document.getElementById("monaco_output"),
  {
    automaticLayout: true,
    value: outputTextAreaPlaceholder,
    theme: "vs-dark",
    fontSize: 14.5,
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "on" // (lineNumber) => "out" + lineNumber,
  }
);

const editorWrapper = document.getElementById("monaco_editor_wrapper");
const outputWrapper = document.getElementById("monaco_output_wrapper");
function resizeOutputTextArea() {
  outputWrapper.style.height = (window.innerHeight - editorWrapper.getBoundingClientRect().bottom) + 'px';
}
const resizeObserver = new ResizeObserver((_) => resizeOutputTextArea());
resizeObserver.observe(editorWrapper);
resizeObserver.observe(document.body);

function editorOnly() {
  const params = new URLSearchParams(window.location.href.split("?").pop());
  return params.has("editor_only") && params.get("editor_only") === "true";
}

const editorAreaWrapper = document.getElementById("monaco_wrapper");
if (editorOnly()) {
  editorAreaWrapper.style.maxWidth = "100%";
  editorAreaWrapper.style.width = "100%";
  editorAreaWrapper.style.resize = "none";
  editorAreaWrapper.style.borderRight = "0px";
}

function getInput() {
  return editorTextArea.getValue();
}

function setInput(input) {
  editorTextArea.setValue(input);
}

function setOutput(output) {
  outputTextArea.setValue(output);
}

function appendOutput(output) {
  setOutput(outputTextArea.getValue() + output);
}

export {setInput, getInput, setOutput, appendOutput}