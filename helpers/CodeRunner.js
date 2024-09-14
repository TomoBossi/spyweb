export default class CodeRunner {
  constructor(kwargs) {
    this.runner;
    this.running = false;
    this.loading = true;
    this.preInitHook = kwargs.preInitHook;
    this.postInitHook = kwargs.postInitHook;
    this.preRunHook = kwargs.preRunHook;
    this.postRunHook = kwargs.postRunHook;
    this.init(false);
  }

  init(reset = false) {
    this.running = false;
    this.loading = true;
    this.preInitHook(reset);
    this.runner = new Worker("./helpers/codeRunnerWorker.js");
    this.runner.onmessage = () => {
      this.loading = false;
      this.postInitHook(reset);
    };
    this.runner.postMessage([ null, null, null ]);
  }

  reset() {
    if (!this.loading) {
      this.runner.terminate();
      this.init(true);
    }
  }

  run(python, clear = true, lastPrint = false) {
    let duration = Date.now();
    if (!this.running && !this.loading) {
      this.running = true;
      this.preRunHook();
      this.runner.onmessage = (output) => {
        this.running = false;
        duration = (Date.now() - duration)/1000;
        this.postRunHook(output, duration);
      };
      this.runner.postMessage([ python, clear, lastPrint ]);
    }
  }
}