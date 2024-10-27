export const defaults = {
  executorResetLoadingMessage: "Reiniciando ejecutor...",

  executorLoadingMessage: "Iniciando ejecutor...",

  executorLoadedSuccessfullyMessage: "Ejecutor iniciado con éxito :D",

  executionDurationMessage: (duration) => {
    return `Ejecutado en ${duration.toFixed(3)} segundos`;
  },

  testerErrorMessage: () => {
    return `Error en el caso de prueba:`;
  },

  testerErrorMessageRepetition: (i) => {
    return `Error en la repetición {${i}+1} del caso de prueba:`;
  },

  testerSuccessMessage: (label) => {
    return `Pasaste este caso de prueba!`;
  },

  testerBlameErrorMessage: (j) => {
    return `Error en esta linea (Parece venir de tu función!)`;
  },

  testerBlameErrorMessageAssert: (j) => {
    return `Error en esta linea (no se cumplió esta condición)`;
  },

  editorPlaceholder: `"""
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
`,

  outputTextAreaPlaceholder: `Acá vas a ver las salidas o errores de la ejecución`,

  runButtonLabel: "Ejecutar",

  resetButtonLabel: "Reiniciar",

  openButtonLabel: "Abrir",

  saveButtonLabel: "Guardar",

};

export const workerDefaults = { // cannot include functions
  in: "en",
  line: "linea",
  errorInCurrentFile: "Error en este archivo",
  errorInFile: "Error en el archivo",
  errorInCurrentTestCase: "Error en este caso de prueba",
  conditionNotMet: "No se cumple esta condición"
};

//document.getElementById("run_container").innerHTML = defaults.runButtonLabel;
//document.getElementById("reset_container").innerHTML = defaults.resetButtonLabel;
//document.getElementById("open_container").innerHTML = defaults.openButtonLabel;
//ocument.getElementById("save_container").innerHTML = defaults.saveButtonLabel;
//document.getElementById("_container").innerHTML = defaults.layoutToggleButtonLabel;
//ocument.getElementById("_container").innerHTML = defaults.modeToggleButtonLabel;
