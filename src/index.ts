import { evaluate } from "./evaluator";

console.log(evaluate('1+2', (x)=>{console.log(x)}));

console.log(evaluate("10 + 2 * 6"))
console.log(evaluate("100 * 2 + 12"))
console.log(evaluate("100 * ( 2 + 12 )"))
console.log(evaluate("100 * ( 2 + 12 ) / 14"))
