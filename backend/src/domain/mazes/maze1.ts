import { createGridMazeFactory } from "./buildGridMaze";

const WIDTH = 6;
const HEIGHT = 6;

const { wall, buildMaze } = createGridMazeFactory(WIDTH, HEIGHT);

// Maze 1 is a smaller dummy maze that still keeps a real corridor structure.
const blockedWalls = [
  // Barrier between columns 0 and 1.
  wall(0, 1),
  wall(6, 7),

  // Barrier between columns 1 and 2.
  wall(13, 14),
  wall(19, 20),
  wall(25, 26),

  // Barrier between columns 2 and 3.
  wall(20, 21),
  wall(28, 29),

  // Barrier between columns 3 and 4.
  wall(15, 16),

  // Barrier between columns 4 and 5.
  wall(16, 17),
  wall(22, 23),
  wall(34, 35),

  // Barrier between rows 0 and 1.
  wall(1, 7),
  wall(3, 9),
  wall(4, 10),

  // Barrier between rows 1 and 2.
  wall(7, 13),
  wall(8, 14),
  wall(9, 15),

  // Barrier between rows 2 and 3.
  wall(12, 18),

  // Barrier between rows 3 and 4.
  wall(19, 25),
  wall(21, 27),
  wall(22, 28),

  // Barrier between rows 4 and 5.
  wall(24, 30),
  wall(26, 32),
  wall(27, 33),
];

export const maze1 = buildMaze({
  mazeId: 1,
  blockedWalls,
});
