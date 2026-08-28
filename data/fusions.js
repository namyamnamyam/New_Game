window.ZERO_LINE = window.ZERO_LINE || {};

const F = (id,name,icon,a,b,desc) => ({id,name,icon,a,b,desc});

ZERO_LINE.firstFusions = [
  F("inferno","폭염","🔥💥","burn","rupture","파열 폭발과 발화가 서로를 증폭한다."),
  F("thunderflame","뇌화","🔥⚡","burn","shock","감전 발동 시 발화를 추가로 태운다."),
  F("thermalshock","열충격","🔥❄️","burn","chill","발화와 냉기가 함께 있으면 추가 피해를 준다."),
  F("redplague","홍염역병","🔥🦠","burn","plague","발화 지속 피해와 전염력이 증가한다."),
  F("cremationarmy","화장군단","🔥💀","burn","necro","망령 공격이 발화를 부여한다."),
  F("sacredflame","성화","🔥✝️","burn","holy","저주·암흑 대상에게 발화가 강해진다."),
  F("blazingrage","화광","🔥😡","burn","rage","체력이 낮을수록 발화 피해가 강해진다."),
  F("burncombo","연소연타","🔥⚔️","burn","combo","연격이 높을수록 발화를 더 쌓는다."),
  F("bloodfeast","혈식","🩸🦇","bleed","lifesteal","출혈 피해 일부를 회복한다."),
  F("necrosis","괴사","🩸☠️","bleed","poison","독과 출혈이 함께 있으면 지속 피해가 증가한다."),
  F("bloodcurse","혈액저주","🩸🕯️","bleed","curse","출혈 발동 시 저주를 추가로 쌓는다."),
  F("arterycut","절맥","🩸🎯","bleed","precision","치명타 시 출혈을 추가 부여한다."),
  F("bloodyexecution","혈의 처형","🩸💀","bleed","fatal","출혈 대상에게 치명타 피해가 증가한다."),
  F("flurrycut","난도","🩸⚔️","bleed","combo","연격에 비례해 출혈 부여량이 증가한다."),
  F("fleshdead","혈육망자","🩸💀","bleed","necro","출혈 상태 적 처치 시 망령이 강화된다."),
  F("bloodart","혈계술","🩸🩸","bleed","bloodmagic","혈마법 공격이 출혈을 크게 부여한다."),

  F("blackdeath","흑사병","☠️🦠","poison","plague","독 피해가 강해지고 오래 지속된다."),
  F("neurotoxin","신경독","☠️⚡","poison","shock","독 상태 적의 공격 안정성이 낮아진다."),
  F("frostpoison","동상독","☠️❄️","poison","chill","냉기 중첩에 비례해 독 피해가 증가한다."),
  F("corrosion","부식","☠️👁️","poison","vulnerable","독 중첩만큼 직접 피해가 증가한다."),
  F("rottingarmy","부패군세","☠️💀","poison","necro","망령 공격이 독을 부여한다."),
  F("venomblood","독혈","☠️🦇","poison","lifesteal","독 피해 일부를 회복한다."),
  F("toxicfog","맹독연무","☠️🌑","poison","dark","독 중첩에 따라 적의 명중이 불안정해진다."),
  F("mutantpoison","변이독","☠️🌀","poison","chaos","독 발동 시 무작위 상태이상이 추가될 수 있다."),

  F("chainlightning","뇌격연쇄","⚡⚔️","shock","combo","연격 시 감전 추가 피해가 증가한다."),
  F("electricfield","뇌전장","⚡🔷","shock","barrier","역장이 피해를 막으면 감전을 부여한다."),
  F("superconduct","초전도","⚡💨","shock","haste","감전 발동 시 행동 기회를 앞당길 수 있다."),
  F("spacetimecurrent","시공전류","⚡⏳","shock","time","감전 발동 시 기술 쿨타임이 줄어들 수 있다."),
  F("electromark","전자표식","⚡🎯","shock","precision","감전 대상 치명타 확률이 증가한다."),
  F("overload","과부하","⚡🔨","shock","destroy","보호 상태의 적에게 감전 피해가 강해진다."),
  F("heavenbolt","천뢰","⚡✝️","shock","holy","감전이 쌓이면 성광 낙뢰가 발동한다."),
  F("turbulence","난류","⚡🌀","shock","chaos","감전 피해가 불규칙하게 크게 증폭될 수 있다."),

  F("iceshatter","빙쇄","❄️💥","chill","rupture","파열 폭발 시 냉기를 소비해 추가 피해를 준다."),
  F("icearmor","빙갑","❄️🛡️","chill","armor","피격 시 공격자에게 냉기를 부여한다."),
  F("snowshadow","설영","❄️🌫️","chill","dodge","회피 시 적에게 냉기를 부여한다."),
  F("freezepoint","빙점","❄️🎯","chill","precision","냉기 중첩이 높을수록 치명타 확률이 증가한다."),
  F("frostbreak","동결파쇄","❄️👁️","chill","vulnerable","냉기가 충분히 쌓이면 취약을 추가한다."),
  F("hibernation","동면","❄️❤️","chill","regen","수비한 턴의 재생량이 크게 증가한다."),
  F("timestop","시간정지","❄️⏳","chill","time","냉기가 높은 적의 행동력이 크게 약화된다."),
  F("holyice","성빙","❄️✝️","chill","holy","냉기 대상에게 성광 보너스 피해를 준다."),

  F("deathsentence","사형선고","🕯️💀","curse","fatal","저주 대상에게 치명타 피해가 크게 증가한다."),
  F("doommark","파멸낙인","🕯️👁️","curse","vulnerable","저주와 취약이 서로를 증폭한다."),
  F("nightmare","악몽","🕯️🌑","curse","dark","저주 대상의 공격력과 명중 안정성이 감소한다."),
  F("deadcontract","망자계약","🕯️💀","curse","necro","저주 상태 적 처치 시 망령 획득량이 증가한다."),
  F("soulbind","혼령속박","🕯️👻","curse","soul","영혼을 보유할수록 저주가 강해진다."),
  F("bloodhex","혈주","🕯️🩸","curse","bloodmagic","혈마법 사용 시 저주를 함께 부여한다."),
  F("badomen","불길한 징조","🕯️🌀","curse","chaos","저주 상태 적에게 무작위 약화가 발생할 수 있다."),
  F("plaguecurse","역병주","🕯️🦠","curse","plague","저주와 지속 피해가 함께 증폭된다."),

  F("armorbreak","중갑분쇄","💪🗡️","strength","pierce","공격력 증가분 일부가 방어 무시 피해가 된다."),
  F("berserkstrength","광폭","💪😡","strength","rage","체력이 낮을수록 괴력 효과가 추가 증가한다."),
  F("execution","처형","🎯💀","precision","fatal","치명타 확률과 피해가 서로 강화된다."),
  F("collapse","붕괴","🗡️🔨","pierce","destroy","보호막과 방어를 동시에 크게 깎는다."),
  F("berserker","광전사","😡🦇","rage","lifesteal","체력이 낮을수록 흡혈량이 증가한다."),
  F("galecombo","질풍연참","⚔️💨","combo","haste","연속 공격 시 행동 속도가 상승한다."),
  F("instant","찰나","🌫️🎯","dodge","precision","회피 후 다음 공격의 치명타 확률이 크게 증가한다."),
  F("fortress","철옹성","🛡️🌵","armor","thorns","감소시킨 피해 일부를 가시 피해로 돌려준다."),
  F("reflectfield","반사장","🔷🌵","barrier","thorns","역장이 피해를 막을 때 반사 피해를 준다."),
  F("immortality","불사성","🧱❤️","unyielding","regen","체력이 낮을수록 재생량이 증가한다."),
  F("lifespring","생명의 샘","❤️✨","regen","healing","초과 회복을 임시 보호막으로 바꿀 수 있다."),
  F("soulfeast","영혼포식","🦇👻","lifesteal","soul","흡혈할 때 일정 확률로 영혼을 얻는다."),
  F("acceleration","가속","💨⏳","haste","time","행동할 때마다 기술 재사용 시간이 감소한다."),
  F("shadow","그림자","🌑🌫️","dark","dodge","회피 시 그림자 중첩을 얻어 다음 공격을 강화한다."),
  F("timecollapse","시간붕괴","🌀⏳","chaos","time","스킬 쿨타임이 변칙적으로 크게 줄어들 수 있다."),
  F("soulrelease","영혼구제","✝️💀","holy","necro","망령 일부가 성령으로 변화해 회복과 보호를 지원한다.")
];

ZERO_LINE.secondFusions = [
  F("solarburst","태양폭발","☀️","inferno","sacredflame","파열 폭발이 성화 폭발로 변하며 주변 적에게 추가 피해를 준다."),
  F("skyfire","천화","🌩️","inferno","chainlightning","발화와 감전이 서로 연쇄 발동한다."),
  F("eruption","대분화","🌋","inferno","blazingrage","저체력일수록 발화·파열 피해가 폭증한다."),
  F("absoluteheat","절대열충격","❄️🔥","thermalshock","iceshatter","발화와 냉기가 교차할수록 열충격이 누적된다."),
  F("annihilationplague","멸화역병","🔥🦠","redplague","blackdeath","독과 발화가 함께 전염된다."),
  F("bloodflame","혈염","🩸🔥","bloodfeast","blazingrage","흡혈할 때 발화가 강화되고 발화 피해 일부도 회복으로 전환된다."),
  F("bloodking","혈귀","🩸💀","bloodfeast","berserker","저체력에서 공격·흡혈·출혈이 크게 강화된다."),
  F("necrosisrampage","괴사폭주","☠️🩸","necrosis","bloodcurse","독·출혈·저주가 동시에 있는 적의 지속 피해가 서로 증폭된다."),

  F("deathlord","죽음의 군주","👑💀","deadcontract","soulfeast","영혼을 소비해 망령을 부르고 군단 수에 따라 강화된다."),
  F("disasterarmy","재앙의 군단","☠️🦴","rottingarmy","cremationarmy","망령이 독을 퍼뜨리고 사라질 때 발화 폭발을 일으킨다."),
  F("plaguelord","역병군주","🦠👑","rottingarmy","blackdeath","망령이 독을 퍼뜨리고 감염된 적 처치 시 강화된다."),
  F("flesharmy","혈육군세","🩸🦴","fleshdead","bloodfeast","출혈 상태 적을 처치하면 강화된 혈육 망령을 얻는다."),
  F("vengeful","원혼","👻🕯️","soulbind","nightmare","저주받은 적이 공격에 실패하면 원혼이 반격한다."),
  F("deathpact","죽음의 계약","⚰️","deadcontract","bloodhex","체력을 소모한 공격이 망령을 강화한다."),
  F("spectralarmy","망령군단","🌑💀","nightmare","cremationarmy","망령이 암흑과 발화를 함께 퍼뜨린다."),
  F("soulharvest","영혼수확","👻🦇","soulfeast","bloodyexecution","치명타 처치 시 영혼을 대량 획득하고 회복한다."),

  F("beheading","참수","⚔️💀","execution","collapse","방어가 무너진 적에게 치명타 추가 피해를 준다."),
  F("swordstorm","검의 폭풍","🌪️⚔️","galecombo","flurrycut","연속 행동 중 연격을 유지하며 출혈을 쌓는다."),
  F("thunderhaste","뇌신속","⚡🌪️","chainlightning","galecombo","추가 행동이 발생하면 전격 연쇄 공격이 발동한다."),
  F("shadowkill","무영살","🎯🌫️","instant","shadow","회피 후 첫 공격이 치명타와 관통에 특화된다."),
  F("superstrength","초괴력","💪💥","armorbreak","berserkstrength","저체력일수록 공격력이 폭증하며 방어 무시가 강화된다."),
  F("absolutedestruction","절대파괴","🔨💀","collapse","overload","보호막 파괴 시 취약과 감전 폭발을 남긴다."),
  F("bloodrain","천참혈우","🩸🌪️","flurrycut","bloodyexecution","연격 종료 시 쌓인 출혈을 한 번 즉시 발동한다."),
  F("divinepunishment","신벌","⚡🎯","electromark","heavenbolt","치명타와 감전이 천뢰를 충전해 자동 낙뢰를 일으킨다."),

  F("eternalfortress","불멸요새","🏰","fortress","immortality","피해 감소·반사·재생이 한 순환으로 묶인다."),
  F("thunderbarrier","천뢰방벽","🔷⚡","reflectfield","electricfield","역장을 공격한 적에게 반사와 감전을 동시에 준다."),
  F("bloodarmor","피의 갑주","🌵🩸","fortress","bloodfeast","반사 피해 일부를 체력으로 흡수한다."),
  F("absolutebarrier","절대역장","💎","reflectfield","lifespring","초과 회복이 역장이 되고 역장 파괴 시 일부를 회복한다."),
  F("undying","불사신","🌫️❤️","shadow","immortality","회피할수록 재생이 증가한다."),
  F("icefortress","빙벽성채","🧊🏰","icearmor","fortress","공격한 적에게 냉기를 쌓고 냉기 대상 피해를 줄인다."),

  F("spacetimecollapse","시공붕괴","⏳🌀","timestop","timecollapse","행동 지연과 쿨타임 변칙이 겹쳐 추가 행동을 만들 수 있다."),
  F("heavenlyarmy","천상군세","👼","soulrelease","sacredflame","성령이 공격·회복·보호를 상황에 따라 자동 수행한다.")
];

ZERO_LINE.ultimateFusions = [
  F("underworldking","명계의 왕","☠️👑","deathlord","disasterarmy","적 처치→망령→영혼→다시 망령으로 이어지는 사령 순환을 완성한다."),
  F("sunjudgment","천벌의 태양","☀️⚡","solarburst","skyfire","발화·감전·폭발이 연쇄 발동하고 일정 횟수마다 천벌이 떨어진다."),
  F("bloodkingultimate","혈왕","🩸👑","bloodking","bloodrain","출혈 피해가 흡혈로 이어지고 저체력에서 연격·출혈·회복이 폭증한다."),
  F("eternalcastle","영겁성","🏰✨","eternalfortress","absolutebarrier","재생→역장→반사→재생의 방어 순환을 완성한다."),
  F("momentmaster","찰나의 지배자","⚡⏳","thunderhaste","spacetimecollapse","감전·추가 행동·쿨타임 감소가 서로를 가속한다."),
  F("heavenfall","천계강림","👼☀️","heavenlyarmy","solarburst","성령들이 성화를 쌓고 일정 조건에서 동시에 천벌을 일으킨다."),
  F("greatplague","대역병","🦠💀","plaguelord","necrosisrampage","독·출혈·저주가 한 덩어리처럼 증폭되고 퍼진다."),
  F("abyssarmy","심연의 군세","🌑👻","spectralarmy","vengeful","적의 공격 실패가 원혼과 망령을 불러 암흑 순환을 만든다."),
  F("onecut","일도양단","⚔️💀","beheading","shadowkill","회피 후 첫 공격이 방어를 크게 무시하는 결정타가 된다."),
  F("thunderstorm","뇌신난무","🌪️⚡","swordstorm","thunderhaste","연격과 추가 행동이 끊기지 않으며 감전이 연쇄 폭발한다."),
  F("apocalypseheat","종말열극","❄️🔥","absoluteheat","eruption","발화와 냉기를 교차시켜 열극을 쌓고 최대치에서 대폭발시킨다."),
  F("worldcollapse","세계붕괴","🌀🌌","spacetimecollapse","absolutedestruction","시간과 방어 규칙을 흔들어 적의 보호를 붕괴시키고 기술을 재가속한다.")
];

ZERO_LINE.allFusionMaps = {
  first: Object.fromEntries(ZERO_LINE.firstFusions.map(x => [x.id,x])),
  second: Object.fromEntries(ZERO_LINE.secondFusions.map(x => [x.id,x])),
  ultimate: Object.fromEntries(ZERO_LINE.ultimateFusions.map(x => [x.id,x]))
};