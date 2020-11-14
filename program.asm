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