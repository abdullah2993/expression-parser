import { TokenType } from './token';

export type Expression = BinaryExpression | UnaryExpression | ValueExpression | FunctionCallExpression | IdentifierExpression;

export interface Node {
  readonly type: 'BinaryExpression' | 'UnaryExpression' | 'ValueExpression' | 'FunctionCallExpression' | 'IdentifierExpression';
}

export class BinaryExpression implements Node {
  constructor(public operator: TokenType, public left: Expression, public right: Expression) { }

  readonly type = 'BinaryExpression';
}

export class UnaryExpression implements Node {
  constructor(public operator: TokenType, public operand: Expression) { }

  readonly type = 'UnaryExpression';
}

export class ValueExpression implements Node {
  constructor(public value: any) { }

  readonly type = 'ValueExpression';
}

export class FunctionCallExpression implements Node {
  constructor(public name: string, public args: Expression[]) { }

  readonly type = 'FunctionCallExpression';
}

export class IdentifierExpression implements Node {
  constructor(public name: string) { }

  readonly type = 'IdentifierExpression';
}
