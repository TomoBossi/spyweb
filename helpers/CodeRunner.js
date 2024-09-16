import { workerDefaults } from "../text.js";
import { data } from "./shared.js";

export default class CodeRunner {
  constructor(kwargs) {
    this.runner;
    this.running = false;
    this.loading = true;
    this.async = kwargs.async;
    this.preInitHook = kwargs.preInitHook;
    this.postInitHook = kwargs.postInitHook;
    this.preRunHook = kwargs.preRunHook;
    this.postRunHook = kwargs.postRunHook;
    this.postGetHook = kwargs.postGetHook;
    this.storage = kwargs.storage;
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
    this.runner.postMessage([ {...data, ...workerDefaults}, null, null, null, null, null, null, null ]);
  }

  reset() {
    if (!this.loading) {
      this.runner.terminate();
      this.init(true);
    }
  }

  run(python, clear = true, test = false, timeout = -1, outputLinesLimit = 1000) {
    let duration = Date.now();
    if ((!this.running || this.async) && !this.loading) {
      this.running = true;
      this.preRunHook(python);
      this.runner.onmessage = (message) => {
        this.running = false;
        const [ output, _ ] = message.data;
        duration = (Date.now() - duration)/1000;
        this.postRunHook(output, duration);
      };
      this.runner.postMessage([ null, python, clear, test, timeout, outputLinesLimit, null, null ]);
    }
  }

  get(variable) {
    if ((!this.running || this.async) && !this.loading) {
      this.runner.onmessage = (message) => {
        this.running = false;
        const [ output, error ] = message.data;
        if (!error) {
          this.storage[variable] = output;
          this.postGetHook(variable);
        }
      };
      this.runner.postMessage([ null, null, null, null, null, null, variable, null ]);
    }
  }
}
