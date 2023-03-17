

'''
Modified from
https://electronics.stackexchange.com/questions/139651/how-to-implement-an-8-bit-cpu

register-register instructions:

0 0 x x x x s d

where x x x x is the opcode,
d is the destination register 0 or 1,
and s is the source register 0 or 1

opcodes field:

0000  add   d = d + s
0001  adc   d = d + s + c
0010  sub   d = d - s
0011  subb  d = d - s - c
0100  and   d = d and s
0101  or    d = d or s
0110  xor   d = d xor s
0111  not   d = not s
1000  asr   s = 0   arithmetic shift right d
1000  asl   s = 1   arithmetic shift left d
1001  ror   s = 0   rotate right d
1001  rol   s = 1   rotate left d
1010  inc   s = 0   increment d
1010  dec   s = 1   decrement d
1011  cmp   d - s   (no store)
1100  inp1  s = 0   input to reg d from input port 1
1100  inp2  s = 1   input to reg d from input port 2
1101  out1  s = 0   output from reg d to output port 1
1101  out2  s = 1   output from reg d to output port 2
1110  mul   d/s = s * d  (high byte of result into d, low byte into 1-d)
1111  sec   sd = 00  set carry
1111  clc   sd = 01  clear carry
1111  ret   sd = 10  return from subroutine
1111  hlt   sd = 11  halt

0 1 0 0 n n n n

brn - unconditional branch negative -n bytes (up to -16),
used for branching back at end of a short loop after a skip
instruction
(program pointer += 1 n n n n)

0 1 0 1 b b i i

skip instructions, where
    b b is type of branch
    i i = # of bytes to skip typically 1 or 2, latter for
    skipping over jump/call)

b b field:

00  scs skip i bytes if carry set
01  scc skip i bytes if carry clear
10  szs skip i bytes if zero bit set
11  szc skip i bytes if zero bit clear

0 1 1 n n n n d

load immediate to register r (0 or 1) signed value nnnn
+15 to -16

1 0 x a a a a a

jump or call instruction (x = 0 is jump, 1 is call)
p is reserved for a page bit (or could just be the high
bit of address).  12 bits of address provide a direct call
or jump to 4K of program memory (or 5 bits provide
access to 32 bytes of memory).

1 1 x a a a a d

load store from/to RAM (x = 0 is load, 1 is store)
3 bits provides access to 16 bytes of RAM
r is the destination or source register (0 or 1)
'''


fib_program = '''
li $0 3
str $0 2
li $0 1
str $0 0
str $0 1
ldr $0 1 # add two prev
ldr $1 0
add $0 $1
str $0 0
str $1 1
ldr $0 2 # check if this is the n-th
li $1 1
sub $0 $1
szs 2
str $0 2
jmp 5
hlt
'''

program = '''


'''

def register(register: str):
    match register:
        case '$0':
            return 0
        case '$1':
            return 1
        case _:
            raise ValueError("invalid register", register)

def branch(lines: str):
    lines_int = int(lines)
    # convert to base 2 negative recipricol
    # TODO: implement
    return number(16 + lines_int, 4)

def skip(lines: str):
    lines_int = int(lines)
    if lines_int >= 4:
        raise ValueError("skip amount must be < 4")
    return format(lines_int, 'b')

def number(num: str, digits: int):
    num_int = int(num)
    if num_int >= (2 ** digits):
        raise ValueError(f"value must be < {(2 ** digits)}")
    return format(num_int, f'0{digits}b')

def convert(instruction: str):
    if (instruction == ''):
        return ''
    args = instruction.split(' ')
    match args[0].lower():
        case 'add':
            return f'000000{register(args[2])}{register(args[1])}'
        case 'adc':
            return f'000001{register(args[2])}{register(args[1])}'
        case 'sub':
            return f'000010{register(args[2])}{register(args[1])}'
        case 'subb':
            return f'000011{register(args[2])}{register(args[1])}'
        case 'and':
            return f'000100{register(args[2])}{register(args[1])}'
        case 'or':
            return f'000101{register(args[2])}{register(args[1])}'
        case 'xor':
            return f'000110{register(args[2])}{register(args[1])}'
        case 'not':
            return f'000111{register(args[2])}{register(args[1])}'
        case 'asr':
            return f'0010000{register(args[1])}'
        case 'asl':
            return f'0010001{register(args[1])}'
        case 'ror':
            return f'0010010{register(args[1])}'
        case 'rol':
            return f'0010011{register(args[1])}'
        case 'inc':
            raise NotImplementedError(args[0])
            return f'0010100{register(args[1])}'
        case 'dec':
            raise NotImplementedError(args[0])
            return f'0010101{register(args[1])}'
        case 'cmp':
            return f'001011{register(args[2])}{register(args[1])}'
        case 'inp1':
            raise NotImplementedError(args[0])
            return f'0011000{register(args[1])}'
        case 'inp2':
            raise NotImplementedError(args[0])
            return f'0011001{register(args[1])}'
        case 'out1':
            raise NotImplementedError(args[0])
            return f'0011010{register(args[1])}'
        case 'out2':
            raise NotImplementedError(args[0])
            return f'0011011{register(args[1])}'
        case 'mul':
            raise NotImplementedError(args[0], "structure exist, timing not implemented")
            return f'001110{register(args[2])}{register(args[1])}'
        case 'sec':
            return f'00111100'
        case 'clc':
            return f'00111101'
        case 'ret':
            return f'00111110'
        case 'hlt':
            return f'00111111'
        case 'brn':
            return f'0100{branch(args[1])}'
        case 'scs':
            return f'010100{skip(args[1])}'
        case 'scc':
            return f'010101{skip(args[1])}'
        case 'szs':
            return f'010110{skip(args[1])}'
        case 'szc':
            return f'010111{skip(args[1])}'
        case 'li':
            return f'011{number(args[2], 4)}{register(args[1])}'
        case 'jmp':
            return f'100{number(args[1], 5)}'
        case 'call':
            return f'101{number(args[1], 5)}'
        case 'ldr':
            return f'110{number(args[2], 4)}{register(args[1])}'
        case 'str':
            return f'111{number(args[2], 4)}{register(args[1])}'
        case _:
            raise ValueError("invalid instruction", instruction)

def convert_program(program: str, debug=False):
    result = ''
    for line in program.split('\n'):
        result += f'{convert(line)}  {line if debug == True else ""}\n'
    return result

if __name__ == "__main__":
    print(convert_program(fib_program, debug=True))
