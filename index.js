const fs = require("fs");
const readline = require("readline");

// instructions supported by the CPU
const opcodes = { ADD: "000", SUB: "000", LA: "001", LW: "010", SW: "011", JMP: "100", BNE: "101", BLT: "110" };

// registers supported by the CPU
const registers = { z0: "00", a0: "01", a1: "10", a2: "11" };

// assembled program output stream
const outputStream = fs.createWriteStream("output.txt");

// open & read assembly code
const lineReader = readline.createInterface({
  input: fs.createReadStream("program.asm"),
});

// process each line
lineReader.on("line", (line) => {
  // Skip empty lines
  if (line.length === 0) return;

  // Skip if comment
  if (line.trim()[0] === "#") return;

  console.log("Instruction:\t", line);

  // Seperte opcode from arguments
  const instruction = line.trim().split(" ");
  const opcode = instruction.shift().toUpperCase();
  const args = instruction.join("").split(",");

  let inst = "";

  if (opcode === "ADD" || opcode === "SUB") {
    const func = opcode === "ADD" ? "00" : "01";
    inst = "0" + "0000" + func + registers[args[2]] + registers[args[1]] + registers[args[0]] + opcodes[opcode];
  } else if (opcode === "LA" || opcode === "LW" || opcode === "SW") {
    let rs1 = opcode === "LA" ? "z0" : args[1].split("(")[1].slice(0, 2);
    let rd = opcode !== "SW" ? args[0] : rs1;
    if (opcode === "SW") rs1 = args[0];
    let imm = opcode === "LA" ? parseInt(args[1]).toString(2) : parseInt(args[1].split("(")[0]).toString(2);
    while (imm.length < 8) imm = "0" + imm;
    inst = "0" + imm + registers[rs1] + registers[rd] + opcodes[opcode];
  } else if (opcode === "JMP") {
    let imm = parseInt(args[0]).toString(2);
    while (imm.length < 8) imm = "0" + imm;
    inst = "0" + imm + "00" + "00" + opcodes[opcode];
  } else if (opcode === "BNE" || "BLE") {
    let imm = parseInt(args[2]).toString(2);
    while (imm.length < 8) imm = "0" + imm;
    inst = "0" + imm + registers[args[0]] + registers[args[1]] + opcodes[opcode];
  } else {
    console.log("ERROR: Invalid Instruction!");
  }

  console.log("Binary Encoding:", inst);

  console.log("===================================");
  outputStream.write(inst);
  outputStream.write("\n");
});

// print "DONE" at the end of the process
lineReader.on("close", () => {
  console.log("\x1b[32m\t%s\x1b[0m", "----- [DONE] -----"); //yellow
});
