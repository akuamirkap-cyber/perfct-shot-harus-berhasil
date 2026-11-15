import ResultsV2 from "./ResultsV2";
import type { ResultsProps } from "./ResultParts";

/** V5 – identical to V2, but without the weapon showcase under GAME OVER */
export default function ResultsV5(p: ResultsProps) {
  return <ResultsV2 {...p} hideGun />;
}
