export const defaults = {
  executorResetLoadingMessage: "Restarting executor...",

  executorLoadingMessage: "Initializing executor...",

  executorLoadedSuccessfullyMessage: "Executor successfully initialized :D",

  executionDurationMessage: (duration) => {
    return `${duration.toFixed(3)} seconds (total)`;
  },

  testerErrorMessage: () => {
    return `Error in the test case:`;
  },

  testerErrorMessageRepetition: (i) => {
    return `Error on repetition {${i}+1} of the test case:`;
  },

  testerSuccessMessage: (label) => {
    return `Your code passed this test case!`;
  },

  testerBlameErrorMessage: (j) => {
    return `Error in this line (seems to be caused by your function!)`;
  },

  testerBlameErrorMessageAssert: (j) => {
    return `Error in this line (condition was not met)`;
  },

  editorPlaceholder: `"""
   ____            __        __   _     
  / ___| _ __  _   \\ \\      / /__| |__  
  \\___ \\| '_ \\| | | \\ \\ /\\ / / _ \\ '_ \\ 
   ___) | |_) | |_| |\\ V  V /  __/ |_) |
  |____/| .__/ \\__, | \\_/\\_/ \\___|_.__/ 🕸
        |_|    |___/                    

Upload your .py file, or paste/write your code here

For example:
"""

import random

def dice(n: int) -> int:
  """
  Simulates rolling a dice of n faces
  """
  return random.randint(1, n)

d20 = dice(20)
print(d20)
`,

  outputTextAreaPlaceholder: `Outputs printed to Standard Out will be shown here`,

  runButtonLabel: "Run (F5)",

  resetButtonLabel: "Restart executor (F9)",

  openButtonLabel: "Open file (Ctrl + O)",

  saveButtonLabel: "Save (Ctrl + S)",

  layoutToggleButtonLabel: "Toggle layout",

  displayToggleButtonLabel: "Toggle mode",

  testSuiteSelectorPlaceholder: "Select a test suite",

};

export const workerDefaults = { // cannot include functions
  in: "in",
  line: "line",
  errorInCurrentFile: "Error in this file",
  errorInFile: "Error in the file",
  errorInCurrentTestCase: "Error in this test case",
  conditionNotMet: "Condition was not met"
};

document.getElementById("run_container").title = defaults.runButtonLabel;
document.getElementById("reset_container").title = defaults.resetButtonLabel;
document.getElementById("load_container").title = defaults.openButtonLabel;
document.getElementById("download_container").title = defaults.saveButtonLabel;
document.getElementById("layout_toggle_container").title = defaults.layoutToggleButtonLabel;
document.getElementById("display_toggle_container").title = defaults.displayToggleButtonLabel;
document.getElementById("test_suite_selector_placeholder").innerHTML = defaults.testSuiteSelectorPlaceholder;
