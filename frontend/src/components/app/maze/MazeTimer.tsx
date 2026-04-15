type MazeTimerProps = {
  elapsedMs: number;
};

export function MazeTimer({ elapsedMs }: MazeTimerProps) {
  const { main, fraction } = formatElapsedTime(elapsedMs);

  return (
    <div className="text-center font-mono text-base tabular-nums text-gray-900">
      {main}
      {fraction}
    </div>
  );
}

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const centiseconds = Math.floor((elapsedMs % 1000) / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const main =
    hours > 0
      ? `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`
      : `${padNumber(minutes)}:${padNumber(seconds)}`;

  return {
    main,
    fraction: `.${padNumber(centiseconds)}`,
  };
}

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}
