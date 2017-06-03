
import { expect } from 'chai';

import runner from '../../../../client/scripts/arcademode/runner';

const userOutputUndef = 'User output is undefined';

const emptyChallenge = {
  tests: ['// No tests, message: No tests really']
};

const challengeWithTest = {
  tests: ['assert(true === true, "message: This is correct.");']
};

const challengeWithHead = {
  head: ['function seenByUser() {return 1 + 1;}'],
  tests: []
};

const challengeWithTail = {
  tail: ['function tailFunction() {return "tail function";}'],
  tests: ['assert(tailFunction() !== "right", "message: all fine");']
};

describe('runner()', () => {
  it('executes js using eval and returns results', () => {
    const userCode = '// no code';
    const res = runner(userCode, emptyChallenge);
    expect(res).to.have.property('userOutput');
    expect(res).to.have.property('errorMsgs');
    expect(res).to.have.property('testResults');
    expect(res.errorMsgs).to.have.length(0);
  });

  it('catches invalid syntax correctly', () => {
    const userCode = 'syntaxError [][ = ;];';
    const res = runner(userCode, emptyChallenge);
    expect(res.errorMsgs).to.have.length(1);
    expect(res.userOutput).to.have.length.above(0);
    expect(res.userOutput).to.match(/SyntaxError/);
    expect(res.testResults).to.have.length(0);
  });

  it('catches invalid execution, non-exec code', () => {
    const userCode = 'let myVar = NonExistingClass()';
    const res = runner(userCode, emptyChallenge);
    expect(res.errorMsgs).to.have.length(1);
    expect(res.userOutput).to.have.length.above(0);
    expect(res.userOutput).to.match(/Error:/);
    expect(res.testResults).to.have.length(0);
  });

  it('Runs tests for correct code', () => {
    const userCode = '// Error-free code\ntrue;';
    const res = runner(userCode, challengeWithTest);
    expect(res.testResults).to.have.length(1);
    expect(res.errorMsgs).to.have.length(0);
    expect(res.userOutput).to.equal('true');
  });

  it('adds head before executing the code', () => {
    const userCode = 'seenByUser();';
    const res = runner(userCode, challengeWithHead);
    expect(res.userOutput).to.equal('2');
  });

  it('adds tail before running the tests', () => {
    const userCode = '// No user code really';
    const res = runner(userCode, challengeWithTail);
    expect(res.userOutput).to.equal(userOutputUndef);
  });

  it('catches infinite loops in user code', () => {
    const userCode = 'while (true);';
    const res = runner(userCode, challengeWithHead);
    expect(res.errorMsgs).to.have.length(1);
    expect(res.userOutput).to.match(/infinite loop/);
    console.log(res.userOutput);
  });
});
