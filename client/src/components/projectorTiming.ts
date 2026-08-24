export type ProjectorTiming = {
  time: number;
  slideIndex: number;
  fragment: number;
};

export type ProjectorTimingUnit = "seconds" | "fraction";

export function timingToMediaTime(timing: number, mediaDuration: number, unit: ProjectorTimingUnit = "seconds") {
  return unit === "fraction" ? timing * mediaDuration : timing;
}

export function findProjectorSlideIndex(
  currentTime: number,
  timings: ProjectorTiming[],
  mediaDuration: number,
  slideCount: number,
  unit: ProjectorTimingUnit = "seconds",
) {
  let slideIndex = 0;
  for (let index = timings.length - 1; index >= 0; index -= 1) {
    if (currentTime >= timingToMediaTime(timings[index].time, mediaDuration, unit)) {
      slideIndex = timings[index].slideIndex;
      break;
    }
  }
  return Math.min(Math.max(slideIndex, 0), Math.max(slideCount - 1, 0));
}
