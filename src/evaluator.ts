/* eslint-disable @typescript-eslint/no-use-before-define */
import { BinaryExpression, Expression } from './ast';
import { parse } from './parser';

function evaluateExpressions(expressions: Expression[], context?: (identifier: string) => any): any[] {
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

function evaluateBinaryExpression(expression: BinaryExpression, context?: (identifier: string) => any): any {
  switch (expression.operator) {
    case '+':
      return evaluateExpression(expression.left, context) + evaluateExpression(expression.right, context);
    case '-':
      return evaluateExpression(expression.left, context) - evaluateExpression(expression.right, context);
    case '*':
      return evaluateExpression(expression.left, context) * evaluateExpression(expression.right, context);
    case '/':
      return evaluateExpression(expression.left, context) / evaluateExpression(expression.right, context);
    case '=':
      return evaluateExpression(expression.left, context) === evaluateExpression(expression.right, context);
    case '<>':
      return evaluateExpression(expression.left, context) !== evaluateExpression(expression.right, context);
    case '>':
      return evaluateExpression(expression.left, context) > evaluateExpression(expression.right, context);
    case '>=':
      return evaluateExpression(expression.left, context) >= evaluateExpression(expression.right, context);
    case '<':
      return evaluateExpression(expression.left, context) < evaluateExpression(expression.right, context);
    case '<=':
      return evaluateExpression(expression.left, context) <= evaluateExpression(expression.right, context);
    case 'and':
      return evaluateExpression(expression.left, context) && evaluateExpression(expression.right, context);
    case 'or':
      return evaluateExpression(expression.left, context) || evaluateExpression(expression.right, context);
    default:
      throw new Error(`Operator ${expression.operator} not implemented`);
  }
}

function evaluateExpression(expression: Expression, context?: (identifier: string) => any): any {
  switch (expression.type) {
    case 'IdentifierExpression':
      return context!(expression.name);
    case 'ValueExpression':
      return expression.value;
    case 'FunctionCallExpression':
      return evaluateFunctionCall(expression.name, evaluateExpressions(expression.args, context));
    case 'BinaryExpression':
      return evaluateBinaryExpression(expression, context);
    default:
      throw new Error(`Invalid AST node${expression}`);
  }
}

export function evaluate(expression: string, context?: (identifier: string) => any): any {
  const ast = parse(expression);
  return evaluateExpression(ast, context);
}

export function evaluateObject(expression: string, value: any): any {
  return evaluate(expression, (name) => value[name]);
}
