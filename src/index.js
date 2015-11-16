var parser = require("./Moz.js");
var text = "\n* aaaa\n  - bb\n  - cc";
var config = {
    mozPath: "../nez-1/nez.moz",
    inputPath: "../nez-1/mytest/nezrule.nez",
    debug: true,
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
        default:
    }
}
var ast = parser.parse(config);
