export enum TokenType {
  Illegal = 'ILLEGAL',
  EOF = 'EOF',

  Identifier = 'IDENT',
  String = 'STR',
  Numeric = 'NUM',

  Plus = '+',
  Minus = '-',
  Mul = '*',
  Div = '/',

  Eq = '=',
  Neq = '<>',
  Gt = '>',
  Lt = '<',
  Gte = '>=',
  Lte = '<=',

  Lparn = '(',
  Rparn = ')',

  And = 'and',
  Or = 'or',
  Not = 'not',

  True = 'true',
  False = 'false',

  Between = 'between',
  Is = 'is',
  Null = 'null',

  Comma = ',',

  Case = 'case',
  When = 'when',
  Else = 'else',
  End = 'end',
  Then = 'then',
}

export class Token {
  constructor(
    public type: TokenType,
    public literal: string,
    public position: Number,
  ) {}

  toString(): string {
    return `{ type: ${this.type}, literal: ${this.literal} } as position: ${this.position}.`;
  }
}
