import("./helpers/runners/tester.js").then((m) => (tester = m));
import("./helpers/runners/executor.js").then((m) => (executor = m.default));
import("./helpers/editor.js").then((m) => (editor = m));

import("./demo.js").then((m) => (demo = m.demo));

// miscellaneous event handling

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    download();
  } else if (event.ctrlKey && event.key === "o") {
    event.preventDefault();
    document.getElementById("load_input").click();
  } else if (event.key === "F9") {
    event.preventDefault();
    executor.reset();
  } else if (event.key === "F5") {
    event.preventDefault();
    executor.run(editor.getInput());
  }
});

document.getElementById("load_input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = (e) => editor.setInput(e.target.result);
    reader.readAsText(file);
  }
});

function download() {
  const blob = new Blob([editor.getInput()], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  const dummyDownloadLink = document.createElement("a");
  dummyDownloadLink.href = url;
  dummyDownloadLink.download = "script.py";
  document.body.appendChild(dummyDownloadLink);
  dummyDownloadLink.click();
  document.body.removeChild(dummyDownloadLink);
  URL.revokeObjectURL(url);
}

document.getElementById("download_container").addEventListener("click", () => download());

document.getElementById("display_toggle_container").addEventListener("click", () => editor.displayToggle());

document.getElementById("run_container").addEventListener("click", () => executor.run(editor.getInput()));

document.getElementById("reset_container").addEventListener("click", () => executor.reset());

document.getElementById("layout_toggle_container").addEventListener("click", () => editor.layoutToggle());