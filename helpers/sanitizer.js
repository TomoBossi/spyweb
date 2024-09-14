function isLastLine(i, n) {
  return i === n - 1;
}

function isNotIndented(line) {
  return ![" ", "\t"].includes(line[0]);
}

function isNotEmpty(line) {
  return line;
}

function isImport(line) {
  return line.slice(0, 7) == "import ";
}

function isDef(line) {
  return line.slice(0, 4) == "def ";
}

export function sanitize(python) {
  // TODO check if insideMultilineString... AKA parse
  const lines = python.split("\n");
  const n = lines.length;
  let line;
  let result = "";
  let i = 0;
  let insideDef = false;
  let defStartIndex = 0;
  while (i < n) {
    line = lines[i];
    if (isImport(line)) {
      result += line + "\n";
    }
    if (insideDef) {
      if ((isNotIndented(line) && isNotEmpty(line)) || isLastLine(i, n)) {
        insideDef = false;
        result +=
          lines
            .slice(defStartIndex, i + isLastLine(i, n))
            .filter((line) => isNotEmpty(line.trim()))
            .join("\n") + "\n";
        i--;
      }
    } else if (isDef(line)) {
      insideDef = true;
      defStartIndex = i;
    }
    i++;
  }
  return result;
}