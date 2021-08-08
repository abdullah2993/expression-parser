import { BinaryExpression, Expression } from "./ast";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

function evaluateExpressions(expressions: Expression[], context?: (identifier: string) => any): any[] {
  return expressions.map((exp) => evaluateExpression(exp, context));
}

function evaluateFunctionCall(name: string, args: any[]): any {
  switch (name) {
    case 'length':
        if(args.length !== 1){
          throw new Error(`Length function takes exactly one argument.`);
        }
        return args[0].length;
    default:
      throw new Error(`Function ${name} not implemented`);
  }
}

function evaluateBinaryExpression(expression: BinaryExpression, context?: (identifier: string) => any): any {
  switch (expression.operator) {
    case '+':
      return evaluateExpression(expression.left,context) + evaluateExpression(expression.right, context);
    case '-':
      return evaluateExpression(expression.left,context) - evaluateExpression(expression.right, context);
    case '*':
      return evaluateExpression(expression.left,context) * evaluateExpression(expression.right, context);
    case '/':
      return evaluateExpression(expression.left,context) / evaluateExpression(expression.right, context);
    case '=':
      return evaluateExpression(expression.left,context) === evaluateExpression(expression.right, context);
    case '<>':
      return evaluateExpression(expression.left,context) !== evaluateExpression(expression.right, context);
    case '>':
      return evaluateExpression(expression.left,context) > evaluateExpression(expression.right, context);
    case '>=':
      console.log('aaaaaaaaaaaaaa');

      return evaluateExpression(expression.left,context) >= evaluateExpression(expression.right, context);
    case '<':
      return evaluateExpression(expression.left,context) < evaluateExpression(expression.right, context);
    case '<=':
      return evaluateExpression(expression.left,context) <= evaluateExpression(expression.right, context);
    case 'and':
      return evaluateExpression(expression.left,context) && evaluateExpression(expression.right, context);
    case 'or':
      return evaluateExpression(expression.left,context) || evaluateExpression(expression.right, context);
    default:
      throw new Error(`Operator ${expression.operator} not implemented`);
  }
}

function evaluateExpression(expression: Expression, context?: (identifier: string) => any): any {
  switch (expression.type) {
    case "IdentifierExpression":
      return context!(expression.name);
    case 'ValueExpression':
      return expression.value;
    case 'FunctionCallExpression':
      return evaluateFunctionCall(expression.name, evaluateExpressions(expression.args, context));
    case 'BinaryExpression':
      return evaluateBinaryExpression(expression, context);
  }
}

export function evaluate(expression: string, context?: (identifier: string) => any): any {
  const lexer = new Lexer(expression);
  const parser = new Parser(lexer);
  const ast = parser.parse();
  return evaluateExpression(ast, context);
}

export function evaluateObject(expression: string, value: any): any {
  const lexer = new Lexer(expression);
  const parser = new Parser(lexer);
  const ast = parser.parse();
  return evaluateExpression(ast, (name)=>value[name]);
}
