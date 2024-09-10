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

let dark = true;

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

export {setInput, getInput, setOutput, appendOutput, scrollOutput, displayToggle, dark}