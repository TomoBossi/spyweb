import("./helpers/editor.js").then((m) => editor = m);
import("./helpers/executor.js").then((m) => executor = m);
import("./helpers/sanitizer.js").then((m) => sanitizer = m);

document.addEventListener("keydown", (event) => {
  
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    editor.download();
  } 
  
  else if (event.key === "F5") {
    event.preventDefault();
    executor.run();
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

document.getElementById("load").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = (e) => editor.setInput(e.target.result);
    reader.readAsText(file);
  }
});

document.getElementById("download").addEventListener("click", () => download());

document.getElementById("run").addEventListener("click", () => executor.run());

document.getElementById("stop").addEventListener("click", () => executor.stop());