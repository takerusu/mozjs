var parser: MozManager = require("./Moz.js");

var text =`
* aaaa
  - bb
  - cc`
var config = {
  // mozPath: "../nez-1/javascript4.moz",
  // mozPath: "../nez-1/json.moz",
  mozPath: "../nez-1/nez.moz",
  // inputPath: "../bench/input/js/jquery-2.1.1.js",
  // inputPath: "../nez-1/mytest/jsoncoffee/earthquake.geojson",
  inputPath: "../nez-1/mytest/nezrule.nez",
  // inputText: text,
  stat: false,
  repetition: 1,
};

for (var i = 2; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case "-p":
    case "-g":
      i++;
      config.mozPath = "./" + process.argv[i];
      break;
    case "-i":
      i++;
      config.inputPath = "./" + process.argv[i];
      break;
    case "-n":
      i++;
      config.repetition = parseInt(process.argv[i]);
      break;
    case "-s":
      config.stat = true;
      break;
    default:

  }
}

var ast = parser.parse(config);
// var c = require("./Compiler.js");
// c.visit.Production(ast.value[0]);
// console.log(c.codeList)
