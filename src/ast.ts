import { TokenType } from './token';

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | ValueExpression
  | FunctionCallExpression
  | IdentifierExpression
  | CaseExpression
  | InExpression
  | GroupExpression
  | NotExpression;

export interface Node {
  readonly type:
    | 'BinaryExpression'
    | 'UnaryExpression'
    | 'ValueExpression'
    | 'FunctionCallExpression'
    | 'IdentifierExpression'
    | 'CaseExpression'
    | 'InExpression'
    | 'GroupExpression'
    | 'NotExpression';
}

export class BinaryExpression implements Node {
  constructor(public operator: TokenType, public left: Expression, public right: Expression) {}

  readonly type = 'BinaryExpression';
}

export class UnaryExpression implements Node {
  constructor(public operator: TokenType, public operand: Expression) {}

  readonly type = 'UnaryExpression';
}

export class ValueExpression implements Node {
  constructor(public value: any) {}

  readonly type = 'ValueExpression';
}

export class FunctionCallExpression implements Node {
  constructor(public name: string, public args: Expression[]) {}

  readonly type = 'FunctionCallExpression';
}

export class IdentifierExpression implements Node {
  constructor(public name: string) {}

  readonly type = 'IdentifierExpression';
}
export class CaseExpression implements Node {
  constructor(public conditions: { when: Expression; then: Expression }[], public last?: Expression) {}

  readonly type = 'CaseExpression';
}

export class InExpression implements Node {
  constructor(
    public left: IdentifierExpression | GroupExpression,
    public right: IdentifierExpression | GroupExpression
  ) {}

  readonly type = 'InExpression';
}

export class NotExpression implements Node {
  constructor(public expression: Expression) {}

  readonly type = 'NotExpression';
}

export class GroupExpression implements Node {
  constructor(public values: Expression[]) {}

  readonly type = 'GroupExpression';
}
