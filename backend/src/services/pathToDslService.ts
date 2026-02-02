export function pathToDsl(path: Array<{ x: number; y: number }>) {
    const dslBlocks: string[] = [];

    for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i - 1];
        const currentPoint = path[i];

        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;

        dslBlocks.push(decideDirection(dx, dy));
    }

    return dslBlocks;
}

function decideDirection(dx: number, dy: number): string {
    // Screen/maze coordinates use top-left origin: y increases downward.
    // So positive dy means moving down, negative dy means moving up.
    if (dx === 0 && dy > 0) return 'DOWN';
    if (dx > 0 && dy === 0) return 'RIGHT';
    if (dx < 0 && dy === 0) return 'LEFT';
    if (dx === 0 && dy < 0) return 'UP';
    return 'INVALID'; // diagonal move => not allowed!
}
