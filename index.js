const fs = require("fs");
const readline = require("readline");

let index = 0;
const validOptions = ["radix", "mif", "depth"];
const validRadix = ["UNS", "HEX", "BIN"];

const fillZeros = (radix) => {
  if (radix === "BIN") return "0000000000000000";
  if (radix === "HEX") return "0000";
  if (radix === "UNS") return "0";
};

const getArgs = (nodeArgs) => {
  console.log(nodeArgs);
  const args = {};

  for (let i = 0; i < nodeArgs.length; i++) {
    const element = nodeArgs[i];
    let option, value;
    if (element[0] === "-") {
      option = element.slice(1);
      value = nodeArgs[i + 1];

      if (!validOptions.includes(option)) {
        console.log(`ERROR: The provided option '${option}' is invalid!`);
        process.exit(1);
      }

      args[option] = value;
    }
  }
  return args;
};

const args = getArgs(process.argv.slice(2));

if (args.radix && !validRadix.includes(args.radix.toUpperCase())) {
  console.log(`ERROR: The radix value '${args.radix}' is invalid!`);
  process.exit(1);
}

const radix = args.radix ? args.radix.toUpperCase() : "BIN";

console.log("Process arguments:\t", args);

// instructions supported by the CPU
const opcodes = { ADD: "000", SUB: "000", LA: "001", LW: "010", SW: "011", JMP: "100", BNE: "101", BLT: "110" };

// registers supported by the CPU
const registers = { z0: "00", a0: "01", a1: "10", a2: "11" };

// assembled program output stream
const filename = args.mif === "1" ? "output.mif" : "output.txt";
const outputStream = fs.createWriteStream(filename);

if (args.mif === "1") {
  outputStream.write("WIDTH=16;\n");
  outputStream.write(`DEPTH=${args.depth ? args.depth : "256"};\n`);
  outputStream.write("\n");
  outputStream.write(`ADDRESS_RADIX=UNS;\n`);
  outputStream.write(`DATA_RADIX=${radix};\n`);
  outputStream.write("\n");
  outputStream.write(`CONTENT BEGIN\n`);
}

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

  // Seperte opcode from arguments
  const instruction = line.trim().split(" ");
  const opcode = instruction.shift().toUpperCase();
  const instArgs = instruction.join("").split(",");

  let inst = "";
  let instDec = 0;
  let instHex = "";

  if (opcode === "ADD" || opcode === "SUB") {
    const func = opcode === "ADD" ? "00" : "01";
    inst =
      "0" + "0000" + func + registers[instArgs[2]] + registers[instArgs[1]] + registers[instArgs[0]] + opcodes[opcode];
  } else if (opcode === "LA" || opcode === "LW" || opcode === "SW") {
    let rs1 = opcode === "LA" ? "z0" : instArgs[1].split("(")[1].slice(0, 2);
    let rd = opcode !== "SW" ? instArgs[0] : rs1;
    if (opcode === "SW") rs1 = instArgs[0];
    let imm = opcode === "LA" ? parseInt(instArgs[1]).toString(2) : parseInt(instArgs[1].split("(")[0]).toString(2);
    while (imm.length < 8) imm = "0" + imm;
    inst = "0" + imm + registers[rs1] + registers[rd] + opcodes[opcode];
  } else if (opcode === "JMP") {
    let imm = parseInt(instArgs[0]).toString(2);
    while (imm.length < 8) imm = "0" + imm;
    inst = "0" + imm + "00" + "00" + opcodes[opcode];
  } else if (opcode === "BNE" || "BLE") {
    let imm = parseInt(instArgs[2]).toString(2);
    while (imm.length < 8) imm = "0" + imm;
    inst = "0" + imm + registers[instArgs[0]] + registers[instArgs[1]] + opcodes[opcode];
  } else {
    console.log("ERROR: Invalid Instruction!");
  }

  if (radix === "UNS" || radix === "HEX") {
    for (let i = inst.length - 1; i > 0; i--) {
      if (inst[i] === "1") instDec += Math.pow(2, 15 - i);
    }

    if (radix === "HEX") {
      instHex = instDec.toString(16).toUpperCase();
      while (instHex.length < 4) instHex = "0" + instHex;
      inst = instHex;
    } else inst = instDec.toString(10);
  }

  try {
    if (args.mif === "1") {
      inst = `\t${index}\t:\t${inst};`;
      index++;
    }
    outputStream.write(inst);
    outputStream.write("\n");
  } catch (err) {
    console.log(err);
  }
});

// print "DONE" at the end of the process
lineReader.on("close", () => {
  try {
    if (args.mif === "1") {
      if (index < 255) {
        outputStream.write(`\t[${index}..${args.depth ? args.depth - 1 : "255"}]\t:\t${fillZeros(radix)};\n`);
      }
      outputStream.write("END;\n");
    }
  } catch (err) {
    console.log(err);
  }
  console.log("\x1b[32m\t%s\x1b[0m", "----- [DONE] -----");
});
