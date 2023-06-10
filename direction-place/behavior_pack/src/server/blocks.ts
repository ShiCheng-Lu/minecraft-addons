// Some blocks should have different facing directions, those are mapped here

/**
 * 
 * @param facing the direction the block should face
 * @param block the block type
 * @returns the value that makes the block face the direction, 
 * -1 if the block direction should not be changed
 */
export function map_by_block(facing: number, block: string) {
    if (block.includes("piston")) {
        switch (facing) {
            case 2: return 3;
            case 3: return 2;
            case 4: return 5;
            case 5: return 4;
            default: return facing;
        }
    }
    if (block.includes("observer")) {
        switch (facing) {
            case 0: return 1;
            case 1: return 0;
            case 2: return 3;
            case 3: return 2;
            case 4: return 5;
            case 5: return 4;
            default: return facing;
        }
    }
    if (block.includes("stairs")) {
        switch (facing) {
            case 0: return -1;
            case 1: return -1;
            case 2: return 2;
            case 3: return 3;
            case 4: return 0;
            case 5: return 1;
            default: return facing;
        }
    }
    return facing
}