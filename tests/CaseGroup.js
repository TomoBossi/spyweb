export default class CaseGroup {
  constructor(kwargs) {
    this.index = kwargs.index; // unique index of the group in the test suite
    this.label = kwargs.label; // name of the group
    this.cases = kwargs.cases; // array of cases (of the Case class)
  }
}