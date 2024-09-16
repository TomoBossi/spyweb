import { defaults } from "../text.js";

const params = new URLSearchParams(window.location.href.split("?").pop());
const editorWrapper = document.getElementById("monaco_editor_wrapper");
const outputWrapper = document.getElementById("monaco_output_wrapper");
const editorAreaWrapper = document.getElementById("monaco_wrapper");
const testAreaWrapper = document.getElementById("test_area_wrapper");

let dark = !(params.has("light_mode") && params.get("light_mode") === "true");
document.body.setAttribute("dark", dark);

export function displayToggle() {
  document.body.setAttribute("dark", dark ? "false" : "true");
  monaco.editor.setTheme(dark ? "vs" : "vs-dark");
  dark = !dark;
}

document.body.setAttribute(
  "editor_only", 
  params.has("editor_only") && (
    params.get("editor_only") === "horizontal" ||
    params.get("editor_only") === "vertical"
  )
);

document.body.setAttribute(
  "editor_only_mode", 
  params.has("editor_only")? 
    params.get("editor_only") === "horizontal"?
      "horizontal":
      params.get("editor_only") === "vertical"?
        "vertical":
        "default":
    "default"
);

const layoutCycle = [
  { editorOnly: "false", editorOnlyMode: "default", resize: resizeEditorDefaultLayout },
  { editorOnly: "true", editorOnlyMode: "horizontal", resize: resizeEditorOnlyHorizontal },
  { editorOnly: "true", editorOnlyMode: "vertical", resize: resizeEditorOnlyVertical },
];

let currentLayoutIndex;
for (let [i, layout] of layoutCycle.entries()) {
  if (
    layout.editorOnly === document.body.getAttribute("editor_only") &&
    layout.editorOnlyMode === document.body.getAttribute("editor_only_mode")
  ) {
    currentLayoutIndex = i;
    break;
  }
}

export function layoutToggle() {
  currentLayoutIndex = (currentLayoutIndex + 1) % layoutCycle.length;
  document.body.setAttribute("editor_only", layoutCycle[currentLayoutIndex].editorOnly);
  document.body.setAttribute("editor_only_mode", layoutCycle[currentLayoutIndex].editorOnlyMode);
}

let editorTextArea = monaco.editor.create(
  document.getElementById("monaco_editor"),
  {
    value: defaults.editorPlaceholder,
    theme: dark ? "vs-dark" : "vs",
    fontSize: 14.5,
    language: "python",
    scrollbar: {
      vertical: "visible",
      horizontal: "visible"
    }
  }
);

const outputTextArea = monaco.editor.create(
  document.getElementById("monaco_output"),
  {
    value: `${defaults.outputTextAreaPlaceholder}\n`,
    theme: dark ? "vs-dark" : "vs",
    fontSize: 14.5,
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "on",
    scrollbar: {
      vertical: "visible",
      horizontal: "visible"
    }
  }
);

export function getInput() {
  return editorTextArea.getValue();
}

export function setInput(input) {
  editorTextArea.setValue(input);
}

export function setOutput(output) {
  outputTextArea.setValue(output);
}

export function appendOutput(output) {
  setOutput(outputTextArea.getValue() + output);
}

export function scrollOutput() {
  outputTextArea.revealLine(outputTextArea.getModel().getLineCount());
}

function setEditorTextAreaLayout(width, height) {
  editorTextArea.layout({ width: width, height: height });
}

function setOutputTextAreaLayout(width, height) {
  outputTextArea.layout({ width: width, height: height });
}

function resizeEditorOnlyVertical() {
  const windowWidth = window.innerWidth;
  const editorWrapperHeight = editorWrapper.getBoundingClientRect().height;
  const editorAreaWrapperHeight = editorAreaWrapper.getBoundingClientRect().height;
  const outputWrapperHeight = editorAreaWrapperHeight - editorWrapperHeight - 30;
  setEditorTextAreaLayout(windowWidth, editorWrapperHeight);
  setOutputTextAreaLayout(windowWidth, outputWrapperHeight);
  outputWrapper.style.height = outputWrapperHeight + "px";
}

function resizeEditorOnlyHorizontal() {
  const windowWidth = window.innerWidth;
  const editorWrapperWidth = editorWrapper.getBoundingClientRect().right;
  const outputWrapperWidth = windowWidth - editorWrapperWidth;
  const editorAreaWrapperHeight = editorAreaWrapper.getBoundingClientRect().height - 30;
  setEditorTextAreaLayout(editorWrapperWidth, editorAreaWrapperHeight);
  setOutputTextAreaLayout(outputWrapperWidth, editorAreaWrapperHeight);
  outputWrapper.style.width = outputWrapperWidth + "px";
}

function resizeEditorDefaultLayout() {
  const windowWidth = window.innerWidth;
  const editorAreaWrapperWidth = editorAreaWrapper.getBoundingClientRect().width;
  const editorWrapperHeight = editorWrapper.getBoundingClientRect().height;
  const editorAreaWrapperHeight = editorAreaWrapper.getBoundingClientRect().height;
  const outputWrapperHeight = editorAreaWrapperHeight - editorWrapperHeight - 30;
  const testAreaWrapperWidth = windowWidth - editorAreaWrapperWidth;
  setEditorTextAreaLayout(editorAreaWrapperWidth, editorWrapperHeight);
  setOutputTextAreaLayout(editorAreaWrapperWidth, outputWrapperHeight);
  outputWrapper.style.height = outputWrapperHeight + "px";
  testAreaWrapper.style.width = testAreaWrapperWidth + "px";
}

function resizeEditor() {
  layoutCycle[currentLayoutIndex].resize();
}

const resizeObserver = new ResizeObserver((_) => resizeEditor());

resizeObserver.observe(editorWrapper);
resizeObserver.observe(document.body);
