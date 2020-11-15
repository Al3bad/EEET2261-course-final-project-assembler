# Assembler

### Project description

This little script is assembler for a custom designed instruction set. It is a part of a final project in Computer Architecture & Organization course, it was not a part of the assignment and was built just for fun.

### requirements

- [Node JS](https://nodejs.org/)

### supported/Designed registers

register name | mode
------------ | -------------
z0 | Read only (zero)
a0 | Read/Write
a1  | Read/Write
a2  | Read/Write

### Supported/Designed instructions

instruction | name
------------ | -------------
ADD | Addition
SUB | Subtraction
LA  | Load address
LW  | Load word
SW  | Store word
JMP | Jump
BNE | Branch if not equal
BLT | Branch if less then

### Instruction formats

This script will assemble the instructions in 'program.asm' into those instruction formats:

![Instruction formats](/imgs/instruction-formats.png)

### Usage

Both the script and the assembly code should be in the same directory, and the program should be named "program.asm". Run this command in the terminal:

```
node index.js [options]
```

The script can take three options:


option       | values (default)       | description
------------ | ------------- | -------------
-radix       | BIN or HEX or UNS (BIN) | The representation of the assembled instructions values
-mif         | 0 or 1 (0) | If 1, the output will be a .mif file that can be understood and used in Quartus Prime software
-depth       | <number> (256) | The number of addresses in ROM (will be used only if -mif is 1)


### Examples

Here is a small program that is written in program.asm:

```
# program.asm
# This is test comment

LA    a0, 0
lw    a1, 1(a0)
lw    a0, 0(a0)

jmp   8

blt   a0, a1, 7

sub   a0, a0, a1

jmp   8

sub   a1, a1, a0

bne   a0, a1, 4

la    a1, 0
sw    a0, 2(a1)
lw    a1, 2(a0)
```

The below command will assemble the program to raw binary representation:

```
node index.js
```

OUTPUT (output.txt):

```
0000000000001001
0000000010110010
0000000000101010
0000010000000100
0000001110110110
0000001100101000
0000010000000100
0000001011010000
0000001000110101
0000000000010001
0000000100110011
0000000100110010
```

if we want the output to be in hexadecimal representation and use it in Quartus Prime software, we write this command:

```
node index.js -radix HEX -mif 1
```

OUTPUT (output.mif):

```
WIDTH=16;
DEPTH=256;

ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;

CONTENT BEGIN
	0	:	0009;
	1	:	00B2;
	2	:	002A;
	3	:	0404;
	4	:	03B6;
	5	:	0328;
	6	:	0404;
	7	:	02D0;
	8	:	0235;
	9	:	0011;
	10	:	0133;
	11	:	0132;
	[12..255]	:	0000;
END;
```

### Limitations

- This program has very basic error checking
- It doesn't support labels, so for jump and brach instructions, you need to specify the index of the instruction that you want to jump or branch to explicitly in the program.