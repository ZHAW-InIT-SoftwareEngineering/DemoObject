import { createGridMazeFactory } from "./buildGridMaze";

const WIDTH = 10;
const HEIGHT = 10;

const { wall, buildMaze } = createGridMazeFactory(WIDTH, HEIGHT);

// Single source of truth for maze 0.
// Add `wall(fromId, toId)` to block movement between two adjacent fields.
// Remove the line again if you want to reopen that connection.
const blockedWalls = [
  // Barrier between columns 0 and 1.
  wall(10, 11),
  wall(50, 51),
  wall(60, 61),
  // Barrier between columns 1 and 2.
  wall(11, 12),
  wall(41, 42),
  wall(71, 72),

  // Barrier between columns 2 and 3.
  wall(2, 3),
  wall(22, 23),
  wall(32, 33),
  wall(42, 43),
  wall(52, 53),
  wall(62, 63),
  wall(82, 83),

  // Barrier between columns 3 and 4.
  wall(13, 14),
  wall(33, 34),
  wall(73, 74),
  wall(93, 94),

  // Barrier between columns 4 and 5.
  wall(44, 45),
  wall(74, 75),

  // Barrier between columns 5 and 6.
  wall(15, 16),
  wall(25, 26),
  wall(35, 36),
  wall(45, 46),
  wall(55, 56),
  wall(65, 66),
  wall(85, 86),
  wall(95, 96),

  // Barrier between columns 6 and 7.
  wall(96, 97),

  // Barrier between columns 7 and 8.
  wall(7, 8),
  wall(17, 18),
  wall(37, 38),
  wall(57, 58),
  wall(67, 68),
  wall(77, 78),
  wall(87, 88),

  // Barrier between columns 8 and 9.
  wall(18, 19),
  wall(28, 29),
  wall(48, 49),
  wall(68, 69),

  // Barrier between rows 0 and 1.
  wall(1, 11),
  wall(4, 14),
  wall(5, 15),
  wall(6, 16),

  // Barrier between rows 1 and 2.
  wall(17, 27),

  // Barrier between rows 2 and 3.
  wall(20, 30),
  wall(21, 31),
  wall(24, 34),
  wall(25, 35),
  wall(26, 36),
  wall(27, 37),
  wall(28, 38),

  // Barrier between rows 3 and 4.
  wall(31, 41),
  wall(32, 42),

  // Barrier between rows 4 and 5.
  wall(44, 54),
  wall(46, 56),
  wall(49, 59),

  // Barrier between rows 5 and 6.
  wall(50, 60),
  wall(51, 61),
  wall(53, 63),
  wall(54, 64),
  wall(57, 67),
  wall(58, 68),

  // Barrier between rows 6 and 7.
  wall(65, 75),
  wall(69, 79),
  wall(66, 67),

  // Barrier between rows 7 and 8.
  wall(70, 80),
  wall(72, 82),
  wall(73, 83),
  wall(74, 84),
  wall(76, 86),
  wall(78, 88),

  // Barrier between rows 8 and 9.
  wall(82, 92),
  wall(84, 94),
];

export const maze0 = buildMaze({
  mazeId: 0,
  blockedWalls,
});
