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

document.getElementById("load").addEventListener("change", (event) => {
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

function displayToggle() {
  const iconDark = document.getElementById("dark");
  const iconLight = document.getElementById("light");
  iconDark.style.display = editor.dark ? "block" : "none";
  iconLight.style.display = editor.dark ? "none" : "block";
  document.body.setAttribute("dark", editor.dark ? "false" : "true");
  editor.displayToggle();
}

document.getElementById("download").addEventListener("click", () => download());

document.getElementById("display_toggle").addEventListener("click", () => displayToggle());

document.getElementById("run").addEventListener("click", () => executor.run());

document.getElementById("stop").addEventListener("click", () => executor.stop());