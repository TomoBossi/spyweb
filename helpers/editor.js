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

const outputTextAreaPlaceholder = `Acá vas a ver las salidas o errores de la ejecución\n`;

const params = new URLSearchParams(window.location.href.split("?").pop());
const editorOnly = params.has("editor_only");
const editorOnlyHorizontal = editorOnly && params.get("editor_only") === "horizontal";
const editorWrapper = document.getElementById("monaco_editor_wrapper");
const outputWrapper = document.getElementById("monaco_output_wrapper");
const editorAreaWrapper = document.getElementById("monaco_wrapper");

let dark = !params.has("dark_mode") || params.get("dark_mode") === "true";
document.body.setAttribute("dark", dark);

let editorTextArea = monaco.editor.create(
  document.getElementById("monaco_editor"),
  {
    value: editorPlaceholder,
    language: "python",
    theme: dark ? "vs-dark" : "vs",
    fontSize: 14.5,
  }
);

const outputTextArea = monaco.editor.create(
  document.getElementById("monaco_output"),
  {
    value: outputTextAreaPlaceholder,
    theme: dark ? "vs-dark" : "vs",
    fontSize: 14.5,
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "on", // (lineNumber) => "out" + lineNumber,
  }
);

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

function displayToggle() {
  monaco.editor.setTheme(dark ? "vs" : "vs-dark");
  dark = !dark;
}

function scrollOutput() {
  outputTextArea.revealLine(outputTextArea.getModel().getLineCount());
}

function setEditorTextAreaLayout(width, height) {
  editorTextArea.layout({ width: width, height: height });
}

function setOutputTextAreaLayout(width, height) {
  outputTextArea.layout({ width: width, height: height });
}

function resizeVertical() {
  const windowWidth = window.innerWidth;
  const editorWrapperHeight = editorWrapper.getBoundingClientRect().height;
  const editorAreaWrapperHeight = editorAreaWrapper.getBoundingClientRect().height;
  const outputWrapperHeight = editorAreaWrapperHeight - editorWrapperHeight;
  setEditorTextAreaLayout(windowWidth, editorWrapperHeight);
  setOutputTextAreaLayout(windowWidth, outputWrapperHeight);
  outputWrapper.style.height = outputWrapperHeight + "px";
}

function resizeHorizontal() {
  const windowWidth = window.innerWidth;
  const editorWrapperWidth = editorWrapper.getBoundingClientRect().right;
  const outputWrapperWidth = windowWidth - editorWrapperWidth;
  const editorAreaWrapperHeight = editorAreaWrapper.getBoundingClientRect().height;
  setEditorTextAreaLayout(editorWrapperWidth, editorAreaWrapperHeight);
  setOutputTextAreaLayout(outputWrapperWidth, editorAreaWrapperHeight);
  outputWrapper.style.width = outputWrapperWidth + "px";
}

const resizeObserver = new ResizeObserver((_) =>
  editorOnlyHorizontal
    ? resizeHorizontal()
    : resizeVertical()
);

resizeObserver.observe(editorWrapper);
resizeObserver.observe(document.body);

if (editorOnly) { // TODO migrate as HTML Attributes + CSS variables with minimal Js
  editorAreaWrapper.style.maxWidth = "100%";
  editorAreaWrapper.style.width = "100%";
  editorAreaWrapper.style.resize = "none";
  editorAreaWrapper.style.borderRight = "0px";
  if (editorOnlyHorizontal) {
    editorWrapper.style.resize = "horizontal";
    editorWrapper.style.display = "inline-block";
    editorWrapper.style.float = "left";
    editorWrapper.style.maxHeight = "100%";
    editorWrapper.style.height = "100%";
    editorWrapper.style.maxWidth = "100%";
    editorWrapper.style.minWidth = "0%";
    editorWrapper.style.width = "60%";
    editorWrapper.style.borderRight = "1px var(--border-color) solid";
    outputWrapper.style.display = "inline-block";
    outputWrapper.style.float = "right";
    outputWrapper.style.maxHeight = "100%";
    outputWrapper.style.height = "100%";
    outputWrapper.style.maxWidth = "100%";
    outputWrapper.style.minWidth = "0%";
    outputWrapper.style.width = "40%";
    resizeHorizontal();
  }
}

export {
  setInput,
  getInput,
  setOutput,
  appendOutput,
  scrollOutput,
  displayToggle,
  dark
};
