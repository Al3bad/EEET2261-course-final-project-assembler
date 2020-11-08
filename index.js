var lineReader = require("readline").createInterface({
  input: require("fs").createReadStream("program.asm"),
});

lineReader.on("line", function (line) {
  console.log("Line from file:", line);
});
