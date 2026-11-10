import { Bus, ExamPad, HeartKeychain, Pencil } from "./heart-keychain-props";
import { GROUND, PosterSky } from "./memory-poster";

/** The school: two floors of classroom windows behind its wall, the gate, a flag and a tree. */
function SchoolEvening() {
  const windows = (y: number) => Array.from({ length: 9 }, (_, i) => `M${802 + i * 40} ${y}h22v26h-22Z`).join("");
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g opacity=".5">
        {[[690, 60, 1.4], [806, 48, 1.2], [930, 92, 1.6], [1150, 60, 1.3], [470, 110, 1], [292, 70, 1.2]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="currentColor" stroke="none" />)}
        <path d="M622 70a22 22 0 1 0 20 30a17 17 0 1 1-20-30Z" fill="currentColor" stroke="none" opacity=".6" />
      </g>
      <g opacity=".22" strokeWidth="1.3">
        {/* the school, two floors of classrooms */}
        <path d={`M780 ${GROUND}V420h400v${GROUND - 420}M772 420h416v-10H772ZM780 484h400`} />
        <path d={`${windows(436)}${windows(498)}`} opacity=".7" />
        <path d={`M960 ${GROUND}v-40h40v40`} />
        {/* the flag on its pole */}
        <path d="M1150 410V340l26 8-26 8" />
        {/* the compound wall and the gate */}
        <path d={`M300 ${GROUND}v-34h420v34M300 ${GROUND - 34}h420`} />
        <path d={`M300 ${GROUND - 40}h420`} strokeDasharray="2 10" />
        {/* a tree by the wall */}
        <path d={`M200 ${GROUND}V470`} strokeWidth="2.4" />
        <path d="M200 474c-40 2-60-30-40-52-14-30 18-52 40-40 20-16 54 0 48 26 26 14 14 56-20 62-10 8-24 8-28 4Z" />
        {/* the street lamp, its light falling on the road */}
        <path d="M676 548V318q0-12-12-12h-44" strokeWidth="2.2" />
        <path d="M670 548h12M673 470h6M673 400h6" />
        <path d="M600 300q16-10 32 0l-3 6h-26Z" fill="currentColor" fillOpacity=".25" />
        <path d="M604 306h24" strokeWidth="3" opacity=".9" />
      </g>
      <path d="M606 308L494 548H738L626 308Z" fill="url(#poster-lamp)" stroke="none" />
      <ellipse cx="616" cy="550" rx="150" ry="14" fill="url(#poster-pool)" stroke="none" />
      <g opacity=".22" strokeWidth="1.3">
        <path d={`M0 ${GROUND}H1200M0 ${GROUND + 9}H1200`} />
        <path d={`M40 ${GROUND + 30}h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60`} opacity=".6" />
      </g>
    </g>
  );
}

/**
 * Last Exam & a Heart Keychain's poster, on a 1200×630 evening outside school:
 * the bus home passing under the lamp, and, up and to the right as on the
 * other posters, the exam pad from the last paper with the heart keychain.
 *
 * Plain drawing only, for the page and the share-image renderer alike.
 */
export function KeychainPosterArt() {
  return (
    <g>
      <PosterSky />
      <SchoolEvening />
      <g opacity=".62" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <Bus x={604} y={GROUND} scale={.42} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="900" cy="378" rx="180" ry="14" fill="url(#poster-shade)" stroke="none" />
        <ExamPad x={830} y={268} angle={-8} scale={.95} />
        <Pencil x={862} y={372} angle={-4} scale={.85} />
        <HeartKeychain x={990} y={312} angle={18} scale={1.05} />
      </g>
    </g>
  );
}
