window.ZERO_LINE = window.ZERO_LINE || {};

ZERO_LINE.baseEffects = [
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

  { id:"haste", name:"신속", icon:"💨", category:"특수", desc:"행동 속도와 초신속 활용 능력을 높인다." },
  { id:"time", name:"시간", icon:"⏳", category:"특수", desc:"기술 재사용 대기시간이 더 빠르게 감소한다." },
  { id:"dark", name:"암흑", icon:"🌑", category:"특수", desc:"적의 공격이 빗나갈 확률을 높인다." },
  { id:"chaos", name:"혼돈", icon:"🌀", category:"특수", desc:"공격 시 무작위 기본 상태이상을 추가로 부여할 수 있다." },
  { id:"necro", name:"사령술", icon:"💀", category:"특수", desc:"적 처치 시 망령을 얻고 다음 전투에서 자동 공격을 지원한다." },
  { id:"soul", name:"영혼", icon:"👻", category:"특수", desc:"적 처치 시 영혼을 얻고 영혼 수에 따라 공격력이 증가한다." },
  { id:"bloodmagic", name:"혈마법", icon:"🩸", category:"특수", desc:"체력을 조금 소모해 신중한 일격의 피해를 증폭한다." },
  { id:"holy", name:"성광", icon:"✝️", category:"특수", desc:"회복을 강화하고 저주·사령 계열과 특수 융합한다." }
];

ZERO_LINE.effectMap = Object.fromEntries(ZERO_LINE.baseEffects.map(effect => [effect.id, effect]));