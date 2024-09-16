// this class is just meant to be used by the TestSuite class

export default class CaseGroup {
  constructor(kwargs) {
    this.status = 0; // -1: error, 0: never ran, 1: success, 2: running/queued
    this.label = kwargs.label; // name of the group, e.g. the signature of a function to be unit tested
    this.cases = kwargs.cases; // array of cases (of the Case class), order matters
  }
}
