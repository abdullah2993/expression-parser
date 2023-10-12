import { Lexer } from '../src/lexer';
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
  it('should parse basic expressions with floating point numbers', () => {
    const lexer = new Lexer('1.0 = 1.1 = 0.1333 = .64');
    let token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('1.0');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Eq);
    expect(token.literal).toEqual('=');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('1.1');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Eq);
    expect(token.literal).toEqual('=');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('0.1333');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Eq);
    expect(token.literal).toEqual('=');
    token = lexer.next();
    expect(token.type).toEqual(TokenType.Numeric);
    expect(token.literal).toEqual('.64');
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
      'a>1 and b<c or g <> "xyz" ( a + b - c *d /f) <> abc  and a > 1.3 a>= .1988 and bxx<=2 and e=true not FALSE is between 1 null and b in (1,2,3) or a has x = 5 or a not has 9'
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
      new Token(TokenType.Numeric, '1.3', 61),
      new Token(TokenType.Identifier, 'a', 65),
      new Token(TokenType.Gte, '>=', 66),
      new Token(TokenType.Numeric, '.1988', 69),
      new Token(TokenType.And, 'and', 75),
      new Token(TokenType.Identifier, 'bxx', 79),
      new Token(TokenType.Lte, '<=', 82),
      new Token(TokenType.Numeric, '2', 84),
      new Token(TokenType.And, 'and', 86),
      new Token(TokenType.Identifier, 'e', 90),
      new Token(TokenType.Eq, '=', 91),
      new Token(TokenType.True, 'true', 92),
      new Token(TokenType.Not, 'not', 97),
      new Token(TokenType.False, 'false', 101),
      new Token(TokenType.Is, 'is', 107),
      new Token(TokenType.Between, 'between', 110),
      new Token(TokenType.Numeric, '1', 118),
      new Token(TokenType.Null, 'null', 120),
      new Token(TokenType.And, 'and', 125),
      new Token(TokenType.Identifier, 'b', 129),
      new Token(TokenType.In, 'in', 131),
      new Token(TokenType.Lparn, '(', 134),
      new Token(TokenType.Numeric, '1', 135),
      new Token(TokenType.Comma, ',', 136),
      new Token(TokenType.Numeric, '2', 137),
      new Token(TokenType.Comma, ',', 138),
      new Token(TokenType.Numeric, '3', 139),
      new Token(TokenType.Rparn, ')', 140),

      new Token(TokenType.Or, 'or', 142),
      new Token(TokenType.Identifier, 'a', 145),
      new Token(TokenType.Has, 'has', 147),
      new Token(TokenType.Identifier, 'x', 151),
      new Token(TokenType.Eq, '=', 153),
      new Token(TokenType.Numeric, '5', 155),

      new Token(TokenType.Or, 'or', 157),
      new Token(TokenType.Identifier, 'a', 160),
      new Token(TokenType.Not, 'not', 162),
      new Token(TokenType.Has, 'has', 166),
      new Token(TokenType.Numeric, '9', 170),
      new Token(TokenType.EOF, '\0', 171),
    ];

    expected.forEach((tok) => {
      const token = lexer.next();
      expect(token).toEqual(tok);
    });
  });
});
