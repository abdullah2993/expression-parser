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
      a: 1,
      b: 2,
      c: 10,
      d: 6,
      e: 100,
      f: 12,
      g: 14,
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
    expect(
      evaluateObject(
        'length(a) between 1 and 3 and length(b) between 1 and 9',
        val
      )
    ).toBe(true);
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
    expect(
      evaluateObject('a is not null and length(a) between 4 and 10', val)
    ).toBe(true);
  });

  it('should check string is not null and has length between 4 and 10', () => {
    let val: any = { a: null };
    expect(
      evaluateObject('a is not null and length(a) between 4 and 10', val)
    ).toBe(false);
    val = { a: '123' };
    expect(
      evaluateObject('a is not null and length(a) between 4 and 10', val)
    ).toBe(false);
    val = { a: '1234' };
    expect(
      evaluateObject('a is not null and length(a) between 4 and 10', val)
    ).toBe(true);
    val = { a: '1234567890' };
    expect(
      evaluateObject('a is not null and length(a) between 4 and 10', val)
    ).toBe(true);
    val = { a: '12345678901' };
    expect(
      evaluateObject('a is not null and length(a) between 4 and 10', val)
    ).toBe(false);
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
  it('should evaluate case expressions', () => {
    let val: any = { a: 1, b: 3 };
    expect(
      evaluateObject('case when a > 1 then true else false end', val)
    ).toBe(false);
    val = { a: 2, b: 3 };
    expect(
      evaluateObject('case when a > 1 then true else false end', val)
    ).toBe(true);
    val = { a: 2, b: 3 };
    expect(
      evaluateObject(
        'case when a = 1 then 1 when a = 2 then 1 else false end',
        val
      )
    ).toBe(1);
    expect(
      evaluateObject('case when a = 1 then 1 when a = 2 then 2 else 3 end', val)
    ).toBe(2);
    expect(
      evaluateObject('case when a = 1 then 1 when a = 3 then 3 else 2 end', val)
    ).toBe(2);
    const rule = `case
                    when light = 'Green' then 'Go'
                    when light = 'Yellow' then 'Should Stop'
                    when light = 'Red' then 'Stop'
                    else 'Invalid State' end`;
    val = { light: 'Yellow' };
    expect(evaluateObject(rule, val)).toBe('Should Stop');
    val = { light: 'Green' };
    expect(evaluateObject(rule, val)).toBe('Go');
    val = { light: 'Red' };
    expect(evaluateObject(rule, val)).toBe('Stop');
    val = { light: 'Blue' };
    expect(evaluateObject(rule, val)).toBe('Invalid State');
  });
  it('should evaluate in expressions', () => {
    let val: any = { a: 1, b: 3, c: [2, 3, 5] };
    const rule = `b in (1,2,3,4,5)`;
    expect(evaluateObject(`b in (1,2,3,4,5)`, val)).toBe(true);
    val = { light: 'Blue' };
    expect(evaluateObject(`b in (1,2,3,4,5)`, val)).toBe(false);
    val = { b: ['oj', 'oj', 'pl'] };
    expect(evaluateObject(`b in (1,2,3,4,5)`, val)).toBe(false);
    expect(evaluateObject(`b in (oj,pl)`, val)).toBe(false);
    val = { b: 'Blue' };
    expect(evaluateObject(`b in ('Blue','Green')`, val)).toBe(true);
    val = { b: 'Green' };
    expect(evaluateObject(`b in ('Blue','Green', "Yellow")`, val)).toBe(true);
    val = { b: 'Green' };
    expect(evaluateObject(`b not in ('Blue','Green', "RED")`, val)).toBe(false);
    val = { a: 'Green' };
    expect(evaluateObject(`b not in ('Blue','Green', "RED")`, val)).toBe(false);
  });
  it('should evaluate has expressions', () => {
    let val: any = { a: { x: 7 } };
    expect(evaluateObject(`a has x = 7`, val)).toBe(true);
    val = { a: [] };
    expect(evaluateObject(`a has x = 7`, val)).toBe(false);
    val = { a: [{ x: 8 }] };
    expect(evaluateObject(`a has x = 7`, val)).toBe(false);
    val = { a: [{ x: '7' }] };
    expect(evaluateObject(`a has x = "7"`, val)).toBe(true);
    val = { a: [{ x: 7 }, { y: 9 }] };
    expect(evaluateObject(`a has x = 7`, val)).toBe(true);
    val = { a: [{ x: 7 }, { x: 7 }] };
    expect(evaluateObject(`a has x = 7`, val)).toBe(true);
    val = { a: [{ x: 7 }, { y: 9 }] };
    expect(evaluateObject(`a has x = 5 or a has y = 9`, val)).toBe(true);
    val = { a: [{ x: 7 }, { y: 9 }] };
    expect(evaluateObject(`a has x = 5 and a has y = 9`, val)).toBe(false);
    val = { a: 2 };
    expect(evaluateObject(`a has x = 5 or a has y = 9 and b = 8`, val)).toBe(
      false
    );
    val = { a: [{ x: 5 }, { x: 4 }, { y: 8 }], b: 8 };
    expect(evaluateObject(`a has x = 5 or a has y = 9 and b = 8`, val)).toBe(
      true
    );
    val = { a: [2, 3, 4], b: 8 };
    expect(evaluateObject(`a has 5 or a has 2 and b = 8`, val)).toBe(true);
    val = { a: [2, 3, 4], b: 8 };
    expect(evaluateObject(`a has 5 and a has 2 or b = 8`, val)).toBe(false);
    val = { a: [2, 3, 4], b: 8 };
    expect(evaluateObject(`a has 5 and a has 2 and b = 8`, val)).toBe(false);
    val = { a: ['2', 3, 4], b: 8 };
    expect(evaluateObject(`a has 4 and a has 2 and b = 8`, val)).toBe(false);
    val = { a: ['5'], b: 8 };
    expect(evaluateObject(`a has "5" and b = 8`, val)).toBe(true);
    val = { a: ['5', { x: 2 }], b: 8 };
    expect(evaluateObject(`a has "5" or a has x = 2 and b = 8`, val)).toBe(
      true
    );
    val = { a: ['5', { x: 2 }], b: 8 };
    expect(evaluateObject(`a has "5" and a has x = 2`, val)).toBe(true);
    val = { a: ['5'] };
    expect(evaluateObject(`a has "5" or a has 3`, val)).toBe(true);
    val = { a: ['5'] };
    expect(evaluateObject(`a has "5" and a has 3`, val)).toBe(false);
    val = {};
    expect(evaluateObject(`a has "5" and a has 3`, val)).toBe(false);
    val = { a: {} };
    expect(evaluateObject(`a has "5" or a has 3`, val)).toBe(false);
    val = { a: { x: 5 } };
    expect(evaluateObject(`a has "5" or a has 3`, val)).toBe(false);
    val = {};
    expect(evaluateObject(`a has "5" or a has 3`, val)).toBe(false);
    val = {};
    expect(evaluateObject(`a not has "5" or a has 3`, val)).toBe(false);
    val = { a: [{ x: 5 }, { x: 2 }] };
    expect(evaluateObject(`a not has x = 5`, val)).toBe(false);
    val = { a: { x: 5 } };
    expect(evaluateObject(`a not has x = 5 or a has 3`, val)).toBe(false);
    val = { a: [{ x: 5 }, { x: 2 }] };
    expect(evaluateObject(`a not has x = 5 or a has x = 2`, val)).toBe(true);
    val = { a: [{ x: 5 }, { x: 2 }] };
    expect(evaluateObject(`a not has x = 5 and a not has x = 2`, val)).toBe(
      false
    );
    val = { a: [{ x: 1 }, { x: 4 }] };
    expect(evaluateObject(`a not has x = 5 and a not has x = 2`, val)).toBe(
      true
    );
  });
});
