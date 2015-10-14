var parser: MozManager = require("./Moz.js");

var config = {
  mozPath: "../nez-1/javascript4.moz",
  inputPath: "../bench/input/js/jquery-2.1.1.js",
  // inputText: "var a = 0;",
  printAST: false,
  repetition: 1,
};

var ast = parser.parse(config);
console.log(ast.toString())
