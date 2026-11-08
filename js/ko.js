// Dictionary-based Korean names for exercise names (English words/phrases -> Korean).
// Unknown words stay in English. Phrases are matched first (longest match), then single words.
const PHRASES = {
  "one arm": "한 팔", "one-arm": "한 팔", "one leg": "한 다리", "one-leg": "한 다리",
  "single arm": "한 팔", "single leg": "한 다리", "single-arm": "한 팔", "single-leg": "한 다리",
  "two arm": "양팔", "two-arm": "양팔",
  "close grip": "좁은 그립", "close-grip": "좁은 그립", "wide grip": "넓은 그립", "wide-grip": "넓은 그립",
  "reverse grip": "리버스 그립", "reverse-grip": "리버스 그립", "medium grip": "중간 그립", "narrow grip": "좁은 그립",
  "palms down": "손바닥 아래로", "palms up": "손바닥 위로", "palm down": "손바닥 아래로", "palm up": "손바닥 위로",
  "bench press": "벤치프레스", "shoulder press": "숄더프레스", "military press": "밀리터리 프레스",
  "leg press": "레그프레스", "calf raise": "카프 레이즈", "calf raises": "카프 레이즈",
  "lat pulldown": "랫풀다운", "pull-down": "풀다운", "pull down": "풀다운", "pull-up": "풀업", "pull up": "풀업",
  "push ups": "푸쉬업", "pull ups": "풀업", "pull-ups": "풀업", "sit ups": "싯업", "chin ups": "친업", "push-up": "푸쉬업", "push up": "푸쉬업", "push-ups": "푸쉬업", "sit-up": "싯업", "sit up": "싯업", "sit-ups": "싯업",
  "chin-up": "친업", "chin up": "친업", "bent over": "벤트오버", "bent-over": "벤트오버",
  "romanian deadlift": "루마니안 데드리프트", "stiff-legged": "스티프 레그", "stiff legged": "스티프 레그",
  "good morning": "굿모닝", "good mornings": "굿모닝", "smith machine": "스미스 머신", "e-z curl bar": "EZ바",
  "ez-bar": "EZ바", "ez bar": "EZ바", "ez curl bar": "EZ바", "medicine ball": "메디신볼", "exercise ball": "짐볼",
  "foam roll": "폼롤러", "hip flexor": "고관절 굴곡근", "hip flexors": "고관절 굴곡근",
  "rear delt": "후면 삼각근", "rear deltoid": "후면 삼각근", "side lateral": "사이드 레터럴",
  "front raise": "프론트 레이즈", "lateral raise": "레터럴 레이즈", "face pull": "페이스 풀",
  "skull crusher": "스컬 크러셔", "skullcrusher": "스컬 크러셔", "preacher curl": "프리처 컬",
  "hammer curl": "해머 컬", "concentration curl": "컨센트레이션 컬", "farmer's walk": "파머스 워크",
  "farmer's carry": "파머스 캐리", "turkish get-up": "터키시 겟업", "turkish get up": "터키시 겟업",
  "russian twist": "러시안 트위스트", "mountain climber": "마운틴 클라이머", "mountain climbers": "마운틴 클라이머",
  "t-bar row": "T바 로우", "3/4 sit-up": "3/4 싯업", "one-legged": "한 다리", "one legged": "한 다리", "front barbell squat": "프론트 바벨 스쿼트",
};

const WORDS = {
  a: "", an: "", the: "", of: "", your: "", and: "&", or: "또는", with: "", from: "", on: "", in: "", to: "", at: "",
  into: "", against: "", off: "", through: "", between: "", around: "", across: "", above: "", below: "", for: "",
  press: "프레스", presses: "프레스", dumbbell: "덤벨", dumbbells: "덤벨", db: "덤벨", barbell: "바벨",
  arm: "팔", arms: "팔", curl: "컬", curls: "컬", cable: "케이블", stretch: "스트레칭", standing: "스탠딩",
  bench: "벤치", squat: "스쿼트", squats: "스쿼트", raise: "레이즈", raises: "레이즈", kettlebell: "케틀벨", kettlebells: "케틀벨",
  seated: "시티드", up: "업", ups: "업", leg: "레그", legs: "레그", legged: "레그", triceps: "삼두", tricep: "삼두",
  incline: "인클라인", decline: "디클라인", row: "로우", rows: "로우", grip: "그립", lying: "라잉", side: "사이드", sides: "사이드",
  extension: "익스텐션", extensions: "익스텐션", push: "푸쉬", machine: "머신", clean: "클린", reverse: "리버스",
  deadlift: "데드리프트", deadlifts: "데드리프트", over: "오버", calf: "카프", calves: "종아리", chest: "가슴", jump: "점프",
  bar: "바", overhead: "오버헤드", front: "프론트", smith: "스미스", crunch: "크런치", crunches: "크런치",
  shoulder: "어깨", band: "밴드", bands: "밴드", pull: "풀", pulls: "풀", back: "등", wrist: "손목", close: "좁은",
  snatch: "스내치", ball: "볼", hip: "엉덩이", hips: "엉덩이", two: "투", one: "원", single: "싱글", lateral: "레터럴",
  hamstring: "햄스트링", ham: "햄스트링", floor: "바닥", box: "박스", wide: "넓은", neck: "목", alternating: "교대",
  alternate: "교대", rear: "후면", split: "스플릿", jerk: "저크", hang: "행", flyes: "플라이", flye: "플라이", fly: "플라이",
  pulley: "풀리", rope: "로프", ropes: "로프", knee: "무릎", knees: "무릎", glute: "둔근", glutes: "둔근", lunge: "런지",
  lunges: "런지", shrug: "슈러그", shrugs: "슈러그", high: "하이", kneeling: "니링", power: "파워", weighted: "중량",
  sit: "싯", circles: "서클", behind: "비하인드", rotation: "회전", rotations: "회전", preacher: "프리처", pulldown: "풀다운",
  pulldowns: "풀다운", plate: "플레이트", leverage: "레버리지", hammer: "해머", throw: "스로우", good: "굿", delt: "삼각근",
  deltoid: "삼각근", sled: "슬레드", low: "로우", upright: "업라이트", straight: "스트레이트", quad: "대퇴사두", quads: "대퇴사두",
  quadriceps: "대퇴사두", morning: "모닝", mornings: "모닝", bridge: "브릿지", bridges: "브릿지", head: "머리", chains: "체인",
  chain: "체인", body: "바디", bodyweight: "맨몸", crossover: "크로스오버", chin: "친", ez: "EZ", exercise: "운동",
  biceps: "이두", bicep: "이두", double: "더블", down: "다운", stance: "스탠스", groin: "사타구니", balance: "밸런스", step: "스텝",
  sprint: "스프린트", sprints: "스프린트", pullover: "풀오버", long: "롱", lift: "리프트", pushdown: "푸쉬다운", cross: "크로스",
  lat: "광배근", flat: "플랫", twist: "트위스트", twists: "트위스트", sumo: "스모", linear: "리니어", military: "밀리터리",
  stiff: "스티프", suspended: "서스펜디드", ab: "복근", abs: "복근", drag: "드래그", drags: "드래그", walking: "워킹", walk: "워크",
  dips: "딥스", dip: "딥스", butt: "엉덩이", wall: "벽", chair: "의자", blocks: "블록", oblique: "옆구리", elevated: "엘리베이티드",
  external: "외회전", internal: "내회전", hops: "홉", hop: "홉", isometric: "아이소메트릭", supine: "누운", palm: "손바닥",
  palms: "손바닥", adductor: "내전근", adductors: "내전근", adduction: "내전", adductions: "내전", abductor: "외전근",
  windmill: "윈드밀", windmills: "윈드밀", backward: "백워드", rollout: "롤아웃", medium: "중간", full: "풀", hack: "핵",
  bend: "벤드", bends: "벤드", attachment: "어태치먼트", iron: "아이언", lower: "하부", upper: "상부", concentration: "컨센트레이션",
  depth: "뎁스", kick: "킥", kicks: "킥", prone: "프론", face: "페이스", flexor: "굴곡근", flexors: "굴곡근", cone: "콘",
  kickback: "킥백", hanging: "행잉", hyperextension: "백 익스텐션", hyperextensions: "백 익스텐션", inner: "안쪽", treadmill: "러닝머신",
  pass: "패스", muscle: "근육", drill: "드릴", resistance: "저항", narrow: "좁은", pushups: "푸쉬업", pushup: "푸쉬업",
  rack: "랙", speed: "스피드", v: "V", roller: "롤러", bike: "바이크", touchers: "터치", bound: "바운드", ankle: "발목",
  tibialis: "전경골근", arnold: "아놀드", atlas: "아틀라스", trainer: "트레이너", board: "보드", skull: "스컬", crusher: "크러셔",
  thrust: "스러스트", crawl: "크롤", bicycling: "사이클", stationary: "고정", mid: "중간", bottoms: "바텀", position: "포지션",
  positions: "포지션", bradford: "브래드포드", rocky: "로키", flip: "플립", russian: "러시안", elbows: "팔꿈치", elbow: "팔꿈치",
  hands: "손", hand: "손", car: "카", quick: "퀵", handle: "핸들", extended: "확장", dead: "데드", deficit: "디피싯",
  leap: "리프", version: "버전", facing: "향한", pronated: "오버핸드", dynamic: "다이나믹", range: "범위", frog: "프로그",
  chins: "친업", hug: "허그", intermediate: "중급", inverted: "인버티드", jackknife: "잭나이프", load: "로드", pistol: "피스톨",
  turkish: "터키시", get: "겟", style: "스타일", parallel: "패러렐", tuck: "턱", landmine: "랜드마인", jammer: "재머",
  t: "T", middle: "중부", olympic: "올림픽", swings: "스윙", swing: "스윙", slam: "슬램", open: "오픈", laterals: "레터럴",
  pallof: "팔로프", pelvic: "골반", tilt: "틸트", peroneals: "비골근", plank: "플랭크", plyo: "플라이오", feet: "발",
  foot: "발", rickshaw: "릭샤", romanian: "루마니안", running: "러닝", run: "런", harness: "하네스", stride: "스트라이드",
  spider: "스파이더", toe: "발끝", thigh: "허벅지", zottman: "조트만", advanced: "고급", air: "에어", all: "모든", fours: "네발",
  heel: "뒤꿈치", diagonal: "대각선", renegade: "레니게이드", anterior: "전면", anti: "안티", gravity: "중력", worlds: "월드",
  "world's": "월드", stone: "스톤", stones: "스톤", axle: "액슬", assisted: "어시스티드", apart: "벌려", guillotine: "기요틴",
  battling: "배틀", bear: "베어", powerlifting: "파워리프팅", bosu: "보수", multiple: "멀티", response: "반응", skip: "스킵",
  brachialis: "상완근", butterfly: "버터플라이", judo: "유도", drivers: "드라이버", carioca: "카리오카", cat: "캣", catch: "캐치",
  point: "포인트", release: "릴리즈", stability: "안정성", "child's": "차일드", pose: "자세", circus: "서커스", bell: "벨",
  clock: "클락", cocoons: "코쿤", "conan's": "코난", wheel: "휠", crucifix: "크루시픽스", cuban: "쿠반", "dancer's": "댄서",
  bug: "버그", donkey: "동키", downward: "다운워드", drop: "드롭", neutral: "뉴트럴", pronation: "회내", supination: "회외",
  scaption: "스캡션", elliptical: "일립티컬", "farmer's": "파머스", fast: "패스트", finger: "손가락", flutter: "플러터",
  forward: "포워드", frankenstein: "프랑켄슈타인", freehand: "맨손", hurdle: "허들", motion: "모션", gironda: "지론다",
  sternum: "흉골", goblet: "고블릿", pins: "핀", gorilla: "고릴라", groiners: "그로이너", handstand: "핸드스탠드", pike: "파이크",
  heaving: "헤이빙", heavy: "헤비", bag: "백", flexion: "굴곡", no: "노", it: "IT", iliotibial: "장경인대", tract: "밴드",
  inchworm: "인치웜", straps: "스트랩", crosses: "크로스", squeeze: "스퀴즈", squeezes: "스퀴즈", wipers: "와이퍼", jm: "JM",
  janda: "얀다", jefferson: "제퍼슨", jogging: "조깅", keg: "케그", figure: "피겨", pirate: "파이럿", ships: "쉽",
  seesaw: "시소", thruster: "쓰러스터", kipping: "키핑", bars: "바", forearm: "전완", latissimus: "광배근", dorsi: "광배",
  iso: "아이소", part: "파트", start: "스타트", technique: "테크닉", acceleration: "가속", log: "로그", london: "런던",
  looking: "바라보며", ceiling: "천장", cambered: "캠버", scoop: "스쿠프", mixed: "믹스드", monster: "몬스터", mountain: "마운틴",
  climbers: "클라이머", moving: "무빙", claw: "클로", series: "시리즈", natural: "내추럴", para: "파라", supinated: "언더핸드",
  half: "하프", locust: "로커스트", handed: "핸드", otis: "오티스", physioball: "짐볼", pin: "핀", piriformis: "이상근",
  pinch: "핀치", platform: "플랫폼", slides: "슬라이드", plie: "플리에", posterior: "후면", partials: "파셜", stairs: "계단",
  manual: "맨주얼", prowler: "프라울러", pullups: "풀업", pullup: "풀업", pyramid: "피라미드", delivery: "딜리버리",
  recumbent: "리컴번트", return: "리턴", rhomboids: "능형근", carry: "캐리", ring: "링", rocket: "로켓", rocking: "로킹",
  climb: "클라임", jumping: "점프", round: "라운드", rowing: "로잉", "runner's": "러너", sandbag: "샌드백", scapular: "견갑",
  scissor: "시저", scissors: "시저", tucks: "턱", see: "시", saw: "소", shotgun: "샷건", shuffle: "셔플", progression: "프로그레션",
  skating: "스케이팅", sledgehammer: "슬레지해머", spell: "스펠", caster: "캐스터", spinal: "척추", movers: "무버",
  stairmaster: "스테어마스터", wood: "우드", chop: "찹", gastrocnemius: "비복근", soleus: "가자미근", achilles: "아킬레스",
  touches: "터치", towel: "타월", star: "스타", mill: "밀", stomach: "복부", vacuum: "배큠", superman: "슈퍼맨",
  fallout: "폴아웃", svend: "스벤드", tate: "테이트", straddle: "스트래들", tire: "타이어", torso: "상체", trail: "트레일",
  trap: "승모근", underhand: "언더핸드", grab: "그랩", upward: "업워드", vertical: "수직", sissy: "시시", wind: "윈드",
  sprinting: "스프린트", yoke: "요크", zercher: "저처", "180's": "180도",  halo: "헤일로",  world: "월드", greatest: "그레이티스트",   abduction: "외전", dancer: "댄서", hold: "홀드", banded: "밴드", dog: "독", trx: "TRX", dome: "돔", pilates: "필라테스", supported: "서포티드", loaded: "중량", bulgarian: "불가리안",
  fold: "폴드", stand: "스탠드", copenhagen: "코펜하겐", kickstand: "킥스탠드", pause: "포즈", paused: "포즈", planche: "플란체", warrior: "워리어",
  archer: "아처", lever: "레버", clamshell: "클램쉘", clamshells: "클램쉘", fire: "파이어", hydrant: "하이드런트", battle: "배틀", hollow: "할로우",
  bird: "버드", "captain's": "캡틴", cow: "카우", crescent: "크레센트", drive: "드라이브", flag: "플래그", lean: "린", nordic: "노르딕",
  roll: "롤", spine: "척추", tabletop: "테이블탑", revolved: "리볼브드", flow: "플로우", thread: "스레드", needle: "니들", switch: "스위치",
  terminal: "터미널", couch: "카우치", bicycle: "바이시클", boat: "보트", bow: "보우", burpees: "버피", camel: "카멜", cheat: "치팅",
  clap: "클랩", cobra: "코브라", commando: "코만도", cossack: "코삭", crab: "크랩", crow: "크로우", cycling: "사이클링", somersault: "공중제비",
  deep: "딥", diamond: "다이아몬드", dolphin: "돌핀", doorway: "문틀", pedal: "페달", dragon: "드래곤", eagle: "이글", easy: "이지", angle: "앵글",
  fish: "피시", flexed: "굴곡", garland: "갈란드", rock: "락", moon: "문", happy: "해피", baby: "베이비", flicks: "플릭", hero: "히어로", hex: "헥스",
  horizontal: "수평", human: "휴먼", jacks: "잭", offset: "오프셋", rotational: "회전", lizard: "리저드", negative: "네거티브", pec: "가슴", deck: "덱",
  pendlay: "펜들레이", pigeon: "피존", plow: "플로우", pseudo: "슈도", puppy: "퍼피", reclined: "리클라인드", pulses: "펄스", pulse: "펄스", support: "서포트",
  rings: "링", corpse: "시체", shrimp: "슈림프", rdl: "루마니안 데드리프트", six: "식스", inch: "인치", skierg: "스키에르그", sphinx: "스핑크스",
  spiderman: "스파이더맨", spoto: "스포토", stair: "계단", climber: "클라이머", strict: "스트릭트", suitcase: "수트케이스", windshield: "와이퍼",
  shoulderstand: "숄더스탠드", tandem: "탠덤", thoracic: "흉추", three: "쓰리", toes: "발끝", tree: "트리", triangle: "삼각", iii: "III", ii: "II", bilateral: "양측",
  bent: "벤트", smr: "(폼롤러)", skipping: "스키핑", "90": "90", "3": "3", "4": "4", "8": "8",
};

function translate(name) {
  let s = name.toLowerCase().replace(/[,]/g, " ");
  const keys = Object.keys(PHRASES).sort((a, b) => b.length - a.length);
  for (const k of keys) s = s.split(k).join(" \u0000" + PHRASES[k] + "\u0000 ");
  const out = [];
  for (const part of s.split("\u0000")) {
    if (!part.trim()) continue;
    if (PHRASES_VALUES.has(part)) { out.push(part); continue; }
    for (const w of part.split(/[\s\-\/()]+/)) {
      if (!w) continue;
      if (w in WORDS) { if (WORDS[w]) out.push(WORDS[w]); } else out.push(w);
    }
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}
const PHRASES_VALUES = new Set(Object.values(PHRASES));

export function koName(name) {
  return translate(name) || name;
}
