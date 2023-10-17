/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  BinaryExpression,
  CaseExpression,
  InExpression,
  Expression,
  GroupExpression,
} from './ast';
import { parse } from './parser';
import { TokenType } from './token';

function evaluateExpressions(
  expressions: Expression[],
  context?: (identifier: string) => any
): any[] {
  return expressions.map((exp) => evaluateExpression(exp, context));
}

function evaluateFunctionCall(name: string, args: any[]): any {
  switch (name) {
    case 'length':
      if (args.length !== 1) {
        throw new Error('Length function takes exactly one argument.');
      }
      return args[0].length;
    default:
      throw new Error(`Function ${name} not implemented`);
  }
}

function evaluateBinaryExpression(
  expression: BinaryExpression,
  context?: (identifier: string) => any
): any {
  switch (expression.operator) {
    case '+':
      return (
        evaluateExpression(expression.left, context) +
        evaluateExpression(expression.right, context)
      );
    case '-':
      return (
        evaluateExpression(expression.left, context) -
        evaluateExpression(expression.right, context)
      );
    case '*':
      return (
        evaluateExpression(expression.left, context) *
        evaluateExpression(expression.right, context)
      );
    case '/':
      return (
        evaluateExpression(expression.left, context) /
        evaluateExpression(expression.right, context)
      );
    case '=':
      return (
        evaluateExpression(expression.left, context) ===
        evaluateExpression(expression.right, context)
      );
    case '<>':
      return (
        evaluateExpression(expression.left, context) !==
        evaluateExpression(expression.right, context)
      );
    case '>':
      return (
        evaluateExpression(expression.left, context) >
        evaluateExpression(expression.right, context)
      );
    case '>=':
      return (
        evaluateExpression(expression.left, context) >=
        evaluateExpression(expression.right, context)
      );
    case '<':
      return (
        evaluateExpression(expression.left, context) <
        evaluateExpression(expression.right, context)
      );
    case '<=':
      return (
        evaluateExpression(expression.left, context) <=
        evaluateExpression(expression.right, context)
      );
    case 'and':
      return (
        evaluateExpression(expression.left, context) &&
        evaluateExpression(expression.right, context)
      );
    case 'or':
      return (
        evaluateExpression(expression.left, context) ||
        evaluateExpression(expression.right, context)
      );
    default:
      throw new Error(`Operator ${expression.operator} not implemented`);
  }
}

function evaluateCaseExpression(
  expression: CaseExpression,
  context?: (identifier: string) => any
): any {
  for (let index = 0; index < expression.conditions.length; index++) {
    const cond = expression.conditions[index];
    if (evaluateExpression(cond.when, context)) {
      return evaluateExpression(cond.then, context);
    }
  }
  if (expression.last) {
    return evaluateExpression(expression.last, context);
  }
  return false;
}

const invalidLeftSide = 'Invalid left side of IN expression';
function evaluateInExpression(
  expression: InExpression,
  context?: (identifier: string) => any
): any {
  const { left, right } = expression;
  const leftValue = evaluateExpression(left, context);
  const rightValues = evaluateExpression(right, context);

  if (
    left.type === 'GroupExpression' &&
    right.type === 'IdentifierExpression'
  ) {
    if (!Array.isArray(leftValue)) {
      throw new Error(invalidLeftSide);
    }
    if (rightValues == null) {
      throw new Error(`${right.name} is not defined`);
    }
    if (!Array.isArray(rightValues)) {
      throw new Error('Right side of IN expression must be an array');
    }
    return leftValue.every((v) => rightValues.indexOf(v) !== -1);
  } else if (
    left.type === 'IdentifierExpression' &&
    right.type === 'GroupExpression'
  ) {
    if (leftValue == null) {
      throw new Error(`${left.name} is not defined`);
    } else {
      if (Array.isArray(leftValue)) {
        return leftValue.every((v) => rightValues.includes(v));
      } else if (typeof leftValue === 'object' && leftValue !== null) {
        throw new Error(invalidLeftSide);
      } else {
        return rightValues.includes(leftValue);
      }
    }
  } else {
    throw new Error('Invalid left or right side of IN expression');
  }
}

function evaluateGroupExpression(
  expression: GroupExpression,
  context?: (identifier: string) => any
): any {
  const values = expression.values.map((v) => evaluateExpression(v, context));
  return values;
}

function evaluateExpression(
  expression: Expression,
  context?: (identifier: string) => any
): any {
  switch (expression.type) {
    case 'IdentifierExpression':
      return context!(expression.name);
    case 'ValueExpression':
      return expression.value;
    case 'FunctionCallExpression':
      return evaluateFunctionCall(
        expression.name,
        evaluateExpressions(expression.args, context)
      );
    case 'BinaryExpression':
      return evaluateBinaryExpression(expression, context);
    case 'CaseExpression':
      return evaluateCaseExpression(expression, context);
    case 'InExpression':
      return evaluateInExpression(expression, context);
    case 'GroupExpression':
      return evaluateGroupExpression(expression, context);
    case 'NotExpression':
      return !evaluateExpression(expression.expression, context);
    default:
      throw new Error(`Invalid AST node${expression}`);
  }
}

export function evaluate(
  expression: string,
  context?: (identifier: string) => any
): any {
  const ast = parse(expression);
  return evaluateExpression(ast, context);
}

export function evaluateObject(expression: string, value: any): any {
  return evaluate(expression, (name) => value[name]);
}
