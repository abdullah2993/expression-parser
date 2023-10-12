/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  BinaryExpression,
  CaseExpression,
  InExpression,
  HasExpression,
  Expression,
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

function evaluateInExpression(
  expression: InExpression,
  context?: (identifier: string) => any
): any {
  const operator = expression.operator;
  const value = evaluateExpression(expression.identifier, context);
  if (value == null) {
    return false;
  }
  const values = expression.values.map((v) => evaluateExpression(v, context));
  const index = values.indexOf(value);
  return operator === TokenType.Not ? index === -1 : index !== -1;
}

function evaluateHasExpression(
  expression: HasExpression,
  context?: (identifier: string) => any
): any {
  const value = evaluateExpression(expression.identifier, context);
  const isArray = Array.isArray(value);
  if (!isArray && (typeof value !== 'object' || value === null)) {
    return false;
  }

  const isValue = expression.condition.type === 'ValueExpression';
  const condition = isArray
    ? value.some((v: any) =>
        isValue
          ? v === evaluateExpression(expression.condition, context)
          : evaluateExpression(expression.condition, (name: any) => v[name])
      )
    : isValue
    ? value === evaluateExpression(expression.condition, context)
    : evaluateExpression(expression.condition, (name: any) => value[name]);
  return expression.operator === TokenType.Not ? !condition : condition;
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
    case 'HasExpression':
      return evaluateHasExpression(expression, context);
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
