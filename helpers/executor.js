import {getInput, setOutput, appendOutput} from "./editor.js";

let executor;
let running = false;
let loadingExecutor = true;

function initExecutor(reset=false) {
  if (reset) {
    setOutput("Ejecución interrumpida, reiniciando ejecutor...\n");
  } else {
    appendOutput("\nIniciando ejecutor...\n");
  }

  document.getElementById("run").setAttribute("enabled", false);
  document.getElementById("stop").setAttribute("enabled", false);
  executor = new Worker("./helpers/executorWorker.js");
  executor.onmessage = () => {
    loadingExecutor = false;
    document.getElementById("run").setAttribute("enabled", true);

    if (reset) {
      appendOutput("Ejecutor reiniciado con éxito :D\n");
    } else {
      appendOutput("Ejecutor iniciado con éxito :D\n");
    }
  };
  executor.postMessage(null);
}

initExecutor();

function runningToggle() {
  document.getElementById("run").setAttribute("enabled", running);
  document.getElementById("stop").setAttribute("enabled", !running);
  running = !running;
}

function onMessageDefault(output) {
  if (output.data) {
    setOutput(output.data);
  }
}

function run(python = getInput(), onMessage = onMessageDefault) {
  if (!running && !loadingExecutor) {
    setOutput("");
    runningToggle();
    executor.onmessage = (output) => {
      onMessage(output);
      runningToggle();
    }
    executor.postMessage(python);
  }
}

function stop() {
  if (running) {
    executor.terminate();
    loadingExecutor = true;
    runningToggle();
    initExecutor(true);
  }
}

export {run, stop};