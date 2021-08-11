import {
  BinaryExpression, Expression, FunctionCallExpression, IdentifierExpression, ValueExpression,
} from './ast';
import { Lexer, Tokenizer } from './lexer';
import { Token, TokenType } from './token';

export type PrecedenceMap = { [key in TokenType]?: number };

const precedences: PrecedenceMap = {
  [TokenType.And]: 1,
  [TokenType.Or]: 2,
  [TokenType.Not]: 3,
  [TokenType.Eq]: 4,
  [TokenType.Lt]: 5,
  [TokenType.Lte]: 5,
  [TokenType.Gt]: 5,
  [TokenType.Gte]: 5,
  [TokenType.Between]: 6,
  [TokenType.Is]: 7,
  [TokenType.Plus]: 8,
  [TokenType.Minus]: 8,
  [TokenType.Mul]: 9,
  [TokenType.Div]: 9,
  [TokenType.Lparn]: 10,
};

export class Parser {
  private currentToken: Token;

  private peekToken: Token;

  get currentPrecedence(): number {
    return this.precedenceMap[this.currentToken.type] ?? 0;
  }

  get peekPrecedence(): number {
    return this.precedenceMap[this.peekToken.type] ?? 0;
  }

  private prefixParsers: { [key in TokenType]?: (...args: any[]) => Expression };

  private infixParsers: { [key in TokenType]?: (...args: any[]) => Expression };

  constructor(private lexer: Tokenizer, private precedenceMap = precedences) {
    this.currentToken = this.lexer.next();
    this.peekToken = this.lexer.next();

    this.prefixParsers = {
      [TokenType.Identifier]: this.parseIdentifier.bind(this),
      [TokenType.String]: this.parseString.bind(this),
      [TokenType.Numeric]: this.parseNumber.bind(this),
      [TokenType.Lparn]: this.parseGroupedExpression.bind(this),
      [TokenType.True]: this.parseBoolean.bind(this),
      [TokenType.False]: this.parseBoolean.bind(this),
    };

    this.infixParsers = {
      [TokenType.Plus]: this.parseInfixExpression.bind(this),
      [TokenType.Minus]: this.parseInfixExpression.bind(this),
      [TokenType.Mul]: this.parseInfixExpression.bind(this),
      [TokenType.Div]: this.parseInfixExpression.bind(this),
      [TokenType.Eq]: this.parseInfixExpression.bind(this),
      [TokenType.Neq]: this.parseInfixExpression.bind(this),
      [TokenType.Gt]: this.parseInfixExpression.bind(this),
      [TokenType.Lt]: this.parseInfixExpression.bind(this),
      [TokenType.Gte]: this.parseInfixExpression.bind(this),
      [TokenType.Lte]: this.parseInfixExpression.bind(this),
      [TokenType.And]: this.parseInfixExpression.bind(this),
      [TokenType.Or]: this.parseInfixExpression.bind(this),
      [TokenType.Is]: this.parseIsExpression.bind(this),
      [TokenType.Between]: this.parseBetweenExpression.bind(this),
      [TokenType.Lparn]: this.parseCallExpression.bind(this),
    };
  }

  parse(): Expression {
    return this.parseExpression();
  }

  parseExpression(precedence: number = 0): Expression {
    const prefixParser = this.prefixParsers[this.currentToken.type];
    if (!prefixParser) {
      throw new Error(`Unexpected start of expression: ${this.currentToken}`);
    }

    let leftExpression = prefixParser();

    while (precedence < this.peekPrecedence && !this.currentTokenIs(TokenType.EOF)) {
      const infixParser = this.infixParsers[this.peekToken.type];
      if (!infixParser) {
        return leftExpression;
      }
      this.nextToken();
      leftExpression = infixParser(leftExpression);
    }
    return leftExpression;
  }

  private nextToken(): Token {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.next();
    if (this.currentTokenIs(TokenType.Illegal)) {
      throw new Error(`Invalid input: ${this.currentToken}`);
    }
    return this.currentToken;
  }

  private currentTokenIs(type: TokenType): boolean {
    return this.currentToken.type === type;
  }

  private peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type;
  }

  private expectPeekToken(type: TokenType): Token {
    if (this.peekTokenIs(type)) {
      this.nextToken();
      return this.currentToken;
    }
    throw new Error(`Expected ${type} but got ${this.peekToken}`);
  }

  private parseIdentifier(): Expression {
    return new IdentifierExpression(this.currentToken.literal);
  }

  private parseNumber(): Expression {
    return new ValueExpression(Number(this.currentToken.literal));
  }

  private parseString(): Expression {
    return new ValueExpression(this.currentToken.literal);
  }

  private parseBoolean(): Expression {
    return new ValueExpression(Boolean(this.currentToken.literal));
  }

  private parseGroupedExpression(): Expression {
    this.nextToken();
    const expression = this.parseExpression();
    if (!this.expectPeekToken(TokenType.Rparn)) {
      throw new Error(`Expected ) but got ${this.peekToken}`);
    }
    return expression;
  }

  private parseInfixExpression(left: Expression): Expression {
    const { currentPrecedence } = this;
    const op = this.currentToken.type;
    this.nextToken();
    return new BinaryExpression(op, left, this.parseExpression(currentPrecedence));
  }

  private parseIsExpression(left: Expression): Expression {
    let op = TokenType.Eq;
    if (this.peekTokenIs(TokenType.Not)) {
      op = TokenType.Neq;
      this.nextToken();
    }
    this.expectPeekToken(TokenType.Null);
    return new BinaryExpression(op, left, new ValueExpression(null));
  }

  private parseBetweenExpression(left: Expression): Expression {
    this.expectPeekToken(TokenType.Numeric);
    const min = this.parseNumber();
    this.expectPeekToken(TokenType.And);
    this.expectPeekToken(TokenType.Numeric);
    const max = this.parseNumber();
    return new BinaryExpression(
      TokenType.And,
      new BinaryExpression(TokenType.Gte, left, min),
      new BinaryExpression(TokenType.Lte, left, max),
    );
  }

  private parseCallExpression(fn: Expression): Expression {
    if (fn.type !== 'IdentifierExpression') {
      throw new Error('Invalid parsing try for function call');
    } else if (fn.name.toLowerCase() !== 'length') {
      // TODO : add more functions
      throw new Error(`Expected LENGTH(parameter) but got ${this.currentToken}`);
    }
    this.expectPeekToken(TokenType.Identifier);
    const args = [this.parseIdentifier()];
    this.expectPeekToken(TokenType.Rparn);
    return new FunctionCallExpression(fn.name, args);
  }
}

export function parse(expression: string): Expression {
  const lexer = new Lexer(expression);
  const parser = new Parser(lexer);
  return parser.parse();
}
