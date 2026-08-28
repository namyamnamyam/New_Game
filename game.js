(() => {
  "use strict";

  const D = window.ZERO_LINE;
  const APP = document.getElementById("app");
  const STORAGE_KEY = "zero-line-save-v2";
  const META_KEY = "zero-line-meta-v1";
  const STAGES_PER_CARRIAGE = 6;
  let currentTab = "battle";
  let state;
  let meta;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const pct = n => `${Math.round(n * 100)}%`;
  const effectLv = id => state.effects[id] || 0;
  const carriage = () => D.carriageMap[state.carriageId];

  const intentDefs = {
    attack: { icon:"⚔️", name:"공격", desc:"정면으로 공격한다.", mult:1 },
    heavy: { icon:"💥", name:"강공격", desc:"강한 일격을 준비한다.", mult:1.55 },
    flurry: { icon:"⚔️", name:"연속 공격", desc:"두 번 연속으로 공격한다.", mult:.68, hits:2 },
    guard: { icon:"🛡️", name:"방어", desc:"공격 대신 방어 태세를 갖춘다." },
    recover: { icon:"✚", name:"재정비", desc:"체력을 조금 회복한다." }
  };

  function freshMeta(){
    return { seenIntro:false, deaths:0, bestAct:1, discovered:{first:[],second:[],ultimate:[]} };
  }

  function freshState(showIntro=true){
    return {
      version:2,
      act:1,
      stage:1,
      carriageId:"passenger",
      route:["passenger"],
      hp:120,
      maxHp:120,
      shield:0,
      attack:12,
      gold:20,
      effects:{},
      souls:0,
      wraiths:0,
      screen:showIntro ? "intro" : "battle",
      battle:null,
      rewards:null,
      nextChoices:null,
      rerollCost:15,
      log:["0호선의 문이 닫혔다."],
      lastUnlocks:[]
    };
  }

  function load(){
    try { meta = JSON.parse(localStorage.getItem(META_KEY)) || freshMeta(); }
    catch { meta = freshMeta(); }
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      state = saved && saved.version === 2 ? saved : freshState(!meta.seenIntro);
    } catch {
      state = freshState(!meta.seenIntro);
    }
    if (!state.battle && state.screen === "battle") createBattle();
    updateDiscoveries(false);
  }

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function log(text, tone=""){
    state.log.unshift(`${tone ? `[${tone}] ` : ""}${text}`);
    state.log = state.log.slice(0, 18);
  }

  function toast(text, gold=false){
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap){
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = `toast${gold ? " gold" : ""}`;
    el.textContent = text;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  function addEffect(id, amount){
    state.effects[id] = clamp(effectLv(id) + amount, 0, 10);
  }

  function firstLevel(f){
    const min = Math.min(effectLv(f.a), effectLv(f.b));
    if (min >= 10) return 4;
    if (min >= 7) return 3;
    if (min >= 5) return 2;
    if (min >= 3) return 1;
    return 0;
  }

  function fusionLevels(){
    const first = {};
    D.firstFusions.forEach(f => first[f.id] = firstLevel(f));
    const second = {};
    D.secondFusions.forEach(f => {
      const min = Math.min(first[f.a] || 0, first[f.b] || 0);
      second[f.id] = min >= 2 ? clamp(min - 1, 1, 3) : 0;
    });
    const ultimate = {};
    D.ultimateFusions.forEach(f => {
      const min = Math.min(second[f.a] || 0, second[f.b] || 0);
      ultimate[f.id] = min >= 2 ? 1 : 0;
    });
    return {first, second, ultimate};
  }

  function hasFusion(id){
    const f = fusionLevels();
    return (f.first[id] || f.second[id] || f.ultimate[id] || 0) > 0;
  }

  function updateDiscoveries(notify=true){
    const levels = fusionLevels();
    const newly = [];
    [["first",D.firstFusions],["second",D.secondFusions],["ultimate",D.ultimateFusions]].forEach(([tier,list]) => {
      list.forEach(f => {
        if (levels[tier][f.id] > 0 && !meta.discovered[tier].includes(f.id)){
          meta.discovered[tier].push(f.id);
          newly.push({tier,f});
        }
      });
    });
    state.lastUnlocks = newly.map(x => x.f.id);
    if (notify){
      newly.forEach(({tier,f}) => {
        const label = tier === "ultimate" ? "궁극 융합" : tier === "second" ? "2차 융합" : "1차 융합";
        toast(`${f.icon} ${label} 해금 — ${f.name}`, tier === "ultimate");
        log(`${f.name} 융합이 활성화됐다.`, "융합");
      });
    }
    return levels;
  }

  function activeFusionPower(){
    const f = fusionLevels();
    const first = Object.values(f.first).filter(Boolean).length;
    const second = Object.values(f.second).filter(Boolean).length;
    const ultimate = Object.values(f.ultimate).filter(Boolean).length;
    return {
      first, second, ultimate,
      damage: 1 + first * .012 + second * .035 + ultimate * .10,
      defense: clamp(second * .008 + ultimate * .025, 0, .25)
    };
  }

  function pickIntent(isBoss=false){
    const pool = isBoss
      ? ["attack","heavy","heavy","flurry","guard","recover"]
      : ["attack","attack","heavy","flurry","guard","recover"];
    return choice(pool);
  }

  function effectiveRuleKey(){
    if (!state.battle) return carriage().ruleKey;
    return state.battle.ruleKey || carriage().ruleKey;
  }

  function createBattle(){
    const car = carriage();
    const isBoss = state.stage === STAGES_PER_CARRIAGE;
    let ruleKey = car.ruleKey;
    if (ruleKey === "conductor"){
      ruleKey = choice(["heat","storm","freeze","war","mirror","clock","dream","garden","zerog"]);
    }
    const growth = (state.act - 1) * 26 + (state.stage - 1) * 11;
    let maxHp = Math.round(74 + growth);
    let attack = 8 + state.act * 2.2 + state.stage * .85;
    if (isBoss){ maxHp = Math.round(maxHp * 1.8); attack *= 1.22; }
    if (["beast","vault"].includes(ruleKey)){ maxHp *= 1.16; attack *= 1.12; }
    if (ruleKey === "ash"){ maxHp *= 1.24; attack *= 1.18; }
    if (ruleKey === "mirror"){
      const playerScale = state.attack + Object.values(state.effects).reduce((a,b) => a+b,0) * .7;
      maxHp += Math.round(playerScale * 1.5);
      attack += playerScale * .08;
    }
    if (ruleKey === "lab"){
      const mod = choice(["hp","attack","guard"]);
      if (mod === "hp") maxHp *= 1.28;
      if (mod === "attack") attack *= 1.22;
      state._labMod = mod;
    }
    state.shield = 0;
    state.battle = {
      name:isBoss ? car.boss : choice(car.enemies),
      isBoss,
      maxHp:Math.round(maxHp),
      hp:Math.round(maxHp),
      attack:Math.round(attack),
      guard:0,
      turn:1,
      intent:pickIntent(isBoss),
      statuses:{burn:0,bleed:0,poison:0,shock:0,chill:0,curse:0,vulnerable:0,rupture:0},
      revived:false,
      dodgedLast:false,
      hasteCd:0,
      ruleKey
    };
    log(`${state.stage === STAGES_PER_CARRIAGE ? "객차의 주인" : "적"} ‘${state.battle.name}’이 나타났다.`);
    save();
  }

  function playerDamageMultiplier(){
    const b = state.battle;
    const rule = effectiveRuleKey();
    let mult = activeFusionPower().damage;
    const missing = 1 - state.hp / state.maxHp;
    mult *= 1 + effectLv("strength") * .055;
    mult *= 1 + effectLv("rage") * missing * .075;
    if (hasFusion("berserkstrength")) mult *= 1 + missing * .18;
    if (hasFusion("superstrength")) mult *= 1 + missing * .22;
    if (rule === "freeze" && b.turn <= 2) mult *= .84;
    if (rule === "clock" && b.turn % 2 === 1) mult *= 1.16;
    if (rule === "clock" && b.turn % 2 === 0) mult *= .92;
    return mult;
  }

  function enemyDamageMultiplier(){
    const b = state.battle;
    const rule = effectiveRuleKey();
    let mult = 1;
    if (rule === "war") mult *= 1.18;
    if (rule === "flood") mult *= 1 + Math.min(.5, (b.turn - 1) * .055);
    if (rule === "clock" && b.turn % 2 === 0) mult *= 1.16;
    if (rule === "clock" && b.turn % 2 === 1) mult *= .92;
    mult *= 1 - Math.min(.3, b.statuses.chill * .018);
    return mult;
  }

  function playerDodgeChance(){
    let chance = effectLv("dodge") * .018 + effectLv("dark") * .009;
    const rule = effectiveRuleKey();
    if (rule === "dream") chance += .11;
    if (rule === "zerog") chance += .12;
    return clamp(chance,0,.58);
  }

  function enemyDodgeChance(){
    const rule = effectiveRuleKey();
    let chance = 0;
    if (rule === "dream") chance += .08;
    if (rule === "zerog") chance += .10;
    return chance;
  }

  function healPlayer(amount, source="회복"){
    if (amount <= 0) return;
    const amp = 1 + effectLv("healing") * .07 + effectLv("holy") * .035;
    const final = Math.max(1, Math.round(amount * amp));
    const before = state.hp;
    state.hp = clamp(state.hp + final, 0, state.maxHp);
    const healed = state.hp - before;
    if (healed > 0) log(`${source}으로 HP ${healed} 회복.`, "회복");
    const overflow = final - healed;
    if (overflow > 0 && hasFusion("lifespring")) state.shield += Math.round(overflow * .65);
  }

  function damagePlayer(raw, source="공격"){
    if (raw <= 0) return 0;
    if (Math.random() < playerDodgeChance()){
      state.battle.dodgedLast = true;
      log(`${source}을 회피했다.`, "회피");
      if (hasFusion("snowshadow")) state.battle.statuses.chill += 2;
      return 0;
    }
    let amount = raw * enemyDamageMultiplier();
    amount *= 1 - Math.min(.32, effectLv("armor") * .025);
    const missing = 1 - state.hp / state.maxHp;
    amount *= 1 - Math.min(.3, effectLv("unyielding") * missing * .06);
    amount *= 1 - activeFusionPower().defense;
    if (hasFusion("eternalfortress")) amount *= .9;
    if (hasFusion("eternalcastle")) amount *= .82;
    amount = Math.max(1, Math.round(amount));
    const shieldBefore = state.shield;
    const absorbed = Math.min(state.shield, amount);
    state.shield -= absorbed;
    amount -= absorbed;
    if (absorbed > 0 && hasFusion("electricfield")) state.battle.statuses.shock += Math.max(1, Math.round(absorbed / 8));
    if (absorbed > 0 && hasFusion("reflectfield")){
      const reflected = Math.max(1, Math.round(absorbed * .22));
      damageEnemy(reflected, "반사장", true);
    }
    if (amount > 0){
      state.hp = clamp(state.hp - amount, 0, state.maxHp);
      log(`${source}으로 ${amount} 피해를 받았다.`, "피해");
      const thorns = effectLv("thorns");
      if (thorns > 0){
        let reflect = Math.round(thorns * 1.6);
        if (hasFusion("fortress")) reflect += Math.round((shieldBefore - state.shield + amount) * .08);
        if (reflect > 0) damageEnemy(reflect, "가시", true);
      }
    }
    if (state.hp <= 0) die();
    return amount + absorbed;
  }

  function damageEnemy(raw, source="공격", passive=false){
    const b = state.battle;
    if (!b || raw <= 0) return false;
    let amount = Math.max(1, Math.round(raw));
    if (b.guard > 0){
      const pierce = clamp(effectLv("pierce") * .055, 0, .55);
      const blockable = Math.round(amount * (1 - pierce));
      const blocked = Math.min(b.guard, blockable);
      b.guard -= blocked;
      amount -= blocked;
    }
    b.hp -= amount;
    log(`${source} — ${amount} 피해.`, passive ? "효과" : "공격");
    if (b.hp <= 0){
      if (effectiveRuleKey() === "revive" && !b.isBoss && !b.revived){
        b.revived = true;
        b.hp = Math.round(b.maxHp * .28);
        b.statuses = {burn:0,bleed:0,poison:0,shock:0,chill:0,curse:0,vulnerable:0,rupture:0};
        log(`${b.name}이 다시 움직이기 시작했다.`, "객차 규칙");
        return false;
      }
      victory();
      return true;
    }
    return false;
  }

  function applyAttackStatuses(critical=false){
    const s = state.battle.statuses;
    const add = (id, div=2) => Math.max(0, Math.ceil(effectLv(id) / div));
    s.burn += add("burn",2);
    s.bleed += add("bleed",2);
    s.poison += add("poison",2);
    s.shock += add("shock",2);
    s.chill += add("chill",3);
    s.curse += add("curse",3);
    s.vulnerable += add("vulnerable",3);
    s.rupture += add("rupture",2);
    if (critical && hasFusion("arterycut")) s.bleed += 2;
    if (hasFusion("burncombo")) s.burn += Math.floor(effectLv("combo") / 4);
    if (hasFusion("flurrycut")) s.bleed += Math.floor(effectLv("combo") / 4);
    if (effectLv("chaos") > 0 && Math.random() < effectLv("chaos") * .045){
      choice(["burn","bleed","poison","shock","chill","curse"]);
      const key = choice(["burn","bleed","poison","shock","chill","curse"]);
      s[key] += 2;
      log(`혼돈이 ${D.effectMap[key].name}을 추가로 일으켰다.`, "효과");
    }
    if (s.rupture >= 8){
      s.rupture -= 8;
      let burst = 14 + effectLv("rupture") * 4;
      if (hasFusion("inferno")) burst *= 1.35 + Math.min(.4, s.burn * .02);
      if (hasFusion("iceshatter")) burst *= 1.2 + Math.min(.35, s.chill * .02);
      damageEnemy(burst, "파열 폭발", true);
    }
  }

  function dealPlayerHit(mult=1, opts={}){
    if (state.screen !== "battle" || !state.battle) return;
    const b = state.battle;
    if (Math.random() < enemyDodgeChance()){
      log(`${b.name}이 공격을 피했다.`, "빗나감");
      return false;
    }
    let base = state.attack + effectLv("strength") * 1.7 + state.souls * .22;
    let critChance = .05 + effectLv("precision") * .022;
    if (b.statuses.shock > 0 && hasFusion("electromark")) critChance += .12;
    if (b.dodgedLast && hasFusion("instant")) critChance += .28;
    if (opts.careful) critChance += .14;
    critChance = clamp(critChance,0,.8);
    const critical = Math.random() < critChance;
    let damage = base * mult * playerDamageMultiplier();
    if (opts.careful) damage *= 1.42;
    if (opts.careful && effectLv("bloodmagic") > 0){
      const cost = Math.min(state.hp - 1, 2 + Math.ceil(effectLv("bloodmagic") / 2));
      if (cost > 0){ state.hp -= cost; damage *= 1 + effectLv("bloodmagic") * .09; log(`혈마법이 HP ${cost}를 소모했다.`, "효과"); }
    }
    if (critical){
      damage *= 1.5 + effectLv("fatal") * .085;
      if (hasFusion("execution")) damage *= 1.16;
      if (b.statuses.bleed > 0 && hasFusion("bloodyexecution")) damage *= 1.18;
    }
    damage *= 1 + Math.min(.45, b.statuses.vulnerable * .025 + b.statuses.curse * .012);
    if (hasFusion("corrosion") && b.statuses.poison > 0) damage *= 1 + Math.min(.28,b.statuses.poison*.012);
    if (hasFusion("thermalshock") && b.statuses.burn > 0 && b.statuses.chill > 0) damage *= 1.18;
    if (hasFusion("onecut") && b.dodgedLast) damage *= 1.48;
    const dealt = Math.round(damage);
    const dead = damageEnemy(dealt, critical ? "치명타" : "직접 공격");
    if (dead) return true;
    applyAttackStatuses(critical);
    if (effectLv("shock") > 0 && b.statuses.shock > 0){
      let shock = Math.round(b.statuses.shock * (1.1 + effectLv("shock") * .08));
      if (hasFusion("chainlightning")) shock *= 1.25;
      damageEnemy(shock, "감전", true);
      if (hasFusion("thunderflame")) b.statuses.burn += 1;
    }
    const ls = effectLv("lifesteal");
    if (ls > 0){
      let heal = dealt * (ls * .012);
      if (hasFusion("berserker")) heal *= 1 + (1 - state.hp/state.maxHp) * .8;
      if (hasFusion("bloodkingultimate")) heal *= 1.35;
      healPlayer(heal,"흡혈");
    }
    b.dodgedLast = false;
    return false;
  }

  function tickEnemyDots(){
    const b = state.battle;
    if (!b) return false;
    const plague = 1 + effectLv("plague") * .07;
    let burn = b.statuses.burn * (1.55 + effectLv("burn") * .16) * plague;
    let poison = b.statuses.poison * (1.25 + effectLv("poison") * .13) * plague;
    if (hasFusion("redplague")) burn *= 1.25;
    if (hasFusion("blackdeath")) poison *= 1.3;
    if (hasFusion("necrosis") && b.statuses.bleed > 0 && b.statuses.poison > 0){ burn *= 1.08; poison *= 1.2; }
    if (burn > 0 && damageEnemy(burn,"발화",true)) return true;
    if (poison > 0 && damageEnemy(poison,"독액",true)) return true;
    if (b.statuses.bleed > 0){
      let bleed = b.statuses.bleed * (1.25 + effectLv("bleed") * .12) * plague;
      if (hasFusion("bloodcurse")) b.statuses.curse += 1;
      if (hasFusion("necrosis")) bleed *= 1.15;
      if (damageEnemy(bleed,"출혈",true)) return true;
      if (hasFusion("bloodfeast")) healPlayer(bleed * .12,"혈식");
    }
    b.statuses.burn = Math.max(0,b.statuses.burn-1);
    b.statuses.chill = Math.max(0,b.statuses.chill-1);
    return false;
  }

  function wraithAssist(){
    if (!state.battle || state.wraiths <= 0) return false;
    let damage = state.wraiths * (1.8 + effectLv("necro") * .22);
    if (hasFusion("deathlord")) damage *= 1.3;
    if (hasFusion("underworldking")) damage *= 1.55;
    if (hasFusion("cremationarmy")) state.battle.statuses.burn += Math.ceil(state.wraiths/3);
    if (hasFusion("rottingarmy")) state.battle.statuses.poison += Math.ceil(state.wraiths/3);
    if (hasFusion("soulrelease")) healPlayer(Math.max(1,state.wraiths*.35),"성령 지원");
    return damageEnemy(damage,"망령 지원",true);
  }

  function environmentPhase(){
    if (!state.battle || state.screen !== "battle") return;
    const b = state.battle;
    const rule = effectiveRuleKey();
    if (rule === "heat"){
      const env = Math.max(1,Math.floor(b.turn/2));
      if (damageEnemy(env,"객차의 열기",true)) return;
      damagePlayer(env,"객차의 열기");
    }
    if (rule === "storm" && b.turn % 3 === 0){
      const env = 4 + state.act;
      if (damageEnemy(env,"낙뢰",true)) return;
      damagePlayer(env,"낙뢰");
    }
    if (rule === "choir" && b.turn % 4 === 0){
      healPlayer(state.maxHp*.035,"성가");
      b.hp = Math.min(b.maxHp,b.hp + Math.round(b.maxHp*.035));
      log(`${b.name}도 성가로 회복했다.`,"객차 규칙");
    }
    if (rule === "infection"){
      const heal = Math.round(b.maxHp*.025);
      b.hp = Math.min(b.maxHp,b.hp+heal);
      log(`${b.name}이 ${heal} 회복했다.`,"객차 규칙");
    }
    if (rule === "garden"){
      healPlayer(state.maxHp*.025,"정원의 생명력");
      b.hp = Math.min(b.maxHp,b.hp+Math.round(b.maxHp*.025));
    }
  }

  function enemyTurn(){
    if (state.screen !== "battle" || !state.battle) return;
    const b = state.battle;
    if (tickEnemyDots()) return;
    if (state.screen !== "battle") return;
    const intent = b.intent;
    if (intent === "guard"){
      const gain = Math.round(b.maxHp * (b.isBoss ? .12 : .09));
      b.guard += gain;
      log(`${b.name}이 방어 ${gain}을 얻었다.`);
    } else if (intent === "recover"){
      const heal = Math.round(b.maxHp * (b.isBoss ? .08 : .06));
      b.hp = Math.min(b.maxHp,b.hp+heal);
      log(`${b.name}이 HP ${heal}을 회복했다.`);
    } else {
      const def = intentDefs[intent];
      const hits = def.hits || 1;
      for (let i=0;i<hits;i++){
        if (state.screen !== "battle") break;
        damagePlayer(b.attack * def.mult, `${b.name}의 ${def.name}`);
      }
    }
    if (state.screen !== "battle") return;
    environmentPhase();
    if (state.screen !== "battle") return;
    const regen = effectLv("regen");
    if (regen > 0){
      let amount = 1 + regen * 1.15;
      if (hasFusion("immortality")) amount *= 1 + (1-state.hp/state.maxHp)*.8;
      healPlayer(amount,"재생");
    }
    b.turn += 1;
    b.hasteCd = Math.max(0,b.hasteCd - 1 - Math.floor(effectLv("time")/7));
    if (hasFusion("acceleration") && b.hasteCd > 0 && Math.random() < .28) b.hasteCd -= 1;
    if (hasFusion("momentmaster") && b.hasteCd > 0 && Math.random() < .35) b.hasteCd -= 1;
    b.hasteCd = Math.max(0,b.hasteCd);
    b.intent = pickIntent(b.isBoss);
    save();
  }

  function doAction(action){
    if (state.screen !== "battle" || !state.battle) return;
    const b = state.battle;
    if (action !== "haste" && wraithAssist()) return finishRender();
    if (action === "attack"){
      if (dealPlayerHit(1)) return finishRender();
      enemyTurn();
    }
    if (action === "careful"){
      if (dealPlayerHit(1,{careful:true})) return finishRender();
      enemyTurn();
    }
    if (action === "defend"){
      const gain = Math.round(15 + effectLv("barrier") * 4.2 + effectLv("armor") * .8);
      state.shield += gain;
      log(`방어 태세. 역장 ${gain} 획득.`);
      if (hasFusion("hibernation")) healPlayer(3 + effectLv("regen"),"동면");
      enemyTurn();
    }
    if (action === "haste"){
      if (b.hasteCd > 0) return;
      const baseCd = Math.max(2,5 - Math.floor(effectLv("haste")/4) - Math.floor(effectLv("time")/6));
      b.hasteCd = baseCd;
      log("초신속으로 적의 틈을 파고든다.");
      dealPlayerHit(.62);
      if (state.screen === "battle") state.shield += 3 + Math.floor(effectLv("haste")/2);
    }
    finishRender();
  }

  function victory(){
    if (state.screen !== "battle") return;
    const b = state.battle;
    let gold = 8 + state.act * 2 + state.stage * 2 + (b.isBoss ? 16 + state.act*2 : 0);
    const rule = effectiveRuleKey();
    if (rule === "war") gold = Math.round(gold * 1.35);
    if (rule === "vault") gold = Math.round(gold * 1.75);
    state.gold += gold;
    if (effectLv("necro") > 0){
      let gain = 1 + (Math.random() < effectLv("necro")*.05 ? 1 : 0);
      if (hasFusion("deadcontract") && b.statuses.curse > 0) gain += 1;
      if (hasFusion("underworldking")) gain += 1;
      state.wraiths = clamp(state.wraiths + gain,0,18);
    }
    if (effectLv("soul") > 0){
      let gain = 1 + (b.isBoss ? 1 : 0);
      if (hasFusion("soulharvest")) gain += 1;
      state.souls = clamp(state.souls + gain,0,30);
    }
    if (rule === "city") healPlayer(state.maxHp*.08,"도시의 휴식");
    if (effectLv("holy") > 0) healPlayer(2 + effectLv("holy")*.5,"성광");
    log(`${b.name} 격파. ${gold}G 획득.`,"승리");
    state.screen = "reward";
    state.rewards = generateRewards();
    state.rerollCost = 15;
    currentTab = "battle";
    save();
  }

  function die(){
    if (state.screen === "dead") return;
    state.hp = 0;
    state.screen = "dead";
    meta.deaths += 1;
    meta.bestAct = Math.max(meta.bestAct,state.act);
    save();
  }

  const rewardPrefixes = ["낡은","검은","유리","잊힌","무명의","침묵의","백색","황혼의","심야의","균열난","회색","0호선의"];
  const rewardNouns = ["표식","코트","반지","부적","장갑","외투","가면","시계","승차권","목걸이","브로치","램프","열쇠","휘장","장식"];

  function sampleGlobalEffects(count){
    // 객차와 무관하게 32종 전체 효과 풀에서만 추첨한다.
    return shuffle(D.baseEffects).slice(0,count);
  }

  function generateReward(){
    const rare = Math.random() < .2;
    const count = rare ? 3 : 2;
    const selected = sampleGlobalEffects(count);
    const ashBonus = effectiveRuleKey() === "ash" && Math.random() < .4 ? 1 : 0;
    return {
      name:`${choice(rewardPrefixes)} ${choice(rewardNouns)}`,
      rarity:rare ? "희귀" : "일반",
      effects:selected.map((e,i) => ({id:e.id, amount:Math.min(3,(rare && Math.random()<.45 ? 2 : 1) + (i===0 ? ashBonus : 0))}))
    };
  }

  function generateRewards(){ return [generateReward(),generateReward(),generateReward()]; }

  function chooseReward(index){
    if (state.screen !== "reward") return;
    const reward = state.rewards[index];
    if (!reward) return;
    reward.effects.forEach(x => addEffect(x.id,x.amount));
    toast(`${reward.name} 획득`);
    updateDiscoveries(true);
    if (state.stage >= STAGES_PER_CARRIAGE){
      state.screen = "transition";
      state.nextChoices = generateCarriageChoices();
    } else {
      state.stage += 1;
      state.screen = "battle";
      state.battle = null;
      createBattle();
    }
    state.rewards = null;
    save();
    render();
  }

  function rerollRewards(){
    if (state.screen !== "reward" || state.gold < state.rerollCost) return;
    state.gold -= state.rerollCost;
    state.rerollCost += 5;
    state.rewards = generateRewards();
    log("보상 선택지를 새로고침했다.");
    save(); render();
  }

  function generateCarriageChoices(){
    const current = state.carriageId;
    let pool = D.carriages.filter(c => c.id !== current && c.id !== "conductor");
    const picks = shuffle(pool).slice(0,3);
    if (state.act >= 5 && Math.random() < .10){
      picks[rand(0,2)] = D.carriageMap.conductor;
    }
    return picks.map(c => c.id);
  }

  function chooseCarriage(id){
    if (state.screen !== "transition" || !D.carriageMap[id]) return;
    state.act += 1;
    state.stage = 1;
    state.carriageId = id;
    state.route.push(id);
    state.screen = "battle";
    state.nextChoices = null;
    state.battle = null;
    state.hp = Math.min(state.maxHp,state.hp + Math.round(state.maxHp*.12));
    log(`${D.carriageMap[id].name}으로 이동했다.`,"이동");
    meta.bestAct = Math.max(meta.bestAct,state.act);
    createBattle();
    currentTab = "battle";
    save(); render();
  }

  function restart(showIntro=false){
    state = freshState(showIntro);
    if (!showIntro) createBattle();
    currentTab = "battle";
    save(); render();
  }

  function startIntro(){
    meta.seenIntro = true;
    state.screen = "battle";
    createBattle();
    save(); render();
  }

  function finishRender(){ save(); render(); }

  function renderHeader(){
    const car = carriage();
    const effectsTotal = Object.values(state.effects).reduce((a,b)=>a+b,0);
    const f = activeFusionPower();
    return `
      <header class="topbar">
        <div class="brand"><div class="brand-mark">0</div><div><h1>0호선</h1><p>NO LAST STOP</p></div></div>
        <div class="top-actions"><button class="icon-btn" data-action="reset" title="새 게임">↻</button></div>
      </header>
      <section class="panel run-panel">
        <div class="stats-row">
          <div class="stat"><span>ACT</span><strong>${state.act}</strong></div>
          <div class="stat"><span>STAGE</span><strong>${state.stage}/${STAGES_PER_CARRIAGE}</strong></div>
          <div class="stat"><span>GOLD</span><strong>${state.gold}G</strong></div>
        </div>
        <div class="carriage-head">
          <div class="carriage-icon">${car.icon}</div>
          <div class="carriage-copy"><div class="carriage-kicker">CURRENT CARRIAGE</div><h2>${car.name}</h2><p>${car.desc}</p><div class="rule">${car.rule}${state.battle && car.ruleKey === "conductor" ? `<br>현재 변칙: ${ruleLabel(effectiveRuleKey())}` : ""}</div></div>
        </div>
        <div class="hp-wrap"><div class="hp-line"><span>HP</span><strong>${Math.ceil(state.hp)} / ${state.maxHp}</strong></div><div class="bar"><div class="fill" style="width:${pct(state.hp/state.maxHp)}"></div></div></div>
        <div class="substats">
          <span class="pill">🛡️ ${Math.round(state.shield)}</span><span class="pill">⚔️ ${state.attack}</span><span class="pill">👻 ${state.souls}</span><span class="pill">💀 ${state.wraiths}</span><span class="pill">✨ 효과 Lv.${effectsTotal}</span><span class="pill">🌀 ${f.first+f.second+f.ultimate}</span>
        </div>
      </section>`;
  }

  function ruleLabel(key){
    const labels = {normal:"안정",heat:"고열",revive:"재기동",freeze:"동결",storm:"낙뢰",choir:"성가",infection:"증식",war:"격전",mirror:"복제",flood:"수몰",clock:"시간 왜곡",dream:"악몽",beast:"야수",vault:"금고",garden:"과성장",lab:"실험",zerog:"무중력",ash:"재의 왕좌",city:"도시",conductor:"???"};
    return labels[key] || key;
  }

  function renderTabs(){
    const tabs = [["battle","전투"],["effects","효과"],["fusions","융합"],["route","노선"]];
    return `<nav class="nav-tabs">${tabs.map(([id,name])=>`<button class="tab ${currentTab===id?"active":""}" data-tab="${id}">${name}</button>`).join("")}</nav>`;
  }

  function renderBattle(){
    if (state.screen === "reward") return renderRewards();
    if (state.screen === "transition") return renderTransition();
    const b = state.battle;
    if (!b) return `<section class="panel content-panel">전투 준비 중...</section>`;
    const intent = intentDefs[b.intent];
    const statuses = Object.entries(b.statuses).filter(([,v])=>v>0).map(([k,v])=>`<span class="status">${D.effectMap[k]?.icon || "•"} ${D.effectMap[k]?.name || k} ${v}</span>`).join("");
    const logs = state.log.slice(0,8).map((x,i)=>`<div class="log-line ${i===0?"strong":""}">${x}</div>`).join("");
    return `
      <section class="panel content-panel">
        <div class="section-title"><h3>${b.isBoss ? "객차 보스" : `전투 ${state.stage}`}</h3><span>TURN ${b.turn}</span></div>
        <div class="enemy-card">
          <div class="enemy-meta"><div><div class="enemy-name">${b.name}</div><div class="enemy-type">${b.isBoss?"BOSS":"ENTITY"} · ${ruleLabel(effectiveRuleKey())}</div></div><div class="enemy-hp">${Math.max(0,Math.ceil(b.hp))} / ${b.maxHp}${b.guard>0?`<br>🛡️ ${Math.round(b.guard)}`:""}</div></div>
          <div class="bar" style="margin-top:9px"><div class="fill enemy-fill" style="width:${pct(b.hp/b.maxHp)}"></div></div>
          <div class="enemy-figure">${carriage().icon}</div>
          <div class="intent"><div class="intent-icon">${intent.icon}</div><div><b>다음 행동: ${intent.name}</b><p>${intent.desc}</p></div></div>
          ${statuses ? `<div class="status-row">${statuses}</div>` : ""}
        </div>
        <div class="actions">
          <button class="action-btn primary" data-action="attack"><b>⚔️ 공격</b><small>기본 직접 공격. 보유 효과를 부여한다.</small></button>
          <button class="action-btn" data-action="defend"><b>🛡️ 수비</b><small>이번 전투의 역장을 쌓는다.</small></button>
          <button class="action-btn" data-action="careful"><b>🎯 신중한 일격</b><small>치명타 확률이 높은 강한 공격.</small></button>
          <button class="action-btn" data-action="haste" ${b.hasteCd>0?"disabled":""}><b>💨 초신속 ${b.hasteCd>0?`(${b.hasteCd})`:""}</b><small>가벼운 공격 후 적에게 턴을 넘기지 않는다.</small></button>
        </div>
        <div class="combat-log">${logs}</div>
      </section>`;
  }

  function renderRewards(){
    return `<section class="panel content-panel">
      <div class="reward-intro"><div class="big">🎁</div><h3>잔향 선택</h3><p>객차와 관계없이 32종 전체 효과 풀에서 무작위로 등장한다.</p></div>
      <div class="reward-grid">${state.rewards.map((r,i)=>`
        <button class="reward-card" data-reward="${i}"><div class="reward-name"><span>${r.name}</span><span class="rarity">${r.rarity}</span></div><div class="reward-effects">${r.effects.map(x=>{const e=D.effectMap[x.id];return `<div class="reward-effect"><span>${e.icon} ${e.name} <small>Lv.${effectLv(x.id)}</small></span><span>+${x.amount}</span></div>`}).join("")}</div></button>`).join("")}</div>
      <button class="reroll" data-action="reroll" ${state.gold<state.rerollCost?"disabled":""}>↻ 새로고침 · ${state.rerollCost}G</button>
    </section>`;
  }

  function renderTransition(){
    const cleared = carriage();
    return `<section class="panel content-panel transition"><div class="door">🚪</div><div class="carriage-kicker">CARRIAGE CLEARED</div><h2>${cleared.name} 통과</h2><p>다음 문 너머의 객차를 고른다.<br>객차 선택은 환경과 적만 바꾸며, 효과 보상 확률에는 영향을 주지 않는다.</p><div class="choice-grid">${state.nextChoices.map(id=>{const c=D.carriageMap[id];return `<button class="carriage-choice" data-carriage="${id}"><b>${c.icon} ${c.name}</b><p>${c.desc}</p><small>${c.rule}</small></button>`}).join("")}</div></section>`;
  }

  function renderEffects(){
    const acquired = D.baseEffects.filter(e=>effectLv(e.id)>0).length;
    return `<section class="panel content-panel"><div class="section-title"><h3>기본 효과 32종</h3><span>${acquired}/32 보유</span></div><div class="effect-grid">${D.baseEffects.map(e=>{const lv=effectLv(e.id);return `<div class="effect-card ${lv?"":"locked"}"><div class="effect-top"><span class="effect-name">${e.icon} ${e.name}</span><span class="level">Lv.${lv}</span></div><p>${e.desc}</p></div>`}).join("")}</div></section>`;
  }

  function renderFusionTier(title,tier,list,levels,klass=""){
    return `<div class="section-title" style="margin-top:16px"><h3>${title}</h3><span>${Object.values(levels).filter(Boolean).length}/${list.length}</span></div><div class="fusion-grid">${list.map(f=>{
      const lv=levels[f.id]||0; const known=meta.discovered[tier].includes(f.id); const active=lv>0;
      return `<div class="fusion-card ${klass} ${active?"":"locked"}"><div class="fusion-top"><span class="fusion-name">${known?`${f.icon} ${f.name}`:"❔ ???"}</span><span class="level">${active?`Lv.${lv}`:""}</span></div><p>${known?f.desc:"아직 발견하지 못한 융합."}</p></div>`;
    }).join("")}</div>`;
  }

  function renderFusions(){
    const lv=fusionLevels();
    return `<section class="panel content-panel"><div class="section-title"><h3>융합 도감</h3><span>발견한 조합은 회차를 넘어 기록된다</span></div>${renderFusionTier("1차 융합","first",D.firstFusions,lv.first)}${renderFusionTier("2차 융합","second",D.secondFusions,lv.second,"second")}${renderFusionTier("궁극 융합","ultimate",D.ultimateFusions,lv.ultimate,"ultimate")}</section>`;
  }

  function renderRoute(){
    return `<section class="panel content-panel"><div class="section-title"><h3>이번 회차 노선</h3><span>최고 ACT ${meta.bestAct}</span></div><div class="route">${state.route.map((id,i)=>{const c=D.carriageMap[id];const current=i===state.route.length-1;return `<div class="route-node ${current?"current":""}"><div class="num">${i+1}</div><div><b>${c.icon} ${c.name}</b><small>${current?"현재 객차":c.rule}</small></div></div>`}).join("")}</div></section>`;
  }

  function renderIntro(){
    return `<main class="app-shell"><section class="story-screen"><div class="story-zero">0</div><div class="subtitle">NO LAST STOP</div><h1>0호선</h1><div class="story-copy">존재하지 않는 승강장.<br>도착 안내도, 노선도도 없는 검은 열차.<br><br>문이 닫힌 뒤에야 깨닫는다.<br>이 열차에는 돌아가는 방향이 없다는 것을.<br><br>객차에서 얻은 <b>잔향</b>은 서로 섞이고,<br>당신만이 그 힘을 융합할 수 있다.</div><button class="main-btn" data-action="start">탑승한다</button></section></main>`;
  }

  function renderDeath(){
    return `<main class="app-shell"><header class="topbar"><div class="brand"><div class="brand-mark">0</div><div><h1>0호선</h1><p>NO LAST STOP</p></div></div></header><section class="death-screen"><div style="font-size:52px">◼</div><h2>열차의 흔들림이 느껴진다.</h2><div class="story-copy">눈을 뜨면 다시 처음의 승객칸이다.<br>대부분의 힘은 사라졌지만, 한 번 발견한 융합의 기억은 남아 있다.<br><br>ACT ${state.act} · ${carriage().name}</div><button class="main-btn danger" data-action="restart">다시 탑승</button></section></main>`;
  }

  function render(){
    if (state.screen === "intro"){ APP.innerHTML = renderIntro(); return; }
    if (state.screen === "dead"){ APP.innerHTML = renderDeath(); return; }
    let content = currentTab === "effects" ? renderEffects() : currentTab === "fusions" ? renderFusions() : currentTab === "route" ? renderRoute() : renderBattle();
    APP.innerHTML = `<main class="app-shell">${renderHeader()}${renderTabs()}${content}<div class="footer-note">0호선 · 저장은 이 브라우저에 자동으로 기록됨</div></main>`;
  }

  APP.addEventListener("click", e => {
    const tab = e.target.closest("[data-tab]");
    if (tab){ currentTab = tab.dataset.tab; render(); return; }
    const reward = e.target.closest("[data-reward]");
    if (reward){ chooseReward(Number(reward.dataset.reward)); return; }
    const car = e.target.closest("[data-carriage]");
    if (car){ chooseCarriage(car.dataset.carriage); return; }
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    if (["attack","defend","careful","haste"].includes(action)) doAction(action);
    if (action === "reroll") rerollRewards();
    if (action === "start") startIntro();
    if (action === "restart") restart(false);
    if (action === "reset" && confirm("현재 회차를 초기화하고 처음부터 시작할까?")) restart(false);
  });

  load();
  render();
})();