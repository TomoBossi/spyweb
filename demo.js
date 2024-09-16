import TestSuite from "./helpers/TestSuite.js";

export let demo = new TestSuite({
  label: "Demo",
  caseGroups: [
    {
      label: "tirar_cubilete()",
      cases: [
        {
          label: "Los dados del cubilete tienen caras entre 1 y 6",
          python: `
cubilete = tirar_cubilete()
for indice in range(len(cubilete)):
  assert(1 <= cubilete[indice] <= 6)
          `,
          repeat: 100
        }
      ]
    }
  ]
});