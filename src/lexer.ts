import { Token, TokenType } from './token';

export interface Tokenizer {
  next(): Token;
}

export class Lexer {
  private position: number = 0;

  private readPosition: number = 0;

  private currentChar: string = '\0';

  constructor(private text: string) {
    this.readChar();
  }

  next(): Token {
    let token: Token;

    this.skipWhiteSpace();

    switch (this.currentChar) {
      case '=':
        token = this.getToken(TokenType.Eq);
        break;
      case '<':
        if (this.peekChar() === '>') {
          this.readChar();
          token = this.getToken(TokenType.Neq);
        } else if (this.peekChar() === '=') {
          this.readChar();
          token = this.getToken(TokenType.Lte);
        } else {
          token = this.getToken(TokenType.Lt);
        }
        break;
      case '>':
        if (this.peekChar() === '=') {
          this.readChar();
          token = this.getToken(TokenType.Gte);
        } else {
          token = this.getToken(TokenType.Gt);
        }
        break;
      case '"':
      case "'": {
        const unquotedValue = this.readString(this.currentChar);
        token = this.getToken(TokenType.String, unquotedValue);
        break;
      }
      case '+':
        token = this.getToken(TokenType.Plus);
        break;
      case '-':
        token = this.getToken(TokenType.Minus);
        break;
      case '*':
        token = this.getToken(TokenType.Mul);
        break;
      case '/':
        token = this.getToken(TokenType.Div);
        break;
      case '(':
        token = this.getToken(TokenType.Lparn);
        break;
      case ')':
        token = this.getToken(TokenType.Rparn);
        break;
      case ',':
        token = this.getToken(TokenType.Comma);
        break;
      case '\0':
        token = this.getToken(TokenType.EOF, '\0');
        break;
      default:
        if (Lexer.isLetter(this.currentChar)) {
          const ident = this.readIdentifier();
          const identType = Lexer.resolveIdentifier(ident);
          if (identType === TokenType.Identifier) {
            token = this.getToken(TokenType.Identifier, ident);
          } else {
            token = this.getToken(identType);
          }
        } else if (
          Lexer.isNumber(this.currentChar) ||
          Lexer.isDot(this.currentChar)
        ) {
          const num = this.readNumber();
          token = this.getToken(TokenType.Numeric, num);
        } else {
          token = this.getToken(TokenType.Illegal, this.currentChar);
        }
    }
    this.readChar();

    return token;
  }

  private readChar(): void {
    if (this.readPosition >= this.text.length) {
      this.currentChar = '\0';
    } else {
      this.currentChar = this.text[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition++;
  }

  private peekChar(): string {
    if (this.readPosition >= this.text.length) {
      return '\0';
    }
    return this.text[this.readPosition];
  }

  private skipWhiteSpace(): void {
    while (Lexer.isWhiteSpace(this.currentChar)) {
      this.readChar();
    }
  }

  private readString(quote: "'" | '"'): string {
    const start = this.position + 1;
    do {
      this.readChar();
    } while (this.currentChar !== quote && this.currentChar !== '\0');
    return this.text.substring(start, this.position);
  }

  private readIdentifier(): string {
    const start = this.position;
    while (Lexer.isLetter(this.peekChar())) {
      this.readChar();
    }
    return this.text.substring(start, this.position + 1);
  }

  private readNumber(): string {
    const start = this.position;
    let haveDecimal = Lexer.isDot(this.currentChar);
    while (
      Lexer.isNumber(this.peekChar()) ||
      (Lexer.isDot(this.peekChar()) && !haveDecimal)
    ) {
      if (Lexer.isDot(this.currentChar)) {
        haveDecimal = true;
      }
      this.readChar();
    }
    return this.text.substring(start, this.position + 1);
  }

  private getToken(type: TokenType, literal?: string) {
    const exactLiteral = literal ?? type;
    const adjustment = type === TokenType.String ? 0 : 1;
    const postion = this.position + adjustment - exactLiteral.length;
    return new Token(type, exactLiteral, postion);
  }

  private static isWhiteSpace(charStr: string): boolean {
    const charCode = charStr.charCodeAt(0);
    return (
      charCode === 0x09 || // '\t'
      charCode === 0x0a || // '\n'
      charCode === 0x0d || // '\r'
      charCode === 0x20 // ' '
    );
  }

  private static isNumber(charStr: string): boolean {
    const charCode = charStr.charCodeAt(0);
    return charCode >= 0x30 && charCode <= 0x39; // '0'-'9'
  }

  private static isLetter(charStr: string): boolean {
    const charCode = charStr.charCodeAt(0);
    return (
      (charCode >= 0x41 && charCode <= 0x5a) || // A-Z
      (charCode >= 0x61 && charCode <= 0x7a) || // a-z
      charCode === 0x5f // '_'
    );
  }

  private static isDot(charStr: string): boolean {
    return charStr === '.';
  }

  private static keywords: { [key: string]: TokenType } = {
    and: TokenType.And,
    or: TokenType.Or,
    not: TokenType.Not,
    true: TokenType.True,
    false: TokenType.False,
    is: TokenType.Is,
    between: TokenType.Between,
    null: TokenType.Null,
    case: TokenType.Case,
    when: TokenType.When,
    else: TokenType.Else,
    end: TokenType.End,
    then: TokenType.Then,
    in: TokenType.In,
  };

  private static resolveIdentifier(ident: string): TokenType {
    const tokenType = Lexer.keywords[ident.toLowerCase()];
    if (tokenType) {
      return tokenType;
    }
    return TokenType.Identifier;
  }
}
