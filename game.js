(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const STORAGE_KEY = "fusion-roguelike-prototype-v1";

  const baseEffects = [
    { id:"burn", name:"발화", icon:"🔥", category:"지속/상태", desc:"공격 시 발화를 부여하고 매 턴 화염 피해를 준다." },
    { id:"bleed", name:"출혈", icon:"🩸", category:"지속/상태", desc:"공격 시 출혈을 부여한다. 적이 행동할 때 추가 피해를 받는다." },
    { id:"poison", name:"독액", icon:"☠️", category:"지속/상태", desc:"공격 시 독을 부여한다. 독은 매 턴 오래 지속되는 피해를 준다." },
    { id:"shock", name:"감전", icon:"⚡", category:"지속/상태", desc:"공격 시 감전을 쌓는다. 중첩된 적을 때리면 추가 전격 피해가 발생한다." },
    { id:"rupture", name:"파열", icon:"💥", category:"지속/상태", desc:"공격할수록 파열을 쌓고 일정 중첩마다 폭발한다." },
    { id:"chill", name:"냉기", icon:"❄️", category:"지속/상태", desc:"적의 공격력을 감소시키는 냉기를 부여한다." },
    { id:"curse", name:"저주", icon:"🕯️", category:"지속/상태", desc:"저주 중첩에 비례해 적이 받는 피해가 증가한다." },
    { id:"plague", name:"역병", icon:"🦠", category:"지속/상태", desc:"모든 지속 피해의 위력을 증가시킨다." },

    { id:"strength", name:"괴력", icon:"💪", category:"공격", desc:"직접 공격 피해가 증가한다." },
    { id:"precision", name:"정밀", icon:"🎯", category:"공격", desc:"치명타 확률이 증가한다." },
    { id:"fatal", name:"필살", icon:"💀", category:"공격", desc:"치명타 피해량이 증가한다." },
    { id:"pierce", name:"관통", icon:"🗡️", category:"공격", desc:"적의 방어를 일부 무시한다." },
    { id:"rage", name:"격노", icon:"😡", category:"공격", desc:"체력이 낮을수록 공격 피해가 증가한다." },
    { id:"combo", name:"연격", icon:"⚔️", category:"공격", desc:"연속 공격할수록 피해가 증가한다." },
    { id:"vulnerable", name:"취약", icon:"👁️", category:"공격", desc:"공격 시 취약을 부여해 적이 받는 피해를 증가시킨다." },
    { id:"destroy", name:"파괴", icon:"🔨", category:"공격", desc:"적의 방어 자세와 보호 계열 행동에 추가 피해를 준다." },

    { id:"armor", name:"철갑", icon:"🛡️", category:"생존", desc:"받는 직접 피해를 감소시킨다." },
    { id:"barrier", name:"역장", icon:"🔷", category:"생존", desc:"수비 시 얻는 보호막이 증가한다." },
    { id:"thorns", name:"가시", icon:"🌵", category:"생존", desc:"공격받을 때 적에게 반사 피해를 준다." },
    { id:"dodge", name:"회피", icon:"🌫️", category:"생존", desc:"일정 확률로 적의 공격을 완전히 회피한다." },
    { id:"unyielding", name:"불굴", icon:"🧱", category:"생존", desc:"체력이 낮을수록 받는 피해가 감소한다." },
    { id:"regen", name:"재생", icon:"❤️", category:"생존", desc:"턴 종료 시 체력을 회복한다." },
    { id:"lifesteal", name:"흡혈", icon:"🦇", category:"생존", desc:"직접 가한 피해 일부를 체력으로 회복한다." },
    { id:"healing", name:"치유", icon:"✨", category:"생존", desc:"모든 회복량을 증가시킨다." },

    { id:"haste", name:"신속", icon:"💨", category:"특수", desc:"초신속의 재사용 대기시간을 줄이고 추가 행동 확률을 얻는다." },
    { id:"time", name:"시간", icon:"⏳", category:"특수", desc:"기술 재사용 대기시간이 더 빠르게 감소한다." },
    { id:"dark", name:"암흑", icon:"🌑", category:"특수", desc:"적의 공격이 빗나갈 확률을 높인다." },
    { id:"chaos", name:"혼돈", icon:"🌀", category:"특수", desc:"공격 시 무작위 기본 상태이상을 추가로 부여할 수 있다." },
    { id:"necro", name:"사령술", icon:"💀", category:"특수", desc:"적 처치 시 망령을 얻고 다음 전투에서 자동 공격을 지원한다." },
    { id:"soul", name:"영혼", icon:"👻", category:"특수", desc:"적 처치 시 영혼을 얻고 영혼 수에 따라 공격력이 증가한다." },
    { id:"bloodmagic", name:"혈마법", icon:"🩸", category:"특수", desc:"신중한 일격 사용 시 체력을 조금 소모해 피해를 크게 증폭한다." },
    { id:"holy", name:"성광", icon:"✝️", category:"특수", desc:"전투 종료 및 재생 회복을 강화하고 저주 계열과 특수 융합한다." }
  ];

  const firstFusions = [
    ["inferno","폭염","🔥💥","burn","rupture","파열 폭발과 발화가 서로를 증폭한다."],
    ["thunderflame","뇌화","🔥⚡","burn","shock","감전 발동 시 발화 피해가 추가된다."],
    ["thermalshock","열충격","🔥❄️","burn","chill","발화와 냉기가 함께 있으면 추가 피해를 준다."],
    ["redplague","홍염역병","🔥🦠","burn","plague","발화의 지속 피해가 크게 증가한다."],
    ["cremationarmy","화장군단","🔥💀","burn","necro","망령 자동 공격이 발화를 부여한다."],
    ["sacredflame","성화","🔥✝️","burn","holy","저주 대상에게 발화 피해가 증가한다."],
    ["blazingrage","화광","🔥😡","burn","rage","저체력일수록 발화 피해가 강해진다."],
    ["burncombo","연소연타","🔥⚔️","burn","combo","연격이 높을수록 발화를 더 쌓는다."],
    ["bloodfeast","혈식","🩸🦇","bleed","lifesteal","출혈 피해 일부를 회복한다."],
    ["necrosis","괴사","🩸☠️","bleed","poison","독과 출혈이 함께 있으면 지속 피해 증가."],
    ["bloodcurse","혈액저주","🩸🕯️","bleed","curse","출혈 발동 시 저주를 추가로 쌓는다."],
    ["arterycut","절맥","🩸🎯","bleed","precision","치명타 시 출혈을 추가 부여한다."],
    ["bloodyexecution","혈의 처형","🩸💀","bleed","fatal","출혈 대상에게 치명타 피해 증가."],
    ["flurrycut","난도","🩸⚔️","bleed","combo","연격에 비례해 출혈 부여량 증가."],
    ["fleshdead","혈육망자","🩸💀","bleed","necro","출혈 상태 적 처치 시 망령 강화."],
    ["bloodart","혈계술","🩸🩸","bleed","bloodmagic","혈마법 공격이 출혈을 크게 부여한다."],

    ["blackdeath","흑사병","☠️🦠","poison","plague","독 피해가 크게 증가하고 오래 지속된다."],
    ["neurotoxin","신경독","☠️⚡","poison","shock","독 상태 적의 공격력이 추가 감소한다."],
    ["frostpoison","동상독","☠️❄️","poison","chill","냉기 중첩에 비례해 독 피해 증가."],
    ["corrosion","부식","☠️👁️","poison","vulnerable","독 중첩만큼 직접 피해 증가."],
    ["rottingarmy","부패군세","☠️💀","poison","necro","망령 공격이 독을 부여한다."],
    ["venomblood","독혈","☠️🦇","poison","lifesteal","독 피해 일부를 회복한다."],
    ["toxicfog","맹독연무","☠️🌑","poison","dark","독 중첩에 따라 적 명중률 감소."],
    ["mutantpoison","변이독","☠️🌀","poison","chaos","독 발동 시 무작위 상태이상 추가."],

    ["chainlightning","뇌격연쇄","⚡⚔️","shock","combo","연격 시 감전 추가 피해가 증가한다."],
    ["electricfield","뇌전장","⚡🔷","shock","barrier","역장이 피해를 막으면 감전을 부여한다."],
    ["superconduct","초전도","⚡💨","shock","haste","감전 발동 시 초신속 쿨타임 감소 확률."],
    ["spacetimecurrent","시공전류","⚡⏳","shock","time","감전 발동 시 기술 쿨타임 감소."],
    ["electromark","전자표식","⚡🎯","shock","precision","감전 대상 치명타 확률 증가."],
    ["overload","과부하","⚡🔨","shock","destroy","감전 대상에게 파괴 피해 증가."],
    ["heavenbolt","천뢰","⚡✝️","shock","holy","감전이 일정 중첩되면 성광 낙뢰 발생."],
    ["turbulence","난류","⚡🌀","shock","chaos","감전 피해가 무작위로 크게 증폭된다."],

    ["iceshatter","빙쇄","❄️💥","chill","rupture","파열 폭발 시 냉기를 소비해 추가 피해."],
    ["icearmor","빙갑","❄️🛡️","chill","armor","피격 시 공격자에게 냉기 부여."],
    ["snowshadow","설영","❄️🌫️","chill","dodge","회피 시 적에게 냉기 부여."],
    ["freezepoint","빙점","❄️🎯","chill","precision","냉기 중첩이 높을수록 치명타 확률 증가."],
    ["frostbreak","동결파쇄","❄️👁️","chill","vulnerable","냉기 최대 중첩에서 취약 추가."],
    ["hibernation","동면","❄️❤️","chill","regen","수비한 턴의 재생량 크게 증가."],
    ["timestop","시간정지","❄️⏳","chill","time","냉기가 높으면 적 공격력이 크게 감소."],
    ["holyice","성빙","❄️✝️","chill","holy","냉기 대상에게 성광 보너스 피해."],

    ["deathsentence","사형선고","🕯️💀","curse","fatal","저주 대상에게 치명타 피해 크게 증가."],
    ["doommark","파멸낙인","🕯️👁️","curse","vulnerable","저주와 취약이 서로를 증폭한다."],
    ["nightmare","악몽","🕯️🌑","curse","dark","저주 대상의 명중률과 공격력 감소."],
    ["deadcontract","망자계약","🕯️💀","curse","necro","저주 상태 적 처치 시 망령 추가 획득."],
    ["spiritbind","혼령속박","🕯️👻","curse","soul","영혼 수에 비례해 저주 효과 증가."],
    ["bloodhex","혈주","🕯️🩸","curse","bloodmagic","혈마법 공격이 저주도 부여한다."],
    ["omen","불길한 징조","🕯️🌀","curse","chaos","저주 대상 공격 시 무작위 약화 추가."],
    ["plaguehex","역병주","🕯️🦠","curse","plague","저주가 지속 피해를 크게 증폭한다."],

    ["armorcrusher","중갑분쇄","💪🗡️","strength","pierce","괴력 보너스 일부가 방어 무시 피해가 된다."],
    ["berserkforce","광폭","💪😡","strength","rage","저체력 공격력 증가가 더 강해진다."],
    ["execution","처형","🎯💀","precision","fatal","치명타 확률과 치명타 피해가 함께 증가."],
    ["collapse","붕괴","🗡️🔨","pierce","destroy","관통과 파괴 효과가 서로 증폭한다."],
    ["berserker","광전사","😡🦇","rage","lifesteal","저체력일수록 흡혈이 크게 증가."],
    ["galeflurry","질풍연참","⚔️💨","combo","haste","연격이 쌓일수록 초신속 쿨타임 감소."],
    ["moment","찰나","🌫️🎯","dodge","precision","회피 후 다음 공격 치명타 확률 증가."],
    ["ironfortress","철옹성","🛡️🌵","armor","thorns","감소시킨 피해 일부를 반사한다."],
    ["reflectfield","반사장","🔷🌵","barrier","thorns","역장이 막은 피해 일부를 반사한다."],
    ["immortality","불사성","🧱❤️","unyielding","regen","체력이 낮을수록 재생량이 증가한다."],
    ["lifespring","생명의 샘","❤️✨","regen","healing","초과 회복 일부가 역장으로 바뀐다."],
    ["soulfeast","영혼포식","🦇👻","lifesteal","soul","흡혈 시 영혼 획득 확률이 생긴다."],
    ["acceleration","가속","💨⏳","haste","time","행동할 때마다 쿨타임이 더 빠르게 감소."],
    ["shadow","그림자","🌑🌫️","dark","dodge","회피 시 다음 공격이 강화된다."],
    ["timecollapse","시간붕괴","🌀⏳","chaos","time","기술 사용 시 쿨타임 초기화 확률."],
    ["salvation","영혼구제","✝️💀","holy","necro","망령이 공격과 동시에 플레이어를 소량 회복한다."]
  ].map(([id,name,icon,a,b,desc]) => ({id,name,icon,requires:[a,b],desc,tier:1}));

  const secondFusions = [
    ["sunburst","태양폭발","☀️","inferno","sacredflame","폭발과 성화가 결합해 강력한 추가 피해를 준다."],
    ["heavenfire","천화","🌩️","inferno","chainlightning","발화와 감전의 연쇄 추가타가 발생한다."],
    ["eruption","대분화","🌋","inferno","blazingrage","저체력에서 발화·파열 피해가 폭증한다."],
    ["absoluteThermal","절대열충격","❄️🔥","thermalshock","iceshatter","발화와 냉기를 함께 쌓을수록 폭발 피해 증가."],
    ["apocalypsePlague","멸화역병","🔥🦠","redplague","blackdeath","발화와 독 지속 피해가 크게 강화된다."],
    ["bloodflame","혈염","🩸🔥","bloodfeast","blazingrage","지속 피해 흡혈과 저체력 발화가 결합한다."],
    ["bloodfiend","혈귀","🩸💀","bloodfeast","berserker","저체력에서 출혈·흡혈·공격 모두 강화."],
    ["necrosisRampage","괴사폭주","☠️🩸","necrosis","bloodcurse","독·출혈·저주가 동시에 있을 때 피해 폭증."],
    ["deathlord","죽음의 군주","👑💀","deadcontract","soulfeast","영혼과 망령 수에 따라 공격력이 증가한다."],
    ["calamityArmy","재앙의 군단","☠️🦴","rottingarmy","cremationarmy","망령 공격이 독과 발화를 동시에 부여한다."],
    ["plaguelord","역병군주","🦠👑","rottingarmy","blackdeath","독 처치가 영혼과 망령을 강화한다."],
    ["flesharmy","혈육군세","🩸🦴","fleshdead","bloodfeast","출혈 적 처치 시 강화 망령을 얻는다."],
    ["vengefulspirit","원혼","👻🕯️","spiritbind","nightmare","적 공격 실패 시 영혼 반격이 발생한다."],
    ["deathpact","죽음의 계약","⚰️","deadcontract","bloodhex","혈마법 사용 시 망령이 즉시 공격한다."],
    ["wraitharmy","망령군단","🌑💀","nightmare","cremationarmy","암흑 대상에게 망령 피해가 크게 증가한다."],
    ["soulharvest","영혼수확","👻🦇","soulfeast","bloodyexecution","치명타 처치 시 영혼과 체력을 얻는다."],
    ["beheading","참수","⚔️💀","execution","collapse","치명타가 방어를 무시하고 파괴 피해를 준다."],
    ["bladestorm","검의 폭풍","🌪️⚔️","galeflurry","flurrycut","연격이 길어질수록 공격과 출혈이 크게 강화된다."],
    ["thundergodspeed","뇌신속","⚡🌪️","chainlightning","galeflurry","초신속 사용 시 추가 전격타가 발생한다."],
    ["shadowkill","무영살","🎯🌫️","moment","shadow","회피 후 다음 공격이 매우 강한 치명타가 된다."],
    ["superstrength","초괴력","💪💥","armorcrusher","berserkforce","저체력에서 방어 무시 피해가 크게 증가한다."],
    ["annihilation","절대파괴","🔨💀","collapse","execution","보호 행동 중인 적에게 막대한 치명타 피해."],
    ["bloodrain","천참혈우","🩸🌪️","flurrycut","galeflurry","연격 종료 시 출혈을 즉시 한 번 터뜨린다."],
    ["divinepunish","신벌","⚡🎯","electromark","heavenbolt","치명타가 감전 중첩을 폭발시킨다."],
    ["eternalfortress","불멸요새","🏰","ironfortress","immortality","방어·반사·재생이 서로 순환한다."],
    ["thunderbarrier","천뢰방벽","🔷⚡","reflectfield","electricfield","역장이 피해를 막을 때 감전과 반사가 함께 발동."],
    ["bloodarmor","피의 갑주","🌵🩸","ironfortress","bloodfeast","반사 피해 일부를 회복한다."],
    ["absoluteBarrier","절대역장","💎","reflectfield","lifespring","초과 회복과 반사가 역장을 계속 보충한다."],
    ["undying","불사신","🌫️❤️","shadow","immortality","회피 성공 시 체력을 회복하고 다음 공격 강화."],
    ["icefortress","빙벽성채","🧊🏰","icearmor","ironfortress","피격할수록 적을 냉각시키고 받는 피해가 감소."],
    ["spacetimecollapse","시공붕괴","⏳🌀","timestop","timecollapse","행동과 쿨타임이 크게 가속된다."],
    ["heavenarmy","천상군세","👼","salvation","sacredflame","망령이 성령화되어 공격과 회복을 동시에 지원한다."]
  ].map(([id,name,icon,a,b,desc]) => ({id,name,icon,requires:[a,b],desc,tier:2}));

  const ultimateFusions = [
    ["underworldking","명계의 왕","☠️👑","deathlord","calamityArmy","망령과 영혼이 스스로 순환하는 사령 최종 빌드."],
    ["sunofjudgement","천벌의 태양","☀️⚡","sunburst","heavenfire","발화·감전·폭발이 연쇄 발동한다."],
    ["bloodking","혈왕","🩸👑","bloodfiend","bloodrain","출혈·흡혈·연격이 저체력에서 폭발적으로 강화."],
    ["eternitycastle","영겁성","🏰✨","eternalfortress","absoluteBarrier","회복→역장→반사→재생의 방어 순환을 만든다."],
    ["masterofmoment","찰나의 지배자","⚡⏳","thundergodspeed","spacetimecollapse","추가 행동과 쿨타임 감소가 연쇄된다."],
    ["heavendescent","천계강림","👼☀️","heavenarmy","sunburst","성령의 자동 공격과 성화 폭발이 결합한다."],
    ["greatplague","대역병","🦠💀","plaguelord","necrosisRampage","독·출혈·저주가 동시에 폭증한다."],
    ["abyssarmy","심연의 군세","🌑👻","wraitharmy","vengefulspirit","적의 빗나감이 망령 반격으로 이어진다."],
    ["oneslash","일도양단","⚔️💀","beheading","shadowkill","회피 후 단 한 번의 초강력 치명타를 만든다."],
    ["thunderfrenzy","뇌신난무","🌪️⚡","bladestorm","thundergodspeed","연격과 감전 추가타가 끊임없이 이어진다."],
    ["endthermal","종말열극","❄️🔥","absoluteThermal","eruption","발화·냉기·파열을 한 번에 폭발시킨다."],
    ["worldcollapse","세계붕괴","🌀🌌","spacetimecollapse","annihilation","쿨타임 초기화와 방어 붕괴가 결합한 변칙 최종 효과."]
  ].map(([id,name,icon,a,b,desc]) => ({id,name,icon,requires:[a,b],desc,tier:3}));

  const allFusions = [...firstFusions, ...secondFusions, ...ultimateFusions];
  const effectMap = Object.fromEntries(baseEffects.map(e => [e.id, e]));
  const fusionMap = Object.fromEntries(allFusions.map(f => [f.id, f]));

  const enemyPool = [
    { name:"균열 골렘", icon:"🗿", attack:12, hp:64 },
    { name:"검은 사냥개", icon:"🐺", attack:14, hp:54 },
    { name:"갑각 마수", icon:"🦂", attack:11, hp:72 },
    { name:"공허 감시자", icon:"👁️", attack:13, hp:60 },
    { name:"철갑 망령", icon:"👻", attack:15, hp:58 },
    { name:"폭주 기사", icon:"🛡️", attack:16, hp:68 }
  ];

  const rewardNames = {
    common:["낡은 철검","견습자의 장갑","검은 가죽갑옷","은빛 부적","여행자의 장화","균열 파편"],
    rare:["푸른 혜성","망자의 손","번개 각반","핏빛 인장","냉기의 심장","마력 역장기"],
    epic:["황혼","용뼈 각반","무신의 투구","심연의 망토","사령왕의 반지","폭풍의 핵"],
    legend:["종말의 검","시간의 왕관","불멸의 성배","태양의 잔재","명계의 열쇠","세계수의 심장"]
  };
  const rewardIcons = ["🗡️","🪖","🥾","🧤","💍","🧿","🛡️","📿","⚔️","🔮"];

  let state = loadState() || freshState();
  let rewardChoices = [];
  let toastTimer = null;

  function freshState() {
    return {
      act:1, stage:1, gold:35,
      hp:100, maxHp:100, shield:0, attack:12,
      critBase:0.05, critDamageBase:1.5,
      turn:1, combo:0, rushCd:0,
      effects:Object.fromEntries(baseEffects.map(e => [e.id, 0])),
      fusions:[], souls:0, wraiths:0,
      enemy:null, log:"적의 행동을 확인하고 기술을 선택해.",
      screen:"battle", lastAction:null
    };
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      const clean = freshState();
      return {...clean, ...saved, effects:{...clean.effects, ...(saved.effects||{})}, fusions:saved.fusions||[]};
    } catch (_) { return null; }
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function roll(p) { return Math.random() < p; }
  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
  function lvl(id) { return state.effects[id] || 0; }
  function hasFusion(id) { return state.fusions.includes(id); }
  function addLog(text) { state.log = text; }

  function startEnemy() {
    const base = pick(enemyPool);
    const depth = (state.act - 1) * 6 + (state.stage - 1);
    const elite = state.stage === 6;
    const hpScale = 1 + depth * 0.13 + (elite ? 0.45 : 0);
    const atkScale = 1 + depth * 0.085 + (elite ? 0.22 : 0);
    state.enemy = {
      name: elite ? `정예 ${base.name}` : base.name,
      icon: base.icon,
      elite,
      maxHp: Math.round(base.hp * hpScale),
      hp: Math.round(base.hp * hpScale),
      attack: Math.round(base.attack * atkScale),
      armor: Math.floor(depth / 4) + (elite ? 3 : 0),
      defend:0,
      statuses:{burn:0,bleed:0,poison:0,shock:0,chill:0,curse:0,rupture:0,vulnerable:0},
      intent:null
    };
    state.turn = 1;
    state.combo = 0;
    state.shield = Math.max(0, Math.floor(state.shield * 0.25));
    state.lastAction = null;
    chooseEnemyIntent();
    if (lvl("necro") > 0 && state.wraiths > 0) {
      addLog(`망령 <span class="fusion">${state.wraiths}</span>기가 전투에 따라붙었다.`);
    } else {
      addLog("적의 행동을 확인하고 기술을 선택해.");
    }
  }

  function chooseEnemyIntent() {
    const e = state.enemy;
    const r = Math.random();
    if (r < 0.66) {
      const heavy = roll(0.24);
      e.intent = {type:"attack", name:heavy?"강타":"공격", value:Math.round(e.attack*(heavy?1.45:1))};
    } else if (r < 0.84) {
      e.intent = {type:"guard", name:"방어 자세", value:Math.round(e.maxHp*0.12)+4};
    } else {
      e.intent = {type:"attack", name:"연속 공격", value:Math.round(e.attack*0.72), hits:2};
    }
  }

  function playerDamageMultiplier() {
    let m = 1;
    m *= 1 + lvl("strength") * 0.08;
    const missing = 1 - state.hp / state.maxHp;
    m *= 1 + lvl("rage") * 0.06 * (missing * 2);
    m *= 1 + lvl("combo") * 0.025 * Math.min(state.combo, 8);
    m *= 1 + Math.min(0.5, state.souls * lvl("soul") * 0.004);
    if (hasFusion("berserkforce")) m *= 1 + missing * 0.35;
    if (hasFusion("superstrength")) m *= 1 + missing * 0.45;
    if (hasFusion("bloodfiend")) m *= 1 + missing * 0.25;
    if (hasFusion("bloodking")) m *= 1 + missing * 0.35;
    m *= 1 + firstFusions.filter(f=>hasFusion(f.id)).length * 0.012;
    m *= 1 + secondFusions.filter(f=>hasFusion(f.id)).length * 0.018;
    return m;
  }

  function critChance(extra=0) {
    let c = state.critBase + lvl("precision")*0.025 + extra;
    const s = state.enemy?.statuses;
    if (s && hasFusion("freezepoint")) c += Math.min(.20, s.chill*.012);
    if (s && hasFusion("electromark")) c += Math.min(.18, s.shock*.01);
    if (state.lastAction === "dodge" && hasFusion("moment")) c += .30;
    if (state.lastAction === "dodge" && hasFusion("shadowkill")) c += .42;
    if (hasFusion("execution")) c += .06;
    return clamp(c, 0, .88);
  }

  function critMultiplier() {
    let m = state.critDamageBase + lvl("fatal")*0.10;
    if (hasFusion("execution")) m += .25;
    if (hasFusion("deathsentence") && state.enemy.statuses.curse>0) m += .25;
    if (hasFusion("bloodyexecution") && state.enemy.statuses.bleed>0) m += .20;
    return m;
  }

  function dealDamage(base, options={}) {
    const e = state.enemy;
    if (!e || e.hp <= 0) return {damage:0,crit:false};
    let damage = base * playerDamageMultiplier();
    const curseAmp = e.statuses.curse * (0.012 + (hasFusion("doommark") ? .006 : 0));
    const vulnAmp = e.statuses.vulnerable * 0.025;
    const poisonAmp = hasFusion("corrosion") ? e.statuses.poison*.008 : 0;
    damage *= 1 + curseAmp + vulnAmp + poisonAmp;
    const crit = roll(critChance(options.critExtra || 0));
    if (crit) damage *= critMultiplier();

    const pierce = clamp(lvl("pierce")*0.08 + (hasFusion("armorcrusher") ? .15 : 0), 0, .85);
    const armorReduction = Math.max(0, e.armor * (1-pierce));
    damage = Math.max(1, damage - armorReduction);
    if (e.defend > 0) {
      const destroyAmp = 1 + lvl("destroy")*0.10 + (hasFusion("collapse") ? .25 : 0) + (hasFusion("annihilation") ? .35 : 0);
      damage *= destroyAmp;
      const absorbed = Math.min(e.defend, damage);
      e.defend -= absorbed;
      damage -= absorbed;
    }
    damage = Math.round(Math.max(0, damage));
    e.hp = Math.max(0, e.hp - damage);

    if (lvl("lifesteal") > 0 && damage > 0) {
      let heal = Math.round(damage * lvl("lifesteal") * 0.018);
      if (hasFusion("berserker")) heal = Math.round(heal * (1 + (1-state.hp/state.maxHp)));
      healPlayer(heal, false);
      if (hasFusion("soulfeast") && roll(.10 + lvl("soul")*.01)) state.souls++;
    }
    return {damage, crit};
  }

  function applyAttackStatuses(mult=1) {
    const s = state.enemy.statuses;
    if (lvl("burn")) s.burn += Math.max(1, Math.ceil(lvl("burn")*0.45*mult + (hasFusion("burncombo")?state.combo*.08:0)));
    if (lvl("bleed")) s.bleed += Math.max(1, Math.ceil(lvl("bleed")*0.42*mult + (hasFusion("flurrycut")?state.combo*.07:0)));
    if (lvl("poison")) s.poison += Math.max(1, Math.ceil(lvl("poison")*0.40*mult));
    if (lvl("shock")) s.shock += Math.max(1, Math.ceil(lvl("shock")*0.34*mult));
    if (lvl("chill")) s.chill = Math.min(12, s.chill + Math.max(1, Math.ceil(lvl("chill")*0.26*mult)));
    if (lvl("curse")) s.curse = Math.min(16, s.curse + Math.max(1, Math.ceil(lvl("curse")*0.22*mult)));
    if (lvl("vulnerable")) s.vulnerable = Math.min(10, s.vulnerable + Math.max(1, Math.ceil(lvl("vulnerable")*0.2*mult)));
    if (lvl("rupture")) {
      s.rupture += Math.max(1, Math.ceil(lvl("rupture")*0.32*mult));
      while (s.rupture >= 5 && state.enemy.hp > 0) {
        s.rupture -= 5;
        let boom = Math.round((8 + lvl("rupture")*3) * (hasFusion("inferno") ? 1.35 : 1));
        if (hasFusion("iceshatter")) boom += s.chill*2;
        state.enemy.hp = Math.max(0, state.enemy.hp - boom);
      }
    }
    if (lvl("chaos") && roll(Math.min(.45, lvl("chaos")*.045))) {
      const id = pick(["burn","bleed","poison","shock","chill","curse"]);
      s[id] += 1 + Math.floor(lvl("chaos")/4);
    }
  }

  function procShock() {
    const s = state.enemy.statuses;
    if (s.shock <= 0 || state.enemy.hp <= 0) return 0;
    let bonus = Math.round(s.shock * (1.2 + lvl("shock")*.22));
    if (hasFusion("chainlightning")) bonus = Math.round(bonus * (1 + state.combo*.04));
    if (hasFusion("turbulence")) bonus = Math.round(bonus * (.75 + Math.random()*.8));
    state.enemy.hp = Math.max(0, state.enemy.hp - bonus);
    if (hasFusion("thunderflame") && s.burn > 0) state.enemy.hp = Math.max(0, state.enemy.hp - Math.round(s.burn*0.6));
    if (hasFusion("spacetimecurrent") && roll(.18)) state.rushCd = Math.max(0, state.rushCd-1);
    return bonus;
  }

  function doPlayerAction(action) {
    if (state.screen !== "battle" || !state.enemy || state.enemy.hp <= 0) return;
    let message = "";
    let total = 0;
    let anyCrit = false;

    if (action === "attack") {
      state.combo += 1;
      const r = dealDamage(state.attack);
      total += r.damage; anyCrit ||= r.crit;
      applyAttackStatuses(1);
      total += procShock();
      message = `${r.crit?"💥 치명타! ":""}공격으로 <span class="good">${total}</span> 피해.`;
    }

    if (action === "guard") {
      state.combo = 0;
      let gain = 14 + lvl("barrier")*4 + lvl("armor")*2;
      if (hasFusion("hibernation")) gain += lvl("regen")*2;
      state.shield += gain;
      message = `수비 자세. <span class="good">역장 +${gain}</span>.`;
    }

    if (action === "precision") {
      state.combo += 1;
      let selfCost = 0;
      let power = .82;
      if (lvl("bloodmagic") > 0) {
        selfCost = Math.min(state.hp-1, 1 + Math.ceil(lvl("bloodmagic")*0.7));
        state.hp -= selfCost;
        power += lvl("bloodmagic")*.055;
      }
      const r = dealDamage(state.attack*power, {critExtra:.25});
      total += r.damage; anyCrit ||= r.crit;
      applyAttackStatuses(.85 + lvl("bloodmagic")*.03);
      if (hasFusion("bloodart")) state.enemy.statuses.bleed += Math.max(1,lvl("bloodmagic"));
      if (hasFusion("bloodhex")) state.enemy.statuses.curse += Math.max(1,Math.ceil(lvl("bloodmagic")/2));
      total += procShock();
      message = `${r.crit?"🎯 치명타! ":""}신중한 일격으로 <span class="good">${total}</span> 피해${selfCost?`, 혈마법 HP -${selfCost}`:""}.`;
    }

    if (action === "rush") {
      if (state.rushCd > 0) return;
      state.combo += 2;
      for (let i=0;i<2;i++) {
        const r = dealDamage(state.attack*.68, {critExtra:.02});
        total += r.damage; anyCrit ||= r.crit;
        applyAttackStatuses(.55);
        if (state.enemy.hp <= 0) break;
      }
      total += procShock();
      if (hasFusion("thundergodspeed") && state.enemy.hp>0) {
        const extra = Math.round(6 + lvl("shock")*3 + state.combo);
        state.enemy.hp = Math.max(0,state.enemy.hp-extra); total += extra;
      }
      state.rushCd = Math.max(1, 3 - Math.floor(lvl("haste")/5));
      message = `초신속 2연타! <span class="good">${total}</span> 피해${anyCrit?" · 치명타 포함":""}.`;
    }

    if (action !== "guard" && lvl("necro") > 0 && state.wraiths > 0 && state.enemy.hp > 0) {
      let wraithHit = Math.round(state.wraiths * (1.5 + lvl("necro")*.45));
      if (hasFusion("cremationarmy")) state.enemy.statuses.burn += Math.max(1,Math.ceil(state.wraiths/2));
      if (hasFusion("rottingarmy")) state.enemy.statuses.poison += Math.max(1,Math.ceil(state.wraiths/2));
      if (hasFusion("calamityArmy")) wraithHit = Math.round(wraithHit*1.35);
      if (hasFusion("wraitharmy") && state.enemy.statuses.curse>0) wraithHit = Math.round(wraithHit*1.4);
      state.enemy.hp = Math.max(0,state.enemy.hp-wraithHit);
      message += ` 망령이 <span class="fusion">${wraithHit}</span> 추가 피해.`;
      if (hasFusion("salvation")) healPlayer(Math.max(1,Math.ceil(state.wraiths*.5)),false);
      if (hasFusion("heavenarmy")) healPlayer(Math.max(1,state.wraiths),false);
    }

    state.lastAction = action;
    addLog(message);
    if (state.enemy.hp <= 0) { winBattle(); return; }

    enemyTurn();
    if (state.hp <= 0) { loseRun(); return; }
    state.turn += 1;
    reduceCooldowns();
    chooseEnemyIntent();
    saveState();
    render();
  }

  function enemyTurn() {
    const e = state.enemy;
    const s = e.statuses;
    let pieces = [];

    if (s.bleed > 0) {
      let bleedDmg = Math.round(s.bleed * (1.4 + lvl("bleed")*.24) * (1 + lvl("plague")*.04));
      if (hasFusion("necrosis") && s.poison>0) bleedDmg = Math.round(bleedDmg*1.25);
      if (hasFusion("bloodking")) bleedDmg = Math.round(bleedDmg*1.2);
      e.hp = Math.max(0,e.hp-bleedDmg);
      if (hasFusion("bloodfeast")) healPlayer(Math.round(bleedDmg*.12),false);
      pieces.push(`출혈 ${bleedDmg}`);
      if (hasFusion("bloodcurse")) s.curse = Math.min(16,s.curse+1);
    }
    if (e.hp <= 0) { addLog(`지속 피해로 적이 쓰러졌다. ${pieces.join(" · ")}`); winBattle(); return; }

    if (e.intent.type === "guard") {
      e.defend += e.intent.value;
      pieces.push(`적이 방어 +${e.intent.value}`);
    } else {
      const hits = e.intent.hits || 1;
      for (let i=0;i<hits;i++) {
        let missChance = lvl("dodge")*.025 + lvl("dark")*.018 + s.chill*.006;
        if (hasFusion("nightmare") && s.curse>0) missChance += .08;
        if (roll(clamp(missChance,0,.55))) {
          pieces.push("공격 회피");
          state.lastAction = "dodge";
          if (hasFusion("snowshadow")) s.chill = Math.min(12,s.chill+2);
          if (hasFusion("vengefulspirit")) {
            const retaliation = Math.round(6 + state.souls*.6 + lvl("soul")*2);
            e.hp = Math.max(0,e.hp-retaliation); pieces.push(`원혼 ${retaliation}`);
          }
          if (hasFusion("undying")) healPlayer(3+lvl("regen"),false);
          continue;
        }
        let dmg = e.intent.value;
        dmg *= 1 - Math.min(.38,lvl("armor")*.035);
        dmg *= 1 - Math.min(.30,lvl("unyielding")*.035*(1-state.hp/state.maxHp)*2);
        dmg *= 1 - Math.min(.28,s.chill*.018);
        if (hasFusion("timestop") && s.chill>=5) dmg *= .82;
        dmg = Math.max(1,Math.round(dmg));
        const blocked = Math.min(state.shield,dmg);
        state.shield -= blocked;
        dmg -= blocked;
        if (blocked>0 && hasFusion("reflectfield")) {
          const r = Math.max(1,Math.round(blocked*.25)); e.hp=Math.max(0,e.hp-r); pieces.push(`반사 ${r}`);
        }
        if (blocked>0 && hasFusion("electricfield")) s.shock += 1;
        if (dmg>0) state.hp = Math.max(0,state.hp-dmg);
        pieces.push(`피해 ${dmg}${blocked?` (역장 ${blocked})`:""}`);
        const thorn = lvl("thorns")*2 + (hasFusion("ironfortress")?Math.round(blocked*.15):0);
        if (thorn>0) { e.hp=Math.max(0,e.hp-thorn); pieces.push(`가시 ${thorn}`); }
        if (hasFusion("icearmor")) s.chill = Math.min(12,s.chill+1);
      }
    }

    if (e.hp <= 0) { addLog(`반격으로 적이 쓰러졌다. ${pieces.join(" · ")}`); winBattle(); return; }

    if (s.burn > 0) {
      let d = Math.round(s.burn*(1.25+lvl("burn")*.26)*(1+lvl("plague")*.04));
      if (hasFusion("redplague")) d=Math.round(d*1.22);
      if (hasFusion("blazingrage")) d=Math.round(d*(1+(1-state.hp/state.maxHp)*.4));
      e.hp=Math.max(0,e.hp-d); pieces.push(`발화 ${d}`);
    }
    if (s.poison > 0 && e.hp>0) {
      let d=Math.round(s.poison*(1.05+lvl("poison")*.22)*(1+lvl("plague")*.05));
      if (hasFusion("blackdeath")) d=Math.round(d*1.3);
      if (hasFusion("frostpoison")) d=Math.round(d*(1+s.chill*.025));
      e.hp=Math.max(0,e.hp-d); pieces.push(`독 ${d}`);
      if (hasFusion("venomblood")) healPlayer(Math.round(d*.08),false);
    }
    if (hasFusion("thermalshock") && s.burn>0 && s.chill>0 && e.hp>0) {
      const d=Math.round(4+Math.min(s.burn,s.chill)*1.8); e.hp=Math.max(0,e.hp-d); pieces.push(`열충격 ${d}`);
    }
    if (hasFusion("necrosisRampage") && s.poison>0 && s.bleed>0 && s.curse>0 && e.hp>0) {
      const d=Math.round((s.poison+s.bleed+s.curse)*.85); e.hp=Math.max(0,e.hp-d); pieces.push(`괴사폭주 ${d}`);
    }
    if (lvl("regen")>0) {
      let heal=2+lvl("regen")*2;
      if (hasFusion("immortality")) heal=Math.round(heal*(1+(1-state.hp/state.maxHp)));
      if (hasFusion("hibernation") && state.lastAction==="guard") heal*=2;
      healPlayer(heal,false);
    }
    if (hasFusion("lifespring") && state.hp>=state.maxHp && lvl("regen")>0) state.shield += Math.max(1,lvl("regen"));

    if (e.hp <= 0) { addLog(`지속 피해로 적이 쓰러졌다. ${pieces.join(" · ")}`); winBattle(); return; }
    if (pieces.length) addLog(`${state.log} <span class="bad">${pieces.join(" · ")}</span>`);
  }

  function healPlayer(amount, show=true) {
    if (!amount || amount<=0) return 0;
    amount = Math.round(amount*(1+lvl("healing")*.07 + lvl("holy")*.025));
    const before=state.hp;
    state.hp=Math.min(state.maxHp,state.hp+amount);
    const actual=state.hp-before;
    if (show && actual>0) addLog(`체력을 <span class="good">${actual}</span> 회복했다.`);
    return actual;
  }

  function reduceCooldowns() {
    let reduction=1;
    if (lvl("time")>=5) reduction++;
    if (hasFusion("acceleration") && roll(.28)) reduction++;
    if (hasFusion("spacetimecollapse") && roll(.20)) reduction++;
    state.rushCd=Math.max(0,state.rushCd-reduction);
    if (hasFusion("timecollapse") && roll(.08+lvl("chaos")*.005)) state.rushCd=0;
  }

  function winBattle() {
    const e=state.enemy;
    const soulGain=1+Math.floor(lvl("soul")/3)+(e.elite?2:0);
    if (lvl("soul")>0) state.souls+=soulGain;
    if (lvl("necro")>0) {
      let gain=roll(Math.min(.75,.18+lvl("necro")*.045))?1:0;
      if (hasFusion("deadcontract") && e.statuses.curse>0) gain++;
      if (hasFusion("fleshdead") && e.statuses.bleed>0) gain++;
      state.wraiths=Math.min(8,state.wraiths+gain);
    }
    const gold=12+state.act*3+(e.elite?18:0);
    state.gold+=gold;
    if (lvl("holy")>0) healPlayer(2+lvl("holy"),false);
    if (hasFusion("soulharvest") && e.statuses.bleed>0) { state.souls+=2; healPlayer(6,false); }
    state.screen="reward";
    rewardChoices=generateRewards();
    addLog(`전투 승리. ${gold}G 획득.`);
    saveState(); render();
  }

  function loseRun() {
    state.screen="gameover";
    saveState(); render();
  }

  function advanceStage() {
    state.stage++;
    if (state.stage>6) {
      state.stage=1;
      state.act++;
      state.maxHp += 8;
      state.hp = Math.min(state.maxHp, state.hp + 18);
      state.attack += 2;
    }
    state.screen="battle";
    startEnemy();
    saveState(); render();
  }

  function rarityRoll() {
    const r=Math.random();
    if (r<.05) return "legend";
    if (r<.22) return "epic";
    if (r<.58) return "rare";
    return "common";
  }

  function generateReward() {
    const rarity=rarityRoll();
    const effectCount={common:1,rare:2,epic:2,legend:3}[rarity];
    const statPower={common:1,rare:2,epic:3,legend:4}[rarity];
    const ids=[];
    while(ids.length<effectCount) {
      const id=pick(baseEffects).id;
      if(!ids.includes(id)) ids.push(id);
    }
    const effectGain=Object.fromEntries(ids.map(id=>[id, rarity==="legend"&&roll(.35)?2:1]));
    const statType=pick(["attack","maxHp","crit","heal"]);
    const stat={};
    if(statType==="attack") stat.attack=statPower+Math.floor(Math.random()*statPower)+1;
    if(statType==="maxHp") stat.maxHp=statPower*4+Math.floor(Math.random()*5);
    if(statType==="crit") stat.crit=0.005*statPower;
    if(statType==="heal") stat.heal=statPower*3;
    return {rarity,name:pick(rewardNames[rarity]),icon:pick(rewardIcons),effectGain,stat};
  }

  function generateRewards(){ return [generateReward(),generateReward(),generateReward()]; }

  function applyReward(reward) {
    Object.entries(reward.effectGain).forEach(([id,n])=>state.effects[id]=Math.min(10,lvl(id)+n));
    if(reward.stat.attack) state.attack+=reward.stat.attack;
    if(reward.stat.maxHp){ state.maxHp+=reward.stat.maxHp; state.hp+=reward.stat.maxHp; }
    if(reward.stat.crit) state.critBase=Math.min(.25,state.critBase+reward.stat.crit);
    if(reward.stat.heal) healPlayer(reward.stat.heal,false);
    const newFusions=checkFusions();
    if(newFusions.length) toast(`🧬 ${newFusions.map(f=>f.name).join(" · ")} 활성화!`);
    advanceStage();
  }

  function checkFusions() {
    const unlocked=[];
    let changed=true;
    while(changed) {
      changed=false;
      for(const f of allFusions) {
        if(hasFusion(f.id)) continue;
        let ok=false;
        if(f.tier===1) ok=f.requires.every(id=>lvl(id)>=3);
        else ok=f.requires.every(id=>hasFusion(id));
        if(ok) {
          state.fusions.push(f.id); unlocked.push(f); changed=true;
          if(f.tier===3) {
            state.maxHp+=8; state.hp=Math.min(state.maxHp,state.hp+12); state.attack+=3;
          }
        }
      }
    }
    return unlocked;
  }

  function rerollRewards() {
    if(state.gold<25) return;
    state.gold-=25;
    rewardChoices=generateRewards();
    saveState(); render();
  }

  function resetGame() {
    if(!confirm("현재 진행을 지우고 새 게임을 시작할까?")) return;
    state=freshState();
    rewardChoices=[];
    startEnemy();
    saveState(); render();
  }

  function render() {
    if(!state.enemy && state.screen!=="gameover") startEnemy();
    $("#actLabel").textContent=state.act;
    $("#stageLabel").textContent=`${state.stage}/6`;
    $("#goldLabel").textContent=state.gold;
    $("#hpText").textContent=`${state.hp} / ${state.maxHp}`;
    $("#hpFill").style.width=`${clamp(state.hp/state.maxHp*100,0,100)}%`;
    $("#shieldText").textContent=state.shield;
    $("#attackText").textContent=state.attack;
    $("#critText").textContent=`${Math.round(critChance()*100)}%`;
    $("#fusionCountText").textContent=state.fusions.length;

    $$(".screen").forEach(el=>el.classList.remove("active"));
    if(state.screen==="battle") $("#battleScreen").classList.add("active");
    if(state.screen==="reward") $("#rewardScreen").classList.add("active");
    if(state.screen==="gameover") $("#gameOverScreen").classList.add("active");

    if(state.enemy) {
      const e=state.enemy;
      $("#enemyType").textContent=e.elite?"ELITE":"NORMAL";
      $("#turnLabel").textContent=`TURN ${state.turn}`;
      $("#enemyAvatar").textContent=e.icon;
      $("#enemyName").textContent=e.name;
      $("#enemyHpText").textContent=`${e.hp} / ${e.maxHp}${e.defend?`  ·  🛡️ ${e.defend}`:""}`;
      $("#enemyHpFill").style.width=`${clamp(e.hp/e.maxHp*100,0,100)}%`;
      $("#enemyIntentName").textContent=e.intent?.name||"-";
      $("#enemyIntentValue").textContent=e.intent?.type==="attack"?`${e.intent.value}${e.intent.hits?` × ${e.intent.hits}`:""} 피해`:`방어 +${e.intent?.value||0}`;
      renderStatuses();
    }
    $("#logText").innerHTML=state.log;
    $("#comboText").textContent=`연격 ${state.combo}`;
    $("#rushHint").textContent=state.rushCd>0?`재사용까지 ${state.rushCd}턴`:`2연타 · 사용 가능`;
    const rushBtn=$("[data-action='rush']");
    if(rushBtn) rushBtn.disabled=state.rushCd>0;

    if(state.screen==="reward") renderRewards();
    $("#rerollBtn").disabled=state.gold<25;

    $("#resultStage").textContent=`Act ${state.act} - ${state.stage}/6`;
    $("#resultFusion").textContent=state.fusions.length;
    $("#resultUltimate").textContent=ultimateFusions.filter(f=>hasFusion(f.id)).length;
    saveState();
  }

  function renderStatuses() {
    const s=state.enemy.statuses;
    const meta={burn:["🔥","발화"],bleed:["🩸","출혈"],poison:["☠️","독"],shock:["⚡","감전"],chill:["❄️","냉기"],curse:["🕯️","저주"],rupture:["💥","파열"],vulnerable:["👁️","취약"]};
    $("#enemyStatuses").innerHTML=Object.entries(s).filter(([,v])=>v>0).map(([k,v])=>`<span class="status-chip">${meta[k][0]} ${meta[k][1]} ${v}</span>`).join("") || `<span class="status-chip">상태이상 없음</span>`;
  }

  function statBonusText(stat) {
    if(stat.attack) return `⚔️ 공격 +${stat.attack}`;
    if(stat.maxHp) return `❤️ 최대 HP +${stat.maxHp}`;
    if(stat.crit) return `🎯 치명타 +${Math.round(stat.crit*1000)/10}%`;
    if(stat.heal) return `✨ 즉시 회복 +${stat.heal}`;
    return "";
  }

  function renderRewards() {
    const labels={common:"COMMON",rare:"RARE",epic:"EPIC",legend:"LEGEND"};
    $("#rewardGrid").innerHTML=rewardChoices.map((r,i)=>{
      const effects=Object.entries(r.effectGain).map(([id,n])=>`<span class="bonus-chip effect">${effectMap[id].icon} ${effectMap[id].name} +${n}Lv</span>`).join("");
      return `<button class="reward-card ${r.rarity}" data-reward="${i}">
        <div class="reward-meta"><div class="reward-icon">${r.icon}</div><span class="rarity">${labels[r.rarity]}</span></div>
        <h3>${r.name}</h3>
        <div class="reward-bonuses"><span class="bonus-chip">${statBonusText(r.stat)}</span>${effects}</div>
      </button>`;
    }).join("");
    $$("[data-reward]").forEach(btn=>btn.addEventListener("click",()=>applyReward(rewardChoices[Number(btn.dataset.reward)])));
  }

  function openModal(type) {
    const backdrop=$("#modalBackdrop");
    backdrop.hidden=false;
    if(type==="effects") {
      $("#modalEyebrow").textContent="32 BASE EFFECTS";
      $("#modalTitle").textContent="기본 효과";
      const groups=[...new Set(baseEffects.map(e=>e.category))];
      $("#modalBody").innerHTML=groups.map(g=>`<div class="category-title">${g}</div><div class="effect-list">${baseEffects.filter(e=>e.category===g).map(e=>`<div class="info-card ${lvl(e.id)?"":"locked"}"><div class="info-row"><span class="info-name">${e.icon} ${e.name}</span><span class="info-level">Lv.${lvl(e.id)} / 10</span></div><div class="info-desc">${e.desc}</div></div>`).join("")}</div>`).join("");
    }
    if(type==="fusions") {
      $("#modalEyebrow").textContent="FUSION CODEX";
      $("#modalTitle").textContent=`융합 도감 ${state.fusions.length} / ${allFusions.length}`;
      const tiers=[[1,"1차 융합"],[2,"2차 융합"],[3,"궁극 융합"]];
      $("#modalBody").innerHTML=tiers.map(([tier,title])=>`<div class="category-title">${title}</div><div class="fusion-list">${allFusions.filter(f=>f.tier===tier).map(f=>{
        const on=hasFusion(f.id);
        const req=f.tier===1?f.requires.map(id=>`${effectMap[id].name} Lv.3`).join(" + "):f.requires.map(id=>fusionMap[id]?.name||id).join(" + ");
        return `<div class="info-card ${on?"":"locked"}"><div class="info-row"><span class="info-name">${on?`${f.icon} ${f.name}`:"❔ ???"}</span><span class="info-level">${on?"ACTIVE":"LOCKED"}</span></div><div class="info-desc">${on?`${f.desc}<br>조건: ${req}`:"조건을 만족하면 정체가 공개된다."}</div></div>`;
      }).join("")}</div>`).join("");
    }
    if(type==="help") {
      $("#modalEyebrow").textContent="HOW TO PLAY";
      $("#modalTitle").textContent="게임 규칙";
      $("#modalBody").innerHTML=`<div class="help-copy">
        <p><strong>목표:</strong> 전투를 반복하며 최대한 높은 Act까지 올라가.</p>
        <p><strong>보상:</strong> 승리할 때마다 3개의 장비 중 하나를 고른다. 장비에는 능력치와 기본 효과 레벨이 붙어 있다.</p>
        <p><strong>1차 융합:</strong> 특정 기본 효과 두 개가 각각 <code>Lv.3</code>이 되면 자동 활성화된다.</p>
        <p><strong>2차/궁극 융합:</strong> 필요한 하위 융합을 모두 활성화하면 자동 해금된다. 궁극 융합은 해금 순간 최대 HP와 공격 보너스도 얻는다.</p>
        <p><strong>Act:</strong> 6번째 스테이지는 정예전이다. 6/6을 넘기면 다음 Act로 넘어가며 적이 강해진다.</p>
        <p><strong>저장:</strong> 진행 상황은 브라우저 <code>localStorage</code>에 자동 저장된다.</p>
      </div>`;
    }
  }

  function toast(msg) {
    const el=$("#toast");
    el.textContent=msg; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
  }

  $$("[data-action]").forEach(btn=>btn.addEventListener("click",()=>doPlayerAction(btn.dataset.action)));
  $$(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".nav-btn").forEach(b=>b.classList.toggle("active",b===btn));
    if(btn.dataset.view==="battle") return;
    openModal(btn.dataset.view);
  }));
  $("#closeModalBtn").addEventListener("click",()=>$("#modalBackdrop").hidden=true);
  $("#modalBackdrop").addEventListener("click",(e)=>{ if(e.target.id==="modalBackdrop") e.currentTarget.hidden=true; });
  $("#rerollBtn").addEventListener("click",rerollRewards);
  $("#restartBtn").addEventListener("click",()=>{ state=freshState(); startEnemy(); saveState(); render(); });
  $("#resetBtn").addEventListener("click",resetGame);

  if(!state.enemy && state.screen!=="gameover") startEnemy();
  if(state.screen==="reward") rewardChoices=generateRewards();
  checkFusions();
  render();
})();
