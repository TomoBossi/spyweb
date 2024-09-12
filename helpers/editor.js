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

let dark = !(params.has("light_mode") && params.get("light_mode") === "true");
document.body.setAttribute("dark", dark);
document.body.setAttribute("editor_only", editorOnly);
document.body.setAttribute("editor_only_mode", editorOnlyHorizontal ? "horizontal" : "vertical");

let editorTextArea = monaco.editor.create(
  document.getElementById("monaco_editor"),
  {
    value: editorPlaceholder,
    theme: dark ? "vs-dark" : "vs",
    fontSize: 14.5,
    language: "python"
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
    lineNumbers: "on"
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

export {
  setInput,
  getInput,
  setOutput,
  appendOutput,
  scrollOutput,
  displayToggle,
  dark
};
