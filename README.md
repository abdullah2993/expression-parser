# expression-parser [![Build](https://github.com/abdullah2993/expression-parser/actions/workflows/build.yaml/badge.svg)](https://github.com/abdullah2993/expression-parser/actions/workflows/build.yaml)

An expression evaluator written in typescript with the goal to support `SQL` like `WHERE` clauses.

## Installation

```
npm install --save @abdullah2993/expression-parser
```

## Supported Operations and Functions

### Arithmetics

- `+`
- `-`
- `*`
- `/`

### Comparison

- `=`
- `<>`
- `>`
- `>=`
- `<=`

### Logical

- `and`
- `or`

### SQL

- `IS NULL`
- `IS NOT NULL`
- `BETWEEN [NUMBER] AND [NUMBER]`
- `CASE WHEN expression THEN expression [WHEN expression] [ELSE expression] END`

### Functions

Currently only function that is evaluated is the `LENGTH(variable)` function but supports function calls at the parser level so it is fairly easy to add more `SQL` functions.

## Examples

```js

/** Basic Math **/
evaluate('1+2'));
// 3
evaluate('10 + 2 * 6'));
// 22
evaluate('100 * 2 + 12'));
// 212
evaluate('100 * ( 2 + 12 )'));
// 1400
evaluate('100 * ( 2 + 12 ) / 14'));
// 100


/** Basic Math With Variable Substitution**/

const context = {
  a: 1, b: 2, c: 10, d: 6, e: 100, f: 12, g: 14,
};

evaluateObject('a+b', context));
// 3
evaluateObject('c + b * d', context));
// 22
evaluateObject('e * b + f', context));
// 212
evaluateObject('e * ( b + f )', context));
// 1400
evaluateObject('e * ( b + f ) / g', context));
// 100

/** Other Operations **/
const val: any = { a: null };
evaluateObject('a is not null and length(a) between 4 and 10', val);
// false
const val = { a: '123' };
evaluateObject('a is not null and length(a) between 4 and 10', val);
// false
const val = { a: '1234' };
evaluateObject('a is not null and length(a) between 4 and 10', val);
// true
const val = { a: '1234567890' };
evaluateObject('a is not null and length(a) between 4 and 10', val);
// true
const val = { a: '12345678901' };
evaluateObject('a is not null and length(a) between 4 and 10', val);
// false
const val: any = { a: 1, b: 1 };
evaluateObject('a is not null and b is not null', val);
// true
evaluateObject('a is not null and b is null', val);
// false
const val = { a: 1, b: null };
evaluateObject('a is not null and b is null', val);
// true
const val = { a: 1, b: 1 };
evaluateObject('a=b', val));
// true
evaluateObject('a>b', val));
// false
evaluateObject('a<b', val));
// false
const val = { a: 1, b: 2 };
evaluateObject('a=b', val);
// false
evaluateObject('a>b', val);
// false
evaluateObject('a<b', val);
// true

const val = { a: 1, b: 3 };
evaluateObject('case when a > 1 then true else false end', val);
// false
const val = { a: 2, b: 3 };
evaluateObject('case when a > 1 then true else false end', val);
// true
val = { a: 2, b: 3 };
evaluateObject('case when a = 1 then 1 when a = 2 then 1 else false end', val);
// 1
evaluateObject('case when a = 1 then 1 when a = 2 then 2 else 3 end', val);
// 2
evaluateObject('case when a = 1 then 1 when a = 3 then 3 else 2 end', val);
// 2
const rule = `case
                when light = 'Green' then 'Go'
                when light = 'Yellow' then 'Should Stop'
                when light = 'Red' then 'Stop'
                else 'Invalid State' end`;
val = { light: 'Yellow' };
evaluateObject(rule, val))
// 'Should Stop'
val = { light: 'Green' };
evaluateObject(rule, val))
// 'Go'
val = { light: 'Red' };
evaluateObject(rule, val))
// 'Stop'
val = { light: 'Blue' };
evaluateObject(rule, val))
// 'Invalid State'

```

## Sample AST

```json
//Expression: a is not null and length(a) between 4 and 10
{
  "operator": "and",
  "left": {
    "operator": "<>",
    "left": {
      "name": "a",
      "type": "IdentifierExpression"
    },
    "right": {
      "value": null,
      "type": "ValueExpression"
    },
    "type": "BinaryExpression"
  },
  "right": {
    "operator": "and",
    "left": {
      "operator": ">=",
      "left": {
        "name": "length",
        "args": [
          {
            "name": "a",
            "type": "IdentifierExpression"
          }
        ],
        "type": "FunctionCallExpression"
      },
      "right": {
        "value": 4,
        "type": "ValueExpression"
      },
      "type": "BinaryExpression"
    },
    "right": {
      "operator": "<=",
      "left": {
        "name": "length",
        "args": [
          {
            "name": "a",
            "type": "IdentifierExpression"
          }
        ],
        "type": "FunctionCallExpression"
      },
      "right": {
        "value": 10,
        "type": "ValueExpression"
      },
      "type": "BinaryExpression"
    },
    "type": "BinaryExpression"
  },
  "type": "BinaryExpression"
}
```

## Test Coverage

```
13 specs, 0 failures
Finished in 0.069 seconds
Randomized with seed 62175 (jasmine --random=true --seed=62175)
--------------|---------|----------|---------|---------|-----------------------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|-----------------------------------
All files     |   93.24 |    83.33 |   92.73 |   93.19 |
 ast.ts       |   89.66 |      100 |      90 |      90 | 16-18
 evaluator.ts |      85 |    69.23 |     100 |   84.21 | 14,18,27,47-49,64
 lexer.ts     |   99.04 |       98 |     100 |   99.03 | 86
 parser.ts    |   89.89 |       70 |   89.47 |   89.41 | 83,91,103,121,133,137,144,181,184
 token.ts     |   97.06 |      100 |      75 |   96.97 | 44
--------------|---------|----------|---------|---------|-----------------------------------
```
