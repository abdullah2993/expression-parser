import { evaluate, evaluateObject } from '../src/evaluator';

describe('Evaluator tests', () => {
  it('should solve basic math equations', () => {
    expect(evaluate('1+2')).toBe(3);
    expect(evaluate('10 + 2 * 6')).toBe(22);
    expect(evaluate('100 * 2 + 12')).toBe(212);
    expect(evaluate('100 * ( 2 + 12 )')).toBe(1400);
    expect(evaluate('100 * ( 2 + 12 ) / 14')).toBe(100);
  });

  it('should solve basic math equations with object context', () => {
    const context = {
      a: 1, b: 2, c: 10, d: 6, e: 100, f: 12, g: 14,
    };
    expect(evaluateObject('a+b', context)).toBe(3);
    expect(evaluateObject('c + b * d', context)).toBe(22);
    expect(evaluateObject('e * b + f', context)).toBe(212);
    expect(evaluateObject('e * ( b + f )', context)).toBe(1400);
    expect(evaluateObject('e * ( b + f ) / g', context)).toBe(100);
  });

  it('should resolve length of string', () => {
    const val = { a: 'xyz' };
    expect(evaluateObject('length(a)', val)).toBe(3);
  });

  it('should validate string range', () => {
    const val = { a: 'xyz', b: 'asd123asd' };
    expect(evaluateObject('length(a) between 1 and 3 and length(b) between 1 and 9', val)).toBe(true);
  });

  it('should check string length', () => {
    const val = { a: 'asd123asd' };
    expect(evaluateObject('length(a) = 9', val)).toBe(true);
  });

  it('should check not null', () => {
    const val = { a: 'asd123asd' };
    expect(evaluateObject('a is not null', val)).toBe(true);
  });

  it('should check not null', () => {
    const val = { a: null };
    expect(evaluateObject('a is null', val)).toBe(true);
  });

  it('should check string is not null and has length between 4 and 10', () => {
    const val = { a: '1234' };
    expect(evaluateObject('a is not null and length(a) between 4 and 10', val)).toBe(true);
  });

  it('should check string is not null and has length between 4 and 10', () => {
    let val: any = { a: null };
    expect(evaluateObject('a is not null and length(a) between 4 and 10', val)).toBe(false);
    val = { a: '123' };
    expect(evaluateObject('a is not null and length(a) between 4 and 10', val)).toBe(false);
    val = { a: '1234' };
    expect(evaluateObject('a is not null and length(a) between 4 and 10', val)).toBe(true);
    val = { a: '1234567890' };
    expect(evaluateObject('a is not null and length(a) between 4 and 10', val)).toBe(true);
    val = { a: '12345678901' };
    expect(evaluateObject('a is not null and length(a) between 4 and 10', val)).toBe(false);
  });

  it('should compare variables', () => {
    let val: any = { a: 1, b: 1 };
    expect(evaluateObject('a is not null and b is not null', val)).toBe(true);
    expect(evaluateObject('a is not null and b is null', val)).toBe(false);

    val = { a: 1, b: null };
    expect(evaluateObject('a is not null and b is null', val)).toBe(true);

    val = { a: 1, b: 1 };
    expect(evaluateObject('a=b', val)).toBe(true);
    expect(evaluateObject('a>b', val)).toBe(false);
    expect(evaluateObject('a<b', val)).toBe(false);

    val = { a: 1, b: 2 };
    expect(evaluateObject('a=b', val)).toBe(false);
    expect(evaluateObject('a>b', val)).toBe(false);
    expect(evaluateObject('a<b', val)).toBe(true);
    expect(evaluateObject('a>=1 and a< 10 and b >1 and b<3', val)).toBe(true);
  });
});
