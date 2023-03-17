import instruction_set

REG_ZERO = -1
REG_CARRY = -2

UINT8_MAX = 2 ** 8

reg = [0, 0, 0, 0]
pc_stack = []
ram = [0] * 16
pc = 0

def get_reg(register: str):
    match register:
        case '$0':
            return reg[0]
        case '$1':
            return reg[1]
        case 'ZERO':
            return reg[REG_ZERO]
        case 'CARRY':
            return reg[REG_CARRY]

def set_status(value: str):
    value = int(value)
    if value >= UINT8_MAX:
        value -= UINT8_MAX
        reg[REG_CARRY] = 1
    elif value < 0:
        value += UINT8_MAX
        reg[REG_CARRY] = 1
    else:
        reg[REG_CARRY] = 0
    
    reg[REG_ZERO] = (value == 0)

def set_reg(register: str, value: str):
    set_status(value)

    value = int(value)
    match register:
        case '$0':
            reg[0] = value
        case '$1':
            reg[1] = value
        case _:
            raise ValueError(f"invalid register: {register}")

def step(instruction: str):
    global pc

    instruction_set.convert(instruction) # validate instruction

    if (instruction == ''):
        return ''
    args = instruction.split(' ')
    match args[0].lower():
        case 'add':
            set_reg(args[1], get_reg(args[1]) + get_reg(args[2]))
        case 'adc':
            set_reg(args[1], get_reg(args[1]) + get_reg(args[2] + reg[REG_CARRY]))
        case 'sub':
            set_reg(args[1], get_reg(args[1]) - get_reg(args[2]))
        case 'subb':
            set_reg(args[1], get_reg(args[1]) - get_reg(args[2] - reg[REG_CARRY]))
        case 'and':
            set_reg(args[1], get_reg(args[1]) & get_reg(args[2]))
        case 'or':
            set_reg(args[1], get_reg(args[1]) | get_reg(args[2]))
        case 'xor':
            set_reg(args[1], get_reg(args[1]) ^ get_reg(args[2]))
        case 'not':
            set_reg(args[1], ~ get_reg(args[2]))
        case 'asr':
            set_reg(args[1], get_reg(args[1]) >> 1)
        case 'asl':
            set_reg(args[1], get_reg(args[1]) << 1)
        case 'ror':
            carry = reg[REG_CARRY]
            reg[REG_CARRY] = (get_reg(args[1]) & 1)
            set_reg(args[1], get_reg(args[1]) >> 1 + carry << 7)
        case 'rol':
            carry = reg[REG_CARRY]
            reg[REG_CARRY] = (get_reg(args[1]) >= (1 << 7))
            set_reg(args[1], get_reg(args[1]) << 1 + carry)
        case 'inc':
            set_reg(args[1], get_reg(args[1]) + 1)
        case 'dec':
            set_reg(args[1], get_reg(args[1]) - 1)
        case 'cmp':
            set_status(get_reg(args[1]) + 1)
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
            res = get_reg(args[1]) * get_reg(args[2])
            set_reg(args[1], )
            set_reg(args[1], )
            reg[REG_ZERO] = (res == 0)
        case 'sec':
            reg[REG_CARRY] = 1
        case 'clc':
            reg[REG_CARRY] = 0
        case 'ret':
            pc = pc_stack.pop()
        case 'hlt':
            pc *= -1
        case 'brn':
            pc += args[1]
        case 'scs':
            if reg[REG_CARRY]:
                pc += int(args[1])
        case 'scc':
            if not reg[REG_CARRY]:
                pc += int(args[1])
        case 'szs':
            if reg[REG_ZERO]:
                pc += int(args[1])
        case 'szc':
            if not reg[REG_ZERO]:
                pc += int(args[1])
        case 'li':
            set_reg(args[1], args[2])
        case 'jmp':
            pc = int(args[1]) - 1
        case 'call':
            pc_stack.append(pc)
            pc = int(args[1]) - 1
        case 'ldr':
            set_reg(args[1], ram[int(args[2])])
        case 'str':
            ram[int(args[2])] = get_reg(args[1])
        case _:
            raise ValueError("invalid instruction", instruction)

def print_state(instruction: str):
    print(f"  reg0: {reg[0]}, reg1: {reg[1]}, carry: {reg[REG_CARRY]}, zero: {reg[REG_ZERO]}")
    print(f"  {ram}")
    if (instruction == "program ended"):
        print("program ended")
        return
    print(f"next instruction {pc}: {instruction_set.convert(instruction)} ({instruction})")

def sim(program: str, step_by_step: bool = False):
    global pc

    instructions = list(filter(None, program.split('\n')))
    print(program)
    # initialize
    pc = 0
    total_ins = 0

    while pc >= 0:
        instruction = instructions[pc]

        if step_by_step:
            print_state(instruction)
            input()
            
        step(instruction)
        pc += 1
        total_ins += 1
    
    print_state("program ended")
    print(f"total instructions: {total_ins}")

if __name__ == "__main__":
    sim(instruction_set.fib_program, True)
