import Lexer from '../src/lexer';
import { Token, TokenType } from '../src/token';

describe('Lexer Tests', () => {
  it('should parse basic expressions', () => {
    const lexer = new Lexer('1 = 1');
    let token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('1');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Eq);
    expect(token.literal).toEqual('=');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('1');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.EOF);
    expect(token.literal).toEqual('\0');
  });
  it('should parse basic types expressions', () => {
    const lexer = new Lexer('999 <> "asd" ');
    let token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('999');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Neq);
    expect(token.literal).toEqual('<>');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.String);
    expect(token.literal).toEqual('asd');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.EOF);
    expect(token.literal).toEqual('\0');
  });

  it('should tokenize a complex expression', () => {
    const lexer = new Lexer(
      'a>1 and b<c or g <> "xyz" ( a + b - c *d /f) <> abc  and a > 1 a>= 1988 and bxx<=2 and e=true not FALSE',
    );
    const expected: Token[] = [
      new Token(TokenType.Identifier, 'a', 0),
      new Token(TokenType.Gt, '>', 1),
      new Token(TokenType.Numeric, '1', 2),
      new Token(TokenType.And, 'and', 4),
      new Token(TokenType.Identifier, 'b', 8),
      new Token(TokenType.Lt, '<', 9),
      new Token(TokenType.Identifier, 'c', 10),
      new Token(TokenType.Or, 'or', 12),
      new Token(TokenType.Identifier, 'g', 15),
      new Token(TokenType.Neq, '<>', 17),
      new Token(TokenType.String, 'xyz', 21),
      new Token(TokenType.Lparn, '(', 26),
      new Token(TokenType.Identifier, 'a', 28),
      new Token(TokenType.Plus, '+', 30),
      new Token(TokenType.Identifier, 'b', 32),
      new Token(TokenType.Minus, '-', 34),
      new Token(TokenType.Identifier, 'c', 36),
      new Token(TokenType.Mul, '*', 38),
      new Token(TokenType.Identifier, 'd', 39),
      new Token(TokenType.Div, '/', 41),
      new Token(TokenType.Identifier, 'f', 42),
      new Token(TokenType.Rparn, ')', 43),
      new Token(TokenType.Neq, '<>', 45),
      new Token(TokenType.Identifier, 'abc', 48),
      new Token(TokenType.And, 'and', 53),
      new Token(TokenType.Identifier, 'a', 57),
      new Token(TokenType.Gt, '>', 59),
      new Token(TokenType.Numeric, '1', 61),
      new Token(TokenType.Identifier, 'a', 63),
      new Token(TokenType.Gte, '>=', 64),
      new Token(TokenType.Numeric, '1988', 67),
      new Token(TokenType.And, 'and', 72),
      new Token(TokenType.Identifier, 'bxx', 76),
      new Token(TokenType.Lte, '<=', 79),
      new Token(TokenType.Numeric, '2', 81),
      new Token(TokenType.And, 'and', 83),
      new Token(TokenType.Identifier, 'e', 87),
      new Token(TokenType.Eq, '=', 88),
      new Token(TokenType.True, 'true', 89),
      new Token(TokenType.Not, 'not', 94),
      new Token(TokenType.False, 'false', 98),
      new Token(TokenType.EOF, '\0', 103),
    ];

    expected.forEach((tok) => {
      const token = lexer.next();
      expect(token).toEqual(tok);
    });
  });
});
