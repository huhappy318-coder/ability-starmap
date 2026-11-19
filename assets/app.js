/* ---------- 入场动画：粒子汇聚成 36 颗星的环，再浮出问题 ---------- */
(function intro(){
  const el = document.getElementById("intro"); if (!el) return;
  const c = document.getElementById("introC"), x = c.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let done = false, raf = 0;
  const finish = () => {
    if (done) return; done = true; cancelAnimationFrame(raf);
    el.classList.add("out"); document.body.style.overflow = "";
    setTimeout(() => el.remove(), 950);
  };
  document.body.style.overflow = "hidden";
  el.addEventListener("click", finish);
  addEventListener("keydown", function k(){ finish(); removeEventListener("keydown", k); });
  if (reduce) { setTimeout(finish, 1800); return; }
  const dpr = Math.min(2, devicePixelRatio || 1);
  let W, H, cx, cy, R;
  function size(){ W = c.width = innerWidth*dpr; H = c.height = innerHeight*dpr; cx = W/2; cy = H*0.36; R = Math.min(W*0.24, H*0.22); }
  size(); addEventListener("resize", size);
  const N = 36;
  const parts = Array.from({length: N}, (_, i) => {
    const a = -Math.PI/2 + i*2*Math.PI/N, wob = (i % 2 ? 0.86 : 1);
    return {sx: Math.random(), sy: Math.random(), a, wob, d: Math.random()*0.35, gold: i % 9 === 0};
  });
  const dust = Array.from({length: 160}, () => ({x: Math.random(), y: Math.random(), r: Math.random()*1.2+.2, p: Math.random()*6.28}));
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const t0 = performance.now();
  function frame(now){
    const t = (now - t0)/1000;
    x.clearRect(0, 0, W, H);
    for (const d of dust) { x.globalAlpha = .25 + .35*Math.sin(d.p + t*1.4); x.fillStyle = "#cfd8ff"; x.beginPath(); x.arc(d.x*W, d.y*H, d.r*dpr, 0, 6.283); x.fill(); }
    const rot = t*0.12;
    const pts = parts.map(p => {
      const k = ease(Math.min(1, Math.max(0, (t - p.d)/1.5)));
      const tx = cx + Math.cos(p.a + rot)*R*p.wob, ty = cy + Math.sin(p.a + rot)*R*p.wob;
      return {x: p.sx*W + (tx - p.sx*W)*k, y: p.sy*H + (ty - p.sy*H)*k, k, gold: p.gold};
    });
    const lineK = Math.min(1, Math.max(0, (t - 1.4)/1.0));
    if (lineK > 0) {
      x.globalAlpha = .55; x.strokeStyle = "#a9bcff"; x.lineWidth = 1*dpr;
      x.beginPath();
      const upto = Math.floor(lineK*N);
      for (let i = 0; i <= upto && i < N; i++) { const p = pts[i], q = pts[(i+1) % N]; x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); }
      x.stroke();
    }
    const glow = Math.min(1, Math.max(0, (t - 1.8)/0.8));
    if (glow > 0) {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, R*1.1);
      g.addColorStop(0, `rgba(255,210,122,${.22*glow})`); g.addColorStop(1, "rgba(255,210,122,0)");
      x.globalAlpha = 1; x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R*1.1, 0, 6.283); x.fill();
      const s = R*0.22*glow;
      x.fillStyle = "#ffd27a"; x.globalAlpha = glow;
      x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s*.22, cy - s*.22); x.lineTo(cx + s, cy); x.lineTo(cx + s*.22, cy + s*.22); x.lineTo(cx, cy + s); x.lineTo(cx - s*.22, cy + s*.22); x.lineTo(cx - s, cy); x.lineTo(cx - s*.22, cy - s*.22); x.closePath(); x.fill();
    }
    for (const p of pts) {
      x.globalAlpha = .4 + .6*p.k; x.fillStyle = p.gold ? "#ffd27a" : "#eef1ff";
      x.beginPath(); x.arc(p.x, p.y, (1.6 + 1.6*p.k)*dpr, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
    if (t > 4.6) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
})();

const DOMAINS = [
 {id:"core",name:"核心能力",short:"核心能力",items:[
  {id:"info",name:"信息渠道",goal:"你的信息从哪里来，靠不靠得住。",steps:["我常用的信息来源有哪些","最近一次重要判断，信息来自哪里","想补上或删掉的一个来源"]},
  {id:"knowledge",name:"知识结构",goal:"哪些知识已经成体系，是怎么建起来的。",steps:["我自认为成体系的两三个领域","它们当初是怎么建起来的","离目标岗位要求，缺口最大的一块"]},
  {id:"hardskill",name:"硬技能",goal:"哪些技能已成肌肉记忆，被 AI 替代的风险多大。",steps:["不查资料就能做好的技能","每项被 AI 替代的程度","风险最高那项的升级方向"]},
  {id:"stack",name:"技术栈",goal:"手上的工具组合，能独立完成哪些完整工作。",steps:["我实际在用的工具","它们串起来能完成的一条链路","链路里还需要别人接手的环节"]},
  {id:"ai",name:"AI 使用能力",goal:"用 AI 拿到的结果，你自己理解和判断得了吗。",steps:["用 AI 解决过的实际问题","哪个结果我讲不清楚（认知债）","我怎么比较方案、识别迎合"]},
  {id:"reverse",name:"逆向工程",goal:"看到一个结果，能否往回拆出原理和条件。",steps:["一个我欣赏的作品或现象","它依赖的原理、步骤和条件","能用到自己身上的一条"]},
  {id:"social",name:"社媒影响力",goal:"你在海外平台的基础，和还空着的生态位。",steps:["X、YouTube、Instagram、Substack 等平台的现状","最匹配我内容的一两个平台","还没人占好的位置"]},
  {id:"taste",name:"审美能力",goal:"在哪类审美上有判断力，哪类还在模仿。",steps:["感官、文字、产品、架构各一个好例子","说不出理由的那一类","值得反复拆解的样本"]}
 ]},
 {id:"hardware",name:"个人硬件条件",short:"硬件条件",items:[
  {id:"fog",name:"脑雾",goal:"思路混乱，是状态问题还是方法问题。",steps:["最近几次脑子发懵的场景","原因：睡眠、情绪、环境，还是缺方法","最常见的一类可以怎么调"]},
  {id:"emotion",name:"情绪",goal:"什么会触发情绪，会波及哪里，多久恢复。",steps:["最近几次情绪波动的触发事件","它影响了哪些行为，有没有跨领域","对我最有效的恢复方式"]},
  {id:"time",name:"时间",goal:"真正能自主安排的时间有多少。",steps:["硬性任务、琐事、责任、自主时间的占比","无效时间的共同特征","可以先拿回来的一小块"]},
  {id:"energy",name:"精力",goal:"每天的有效精力有多少，被什么消耗。",steps:["一天里精力最好和最差的时段","最耗精力、回报最低的事","最重要的事放在哪个时段"]},
  {id:"grit",name:"心力",goal:"压力和长期没回报时，还能否判断并继续。",steps:["我当过兜底、打过翻身仗的经历","多线并行时一条出事，其他还撑得住吗","面对返工、取舍、热情褪去时我怎么办"]},
  {id:"body",name:"体力",goal:"身体能不能撑住现在的安排。",steps:["睡眠、运动、饮食的现状","疲劳后多久能恢复","身体限制了哪些计划"]}
 ]},
 {id:"money",name:"资产与财务",short:"资产财务",items:[
  {id:"balance",name:"资产负债",goal:"如实知道自己有什么、欠什么。",steps:["全部资产和负债","每月需要还多少","收入和还款放在一起的状况"]},
  {id:"allocation",name:"资产配置",goal:"钱以什么形式放着，合不合需要。",steps:["随时可用和暂时不能动的部分","各自是否匹配用途","明显不匹配的一处"]},
  {id:"income",name:"收入曲线",goal:"收入从哪来，稳不稳，往哪走。",steps:["所有收入来源","每个来源的稳定程度","整体趋势和关键变量"]},
  {id:"fixed",name:"刚性支出",goal:"必须花的钱，以及未来怎么变。",steps:["不能轻易停的支出","抚养、扶养、赡养等责任","未来的变化方向"]},
  {id:"flexible",name:"柔性支出",goal:"收入变化时，哪里还有余地。",steps:["可调整的支出和它满足的需要","能减少、延后、替换的部分","调整后会失去什么"]}
 ]},
 {id:"career",name:"职场潜力",short:"职场潜力",items:[
  {id:"expertise",name:"专业实力",goal:"能独立解决什么问题，有没有过时。",steps:["我能独立解决的问题类型","每类对应的实际成果","放在今天还适用吗"]},
  {id:"industry",name:"行业影响力",goal:"真人脉与伪人脉，行业认可匹不匹配目标。",steps:["行业里认识我的人和认可原因","真正能互相帮上忙的人","最需要补上的缺口"]},
  {id:"promotion",name:"晋升潜力",goal:"会不会被困在基层，怎样借平台提升议价权。",steps:["视角切换、业务架构、说服、获客等方面的状态","最可能卡住我的一项","能独立带走的能力"]}
 ]},
 {id:"venture",name:"创业潜力",short:"创业潜力",items:[
  {id:"rd",name:"研发力",goal:"能否发现真痛点并做出最小可行版本。",steps:["我发现过的痛点和做过的 MVP","被真实用户验证过的","从想法到 MVP 常卡住的环节"]},
  {id:"market",name:"市场力",goal:"吸引陌生人的真实能力和短板。",steps:["吸引过陌生人关注的经历","当时起作用的是什么","离理想最大的短板"]},
  {id:"sales",name:"销售力",goal:"能否理解顾虑、讲清价值、促成结果。",steps:["一次说服成功和一次失败","对方的顾虑和我的回应","最缺的说服能力"]},
  {id:"brand",name:"品牌力",goal:"别人为什么信你，这份信任经不经得起交付。",steps:["别人信任我的原因","支撑信任的成果和履约","被信任和被看见的差别"]}
 ]},
 {id:"inner",name:"内圈关系",short:"内圈关系",items:[
  {id:"duty",name:"既有责任",goal:"正在或将要承担的照顾责任。",steps:["涉及的人：孩子、平辈、老人","需要的钱和时间，持续多久","它对我安排的影响"]},
  {id:"family",name:"原生家庭",goal:"原生家庭带来的支持、责任和消耗。",steps:["经济、照顾、相处三方面的现状","它和我目标的关系","是否被某些说法反复牵引"]},
  {id:"intimate",name:"亲密关系",goal:"关系是在互相支持，还是持续增压。",steps:["双方的需要和付出","是否把外面的不顺带回关系","没有伴侣时：我想要什么样的关系"]}
 ]},
 {id:"outer",name:"外圈关系",short:"外圈关系",items:[
  {id:"socialskill",name:"社交能力",goal:"在具体场合建立和维系关系的能力。",steps:["最近在新场合和人建立联系的经历","开启、表达、维系，哪一环最弱","最想提升的一项"]},
  {id:"network",name:"熟人网络",goal:"哪些关系真实可用，彼此能做什么。",steps:["能实际联系上的人","过去的合作或互相支持","维系需要的投入"]},
  {id:"circle",name:"圈层",goal:"你身处哪些群体，离想进入的环境多远。",steps:["我长期所在的圈子","它们带来的信息、机会和习惯","我在其中是旁观、参与还是贡献"]}
 ]},
 {id:"access",name:"资源准入权",short:"资源准入",items:[
  {id:"security",name:"社会保障",goal:"生病、失业、年老时能依靠什么。",steps:["已有的保障","三种情境下的覆盖范围","最大的缺口"]},
  {id:"residency",name:"全球居住权",goal:"是否需要另一种居住选择。",steps:["目前能长期生活的地方","多地生活对我有多重要","它牵动的事业、关系和财产"]},
  {id:"property",name:"全球财产确权",goal:"财产在哪里，权属是否清楚。",steps:["财产所在地和持有方式","权属与实际支配是否一致","能否支撑未来的安排"]},
  {id:"fallback",name:"兜底能力",goal:"出事之后能退到哪里，还能试错几次。",steps:["设想失业或收入中断","那时实际可用的资源和支持","我能承受几次试错"]}
 ]}
];
const ORDER = []; const BY = {};
DOMAINS.forEach((d,di) => d.items.forEach(it => { ORDER.push(it.id); BY[it.id] = {it, d, di}; }));
const TOTAL = ORDER.length;
const LV = ["还没想过","有点模糊","心里有数"];
/* ---------- 名词解释：是什么 / 来源 / 怎么提升 ---------- */
const EXPLAIN = {
 info:{def:"你获取信息的来源、筛选方式和它们的组合。决定了你看到的世界有多准、多全。",src:"信息素养（Zurkowski, 1974 首次提出）；信息茧房（Sunstein,《Infotopia》, 2006）。",tips:["分清一手来源（原始数据、当事人）和二手转述","保留一两个和你观点不同的来源","定期删掉只制造焦虑、不提供判断依据的来源"]},
 knowledge:{def:"知识在你脑中的组织方式：哪些是零散的点，哪些已经连成了能解释新问题的框架。",src:"图式理论（Bartlett, 1932）；专家与新手的知识组织差异（Chi, Feltovich & Glaser, 1981）。",tips:["用自己的话把一个领域讲给别人听","画出这个领域的框架图，找出空白处","围绕真实问题去学，而不是按目录学"]},
 hardskill:{def:"可以被教、被检验的具体技能，比如写作、剪辑、编程、数据分析。",src:"任务分析框架：越是能被规则描述的常规任务，越容易被技术替代（Autor, Levy & Murnane, 2003）。",tips:["把技能里能写成步骤的部分交给工具","把精力移向判断、组合和与人打交道的部分","把两项技能组合成别人少有的组合"]},
 stack:{def:"原指软件开发中一起使用的一组技术，这里指你做事时常用的工具组合。",src:"来自软件工程的说法，没有单一理论出处。",tips:["画出从开始到交付的一条完整链路","优先补上链路里断开、需要别人接手的环节","工具少而熟，比多而浅更有用"]},
 ai:{def:"用 AI 解决问题的能力，以及判断它答得对不对的能力。认知债指结果拿到了，自己的理解却没跟上。",src:"认知卸载（Risko & Gilbert, 2016）；自动化偏差（Parasuraman & Manzey, 2010）；认知债一词因 MIT 媒体实验室的写作实验而流行（Kosmyna et al., 2025）。",tips:["先自己想一遍，再问 AI","要求它给出依据，并自己核对关键一条","用自己的话复述结果，讲不清的就是认知债"]},
 reverse:{def:"从一个成品往回推，弄清它是怎么做出来的、依赖什么条件。",src:"源自工程领域；在学习上接近刻意练习中对高手作品的拆解与模仿（Ericsson, Krampe & Tesch-Römer, 1993）。",tips:["找一个你欣赏的作品，列出它的组成部分","挑其中一小块，亲手复现一次","问自己：换个条件，它还成立吗"]},
 social:{def:"你在社交媒体上被多少人看见、被多少人信任，以及还能占据的位置。",src:"注意力经济：信息越丰富，注意力越稀缺（Simon, 1971）。",tips:["先选一个平台深耕，而不是全面铺开","内容围绕受众的具体问题，而不是自我展示","观察同类账号，找一个还没被做好的角度"]},
 taste:{def:"判断什么是好的能力，包括视听、文字、产品和结构上的好坏。",src:"布迪厄认为品味是在环境中长期习得的（Bourdieu,《区分》, 1979）。",tips:["大量接触公认的好作品","每次说出它好在哪里，而不只是「好看」","动手做，做的过程会倒逼判断力"]},
 fog:{def:"日常说法，指注意力难以集中、思维迟缓、组织不起思路的状态，不是医学诊断。",src:"认知负荷理论：任务超出工作记忆容量时，人会感到混乱（Sweller, 1988）。睡眠、压力和身体状况也常是原因。",tips:["先检查睡眠和情绪","把大任务拆成一次只做一步","长期严重时，去医院查一查"]},
 emotion:{def:"情绪被什么触发、如何影响行为、多久能恢复。",src:"情绪调节过程模型（Gross, 1998）；给情绪命名能降低其强度（Lieberman et al., 2007）。",tips:["给情绪起一个具体的名字","换个角度重新解释触发它的事","用运动、睡眠和散步调节身体状态"]},
 time:{def:"你的时间被什么占据，能自己支配的有多少。",src:"计划谬误：人总是低估完成任务所需的时间（Kahneman & Tversky, 1979）。",tips:["连续几天记录时间实际花在哪里","区分重要的事和只是紧急的事","为最重要的事留出整块时间"]},
 energy:{def:"你一天中能高质量投入的精力有多少，什么时候最好。",src:"精力管理（Loehr & Schwartz,《The Power of Full Engagement》, 2003）。",tips:["找到自己精力最好的时段","把最重要的事放进那个时段","主动安排短暂休息，而不是等到耗尽"]},
 grit:{def:"面对压力、挫折和长期看不到回报时，还能做对判断并继续下去的能力。",src:"坚毅（Duckworth et al., 2007）；心理韧性研究。",tips:["把长期目标拆成能看见进展的小步","回顾自己扛过来的经历","找到能倾诉和求助的人"]},
 body:{def:"睡眠、运动、饮食和恢复能力，是其他一切能力的前提。",src:"世界卫生组织建议成年人每周进行 150 到 300 分钟中等强度运动（WHO, 2020）。",tips:["先稳定作息","找一种能长期坚持的运动","留意疲劳后需要多久恢复"]},
 balance:{def:"你有什么（资产）、欠什么（负债），两者相减就是净资产。",src:"来自会计中的资产负债表：资产 = 负债 + 所有者权益。",tips:["把资产和负债全部列出来","算出净资产和每月还款额","优先还清利率最高的债"]},
 allocation:{def:"你的钱以什么形式放着：现金、存款、基金、股票等，以及各自的用途。",src:"现代投资组合理论：分散配置可以在相同收益下降低风险（Markowitz, 1952）。",tips:["先留一笔应急金，常见建议是 3 到 6 个月的生活费","再按用途分配：应急、成长、长期","不要把短期要用的钱放进高波动资产"]},
 income:{def:"你的收入从哪里来、稳不稳定、随时间是在上升还是下降。",src:"人力资本理论：技能积累会改变一个人的收入曲线（Becker, 1964）。",tips:["列出所有收入来源","减少对单一来源的依赖","投资能提高单位时间价值的技能"]},
 fixed:{def:"短期内很难减少的必要支出，比如房租、贷款、保险、赡养费。",src:"理财中常说的固定支出；一旦签了长期合约，支出就会变得刚性。",tips:["算出刚性支出占收入的比例","签长期合约前多想一步","把未来可能出现的责任也算进来"]},
 flexible:{def:"可以随时调整的支出，比如餐饮、娱乐、购物、旅行。",src:"心理账户理论：人会把钱分到不同的「账户」里区别对待（Thaler, 1985）。",tips:["按对你的价值给这些支出排个序","给享受类支出设上限，而不是全部砍掉","收入变化时，先从价值最低的开始调"]},
 expertise:{def:"你在专业上能独立解决什么问题，以及有什么成果能证明。",src:"专长研究：高水平表现来自长期有反馈的刻意练习（Ericsson et al., 1993）。",tips:["用具体成果说明能力","定期检查自己的做法是否过时","找能给你真实反馈的人"]},
 industry:{def:"你在行业里被谁认识、被谁认可、能和谁互相帮忙。",src:"社会资本（Bourdieu, 1986）；弱关系带来新机会（Granovetter, 1973）。",tips:["分清互相帮过忙的人和只是认识的人","先为别人提供价值","公开你的作品，让认可有依据"]},
 promotion:{def:"你在组织里往上走的可能，以及会不会被困在当前位置。",src:"彼得原理：人容易被提升到自己不胜任的位置（Peter & Hull, 1969）。",tips:["学会用上一级的视角看问题","积累离开平台也能带走的能力","主动承担能被看见的结果"]},
 rd:{def:"发现真实痛点，并做出最小可行版本（MVP）去验证的能力。",src:"精益创业（Ries, 2011）；客户开发方法（Blank, 2005）。",tips:["先确认问题存在，再想解决方案","做一个最小版本给真实用户用","用用户的行为判断，而不是用他们的客套话"]},
 market:{def:"让陌生人注意到你、愿意了解你的能力。",src:"定位理论：在用户心中占据一个清晰的位置（Ries & Trout, 1981）。",tips:["用用户自己的语言描述问题","选定一两个渠道持续触达","观察什么内容真的带来了人"]},
 sales:{def:"面对具体的人，理解顾虑、讲清价值、促成结果的能力。",src:"SPIN 提问法（Rackham, 1988）；影响力六原则（Cialdini, 1984）。",tips:["先问清对方的处境和顾虑，再讲方案","正面回应顾虑，而不是绕开","每次复盘：对方为什么答应或拒绝"]},
 brand:{def:"别人为什么相信你，对你有什么稳定的预期。",src:"信任三要素：能力、善意、正直（Mayer, Davis & Schoorman, 1995）。",tips:["说到做到，持续交付","保持言行一致","把被信任和被看见分开经营"]},
 duty:{def:"抚养指父母对子女，扶养指夫妻、兄弟姐妹之间，赡养指子女对父母的照顾责任。",src:"《中华人民共和国民法典》婚姻家庭编对三类义务均有规定。",tips:["提前和家人沟通预期","把这些责任计入长期预算","留意责任可能在什么时候到来"]},
 family:{def:"你成长的家庭，现在给你带来的支持、责任和消耗。",src:"家庭系统理论中的自我分化：在保持联系的同时保有独立的自我（Bowen, 1978）。",tips:["区分事实和别人贴给你的标签","建立清楚而温和的边界","看见自己现在可以选择的部分"]},
 intimate:{def:"你和伴侣之间是在互相支持，还是在持续增加压力。",src:"成人依恋理论（Hazan & Shaver, 1987）；关系稳定性研究（Gottman, 1994）。",tips:["直接说出自己的需要","冲突后主动修复","回应对方发出的小小信号"]},
 socialskill:{def:"在具体场合开启对话、表达自己、维系关系的能力。",src:"社会渗透理论：关系随着自我表露的广度和深度逐步加深（Altman & Taylor, 1973）。",tips:["从低风险的场合开始练","主动发起，再做好跟进","把开启、表达、维系分开练"]},
 network:{def:"已经认识、能实际联系上的人，以及你们能为彼此做什么。",src:"弱关系理论（Granovetter, 1973）；邓巴数：人能维持的稳定关系约 150 个（Dunbar, 1992）。",tips:["列出能联系上的人和你们的交集","定期维护重要的联系","互相给予，而不只是索取"]},
 circle:{def:"你长期所在的群体，以及它带给你的信息、机会和习惯。",src:"同质性：人倾向于和相似的人聚在一起（McPherson, Smith-Lovin & Cook, 2001）。",tips:["看清现在的圈子给了你什么","有意识地进入你想去的环境","在新圈子里从贡献开始"]},
 security:{def:"生病、失业、年老时能依靠的保障，比如社保和商业保险。",src:"风险管理的基本思路：用小而确定的成本，对冲大而不确定的损失。",tips:["弄清自己已经有哪些保障","先补医疗和意外的缺口","了解保障的持续条件"]},
 residency:{def:"你能在哪些国家或地区长期合法居住，以及是否需要另一种选择。",src:"涉及居留、永久居留和国籍等不同身份，各国规则不同，没有统一的理论。",tips:["先判断你的目标是否真的需要","了解求学、工作等合法途径","把它和事业、家庭、财产一起考虑"]},
 property:{def:"你的财产在哪里、以什么方式持有、归属是否清楚。",src:"产权清晰是经济学中交易与保护的基础；跨境持有还涉及各国申报和税务规则。",tips:["整理好所有权属文件","确认名义持有人和实际支配一致","了解并遵守所在地的申报要求"]},
 fallback:{def:"出事之后能退到哪里、靠什么维持、还能承受几次试错。",src:"反脆弱：保留冗余，让自己能从波动中受益而非受损（Taleb, 2012）。",tips:["准备一笔应急金","知道最坏情况下能回到哪里、找谁","把试错控制在输得起的范围内"]}
};

const $ = s => document.querySelector(s);

/* ---------- 状态 ---------- */
const KEY = "ability-starmap-v2";
let state = {items:{}, profile:{name:"",motto:""}, report:null};
function normalize(raw){
  const out = {items:{}, profile:{name:"",motto:""}, report:null};
  if (!raw || typeof raw !== "object") return out;
  const items = raw.items || {};
  for (const k in items) {
    if (!BY[k]) continue;
    const v = items[k] || {};
    const lv = Number(v.lv != null ? v.lv : (v.s || 0)) || 0;
    out.items[k] = {lv: Math.max(0, Math.min(2, lv)), tag: (v.tag === "s" || v.tag === "g") ? v.tag : "", n: String(v.n || ""), h: Array.isArray(v.h) ? v.h.slice(-10) : []};
  }
  if (raw.profile) out.profile = {name: String(raw.profile.name || ""), motto: String(raw.profile.motto || "")};
  if (raw.report && typeof raw.report === "object") out.report = raw.report;
  if (raw.seenWelcome) out.seenWelcome = true;
  return out;
}
try {
  const r = localStorage.getItem(KEY) || localStorage.getItem("ability-inventory-v1");
  if (r) state = normalize(JSON.parse(r));
} catch(e) {}
const get = id => state.items[id] || {lv:0, tag:"", n:"", h:[]};
function set(id, patch){ state.items[id] = Object.assign({}, get(id), patch); }

function stats(){
  let lit=0, clear=0, words=0, cons=0;
  ORDER.forEach(id => { const v = get(id); if (v.lv>0) lit++; if (v.lv===2) clear++; words += (v.n||"").replace(/\s/g,"").length; });
  DOMAINS.forEach(d => { if (d.items.every(it => get(it.id).lv > 0)) cons++; });
  return {lit, clear, words, cons};
}
function domRatio(d){ return d.items.reduce((a,it)=>a+get(it.id).lv,0) / (d.items.length*2); }

/* ---------- 保存 ---------- */
let cloudRef=null, writing=false, queued=false;
function persist(){
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {}
  if (cloudRef) { queued = true; if (!writing) flush(); }
}
async function flush(){
  writing = true;
  while (queued) {
    queued = false;
    const body = JSON.parse(JSON.stringify(state));
    try { await cloudRef.set(body); }
    catch(e){
      if (e && e.code === "unavailable") {
        await new Promise(r => setTimeout(r, 800 + Math.random()*800));
        try { await cloudRef.set(body); } catch(e2){ cloudFail(); break; }
      } else { cloudFail(); break; }
    }
  }
  writing = false;
}
function cloudFail(){ cloudRef = null; $("#saveState").textContent = "暂时无法同步到你的账号，进度先保存在本浏览器。"; }

/* ---------- 提示条 ---------- */
let toastT;
function toast(html){
  const t = $("#toast"); t.innerHTML = html; t.classList.add("on");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600);
}
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* ---------- 背景星空（含流星与视差） ---------- */
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAR = {x:0, y:0, tx:0, ty:0};
(function sky(){
  const c = $("#sky"), x = c.getContext("2d");
  let pts = [], w, h, dpr, meteor = null, nextMeteor = 4000;
  function size(){
    dpr = Math.min(2, devicePixelRatio || 1);
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    pts = Array.from({length: Math.round(innerWidth*innerHeight/4800)}, () => ({x:Math.random()*w, y:Math.random()*h, r:(Math.random()*1.1+.2)*dpr, p:Math.random()*6.28, s:.4+Math.random()*1.2, z:.3+Math.random()*.7}));
    draw(0);
  }
  function draw(t){
    x.clearRect(0,0,w,h);
    const ox = -PAR.x*14*dpr, oy = -PAR.y*14*dpr;
    for (const p of pts) {
      const a = REDUCE ? .6 : .35 + .45*Math.sin(p.p + t*.0009*p.s);
      x.globalAlpha = Math.max(.08,a); x.fillStyle = "#cfd8ff";
      x.beginPath(); x.arc((p.x + ox*p.z + w) % w, (p.y + oy*p.z + h) % h, p.r, 0, 6.283); x.fill();
    }
    if (meteor) {
      const k = (t - meteor.t0) / 900;
      if (k > 1) meteor = null;
      else {
        const hx = meteor.x + meteor.dx*k, hy = meteor.y + meteor.dy*k;
        const gr = x.createLinearGradient(hx, hy, hx - meteor.dx*.25, hy - meteor.dy*.25);
        gr.addColorStop(0, "rgba(255,240,210,.9)"); gr.addColorStop(1, "rgba(255,240,210,0)");
        x.globalAlpha = 1 - k*.6; x.strokeStyle = gr; x.lineWidth = 1.6*dpr;
        x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx - meteor.dx*.25, hy - meteor.dy*.25); x.stroke();
      }
    } else if (t > nextMeteor) {
      meteor = {t0:t, x:Math.random()*w*.8 + w*.2, y:Math.random()*h*.4, dx:-(260 + Math.random()*200)*dpr, dy:(140 + Math.random()*100)*dpr};
      nextMeteor = t + 9000 + Math.random()*9000;
    }
    x.globalAlpha = 1;
  }
  function loop(t){
    PAR.x += (PAR.tx - PAR.x)*.06; PAR.y += (PAR.ty - PAR.y)*.06;
    if (!document.hidden) { draw(t); applyParallax(); }
    requestAnimationFrame(loop);
  }
  addEventListener("resize", size); size();
  if (!REDUCE) requestAnimationFrame(loop);
})();
if (!REDUCE && matchMedia("(pointer:fine)").matches) {
  addEventListener("pointermove", e => { PAR.tx = e.clientX/innerWidth - .5; PAR.ty = e.clientY/innerHeight - .5; });
}

/* ---------- 星与星之间的关联（跨星座） ---------- */
const EDGES = [
 ["info","knowledge","信息是知识的原料"],["info","ai","AI 已经是新的信息入口"],["info","circle","你在哪个圈子，决定了你能听到什么"],["info","network","熟人常是一手信息的来源"],
 ["knowledge","ai","知识结构决定你能不能判断 AI 的回答"],["knowledge","allocation","资产配置要靠知识框架来做判断"],["knowledge","expertise","专业实力建立在知识结构上"],["knowledge","reverse","拆解得越多，知识越成体系"],["knowledge","fog","方法没掌握时，最容易脑子发懵"],
 ["hardskill","ai","AI 正在改写哪些技能还值钱"],["hardskill","stack","技能要靠工具组合才能落地"],["hardskill","expertise","硬技能是专业实力的底座"],["hardskill","income","技能决定单位时间能挣多少"],
 ["stack","ai","AI 已经是技术栈的一部分"],["stack","rd","工具组合决定你多快做出 MVP"],
 ["ai","reverse","用 AI 拆解作品，也要能反过来检查它"],["ai","fog","过度依赖 AI，会让思考变钝"],
 ["reverse","rd","拆解别人，是做出自己产品的起点"],["reverse","taste","拆解好作品，能训练审美"],
 ["social","market","社媒是获客的主要渠道"],["social","brand","被看见，是被信任的前提之一"],["social","industry","公开的影响力会变成行业认可"],["social","taste","内容的质量取决于审美"],
 ["taste","rd","审美决定产品做得好不好"],["taste","brand","审美影响别人对你的第一印象"],
 ["fog","body","睡眠和身体状态直接影响脑雾"],["fog","energy","精力低的时候最容易发懵"],
 ["emotion","intimate","关系是情绪最大的来源之一"],["emotion","grit","情绪恢复得快，才扛得久"],["emotion","family","原生家庭塑造了情绪的反应模式"],["emotion","body","运动和睡眠是调节情绪的基础"],
 ["time","energy","时间只有配上精力才有价值"],["time","duty","照顾责任会占掉自主时间"],["time","flexible","时间和钱一样，有刚性和柔性的部分"],
 ["energy","body","体力是精力的上限"],
 ["grit","fallback","有退路，才敢坚持得更久"],["grit","promotion","长期没有回报时能否坚持，决定职场走多远"],
 ["body","security","身体出问题时，保障决定后果有多重"],
 ["balance","allocation","先看清有什么，再决定怎么放"],["balance","fixed","负债会变成每月的刚性支出"],["balance","fallback","净资产是兜底的底气"],
 ["allocation","income","收入波动越大，越需要应急金"],["allocation","property","配置也关系到财产放在哪里、在谁名下"],
 ["income","promotion","晋升往往是收入曲线的拐点"],["income","sales","会说服的人，收入更有弹性"],["income","fallback","收入来源越多，越不怕中断"],
 ["fixed","duty","抚养和赡养是典型的刚性支出"],["fixed","flexible","刚性越高，柔性的余地越小"],
 ["expertise","industry","专业被看见，才会变成影响力"],["expertise","promotion","专业实力是晋升的基础"],
 ["industry","network","行业人脉是熟人网络的一部分"],["industry","circle","你所在的圈层，决定被谁认可"],
 ["promotion","sales","晋升常常需要说服上级和同事"],["promotion","socialskill","职场上升也靠关系"],
 ["rd","market","做出来之后，还要有人知道"],["market","sales","有人来了，还要能成交"],
 ["sales","brand","有信任，说服会容易得多"],["sales","socialskill","销售本质上是和人打交道"],
 ["brand","network","熟人的口碑是最早的品牌"],
 ["duty","family","赡养责任来自原生家庭"],["duty","security","照顾家人需要保障来兜底"],
 ["family","intimate","原生家庭影响你怎么去爱人"],["intimate","socialskill","亲密关系从社交能力开始"],
 ["socialskill","network","社交能力决定网络能不能扩展"],["network","circle","熟人会把你带进新的圈层"],["network","fallback","出事时能找谁，也是兜底"],
 ["circle","residency","换一个城市或国家，就换了一个圈层"],
 ["security","fallback","保障是兜底的一部分"],["security","residency","换地方生活，保障也要跟着变"],
 ["residency","property","居住地决定财产怎么持有"],["property","fallback","财产权属清楚，出事时才用得上"]
];
const REL = {};
EDGES.forEach(([a, b, why]) => { (REL[a] = REL[a] || []).push({id: b, why}); (REL[b] = REL[b] || []).push({id: a, why}); });

let linkFocus = null, showAllLinks = false;
function starPos(id){ for (const c of LAYOUT.cons) { const s = c.stars.find(x => x.id === id); if (s) return s; } return null; }
function curve(a, b){
  const mx = (a.x + b.x)/2, my = (a.y + b.y)/2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const off = Math.min(80, len*0.18);
  return `M${a.x},${a.y} Q${mx - dy/len*off},${my + dx/len*off} ${b.x},${b.y}`;
}
function drawXLinks(){
  const layer = svg.querySelector("#xlinks"); if (!layer || !LAYOUT) return;
  const id = linkFocus;
  svg.querySelectorAll(".star.rel,.star.src").forEach(g => g.classList.remove("rel","src"));
  svg.classList.toggle("linking", !!id);
  let h = "";
  if (id && REL[id]) {
    const a = starPos(id);
    svg.querySelector(`.star[data-id="${id}"]`)?.classList.add("src");
    REL[id].forEach((r, k) => {
      const b = starPos(r.id); if (!a || !b) return;
      const lit = get(id).lv > 0 && get(r.id).lv > 0;
      h += `<path class="xl on${lit ? " lit" : ""}" d="${curve(a, b)}" style="animation-delay:${(k*0.06).toFixed(2)}s"/>`;
      svg.querySelector(`.star[data-id="${r.id}"]`)?.classList.add("rel");
    });
  } else if (showAllLinks) {
    EDGES.forEach(([x, y]) => { const a = starPos(x), b = starPos(y); if (a && b) h += `<path class="xl all${get(x).lv > 0 && get(y).lv > 0 ? " lit" : ""}" d="${curve(a, b)}"/>`; });
  }
  layer.innerHTML = h;
}
function setLinkFocus(id){ linkFocus = id; drawXLinks(); }

/* ---------- 星图 ---------- */
const svg = $("#map"); const NS = "http://www.w3.org/2000/svg";
const CW = 300, CH = 330;
let LAYOUT = null, layoutCols = 0, VB = null, zoomD = null, vbAnim = null;
let prevOnLinks = new Set(), firstRender = true;
function rng(seed){ let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function buildLayout(cols){
  const rows = Math.ceil(DOMAINS.length/cols);
  const L = {w: cols*CW, h: rows*CH, cons: []};
  DOMAINS.forEach((d, i) => {
    const cx0 = (i%cols)*CW, cy0 = Math.floor(i/cols)*CH;
    const R = rng(1009 + i*7919), pts = [];
    let guard = 0;
    while (pts.length < d.items.length && guard < 4000) {
      guard++;
      const p = {x: cx0 + 50 + R()*(CW-100), y: cy0 + 38 + R()*(CH-124)};
      if (pts.every(q => Math.hypot(q.x-p.x, q.y-p.y) > 58)) pts.push(p);
    }
    while (pts.length < d.items.length) pts.push({x: cx0 + 50 + R()*(CW-100), y: cy0 + 38 + R()*(CH-124)});
    const order = [pts.reduce((a,b) => a.x < b.x ? a : b)], rest = pts.filter(p => p !== order[0]);
    while (rest.length) { const last = order[order.length-1]; rest.sort((a,b) => Math.hypot(a.x-last.x,a.y-last.y) - Math.hypot(b.x-last.x,b.y-last.y)); order.push(rest.shift()); }
    L.cons.push({d, i, box:[cx0, cy0, CW, CH], label:{x: cx0 + CW/2, y: cy0 + CH - 46}, stars: d.items.map((it, k) => ({id: it.id, x: order[k].x, y: order[k].y}))});
  });
  return L;
}
function starStyle(v){
  const col = v.tag === "s" ? "#ffd27a" : v.tag === "g" ? "#7fd8ff" : (v.lv === 2 ? "#ffffff" : v.lv === 1 ? "#c9d2f5" : "#4a5578");
  return {col, core: [3.2, 5, 7][v.lv], halo: [0, 14, 24][v.lv], o1: [0, .12, .22][v.lv], o2: [0, .26, .42][v.lv]};
}
function fullVB(){ return [0, 0, LAYOUT.w, LAYOUT.h]; }
function curAR(){ return layoutCols === 2 && zoomD !== null ? (CW + 20) / (CH + 20) : LAYOUT.w / LAYOUT.h; }
function applyAR(){ svg.style.setProperty("--ar", layoutCols === 2 && zoomD !== null ? `${CW + 20}/${CH + 20}` : `${LAYOUT.w}/${LAYOUT.h}`); }
function consVB(i){
  const b = LAYOUT.cons[i].box, ar = curAR(), pad = 10;
  let w = b[2] + pad*2, h = b[3] + pad*2;
  if (w / h < ar) w = h * ar; else h = w / ar;
  return [b[0] + b[2]/2 - w/2, b[1] + b[3]/2 - h/2, w, h];
}
function setVB(v){ VB = v; svg.setAttribute("viewBox", v.map(n => n.toFixed(1)).join(" ")); }
function animVB(target){
  cancelAnimationFrame(vbAnim);
  const from = VB.slice(), t0 = performance.now(), dur = REDUCE ? 1 : 650;
  const tick = now => { const k = Math.min(1, (now - t0)/dur), e = k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3)/2; setVB(from.map((f, j) => f + (target[j] - f)*e)); if (k < 1) vbAnim = requestAnimationFrame(tick); };
  vbAnim = requestAnimationFrame(tick);
}
function zoomTo(i){
  zoomD = i; hideTip();
  svg.classList.toggle("zoomed", i !== null);
  if (layoutCols === 2) { applyAR(); setVB(i === null ? fullVB() : consVB(i)); svg.querySelectorAll(".cons").forEach(g => g.classList.toggle("focus", Number(g.dataset.i) === i)); renderCrumb(); return; }
  svg.querySelectorAll(".cons").forEach(g => g.classList.toggle("focus", Number(g.dataset.i) === i));
  animVB(i === null ? fullVB() : consVB(i));
  renderCrumb();
}
function renderCrumb(){
  const c = $("#crumb");
  if (zoomD === null) { c.innerHTML = "<b>全部星座</b>"; }
  else {
    const d = DOMAINS[zoomD], lit = d.items.filter(it => get(it.id).lv > 0).length;
    c.innerHTML = `<button type="button" id="crumbAll">全部星座</button><span>›</span><b>${esc(d.name)}</b><span>${lit} / ${d.items.length}</span>`;
    $("#crumbAll").addEventListener("click", () => zoomTo(null));
  }
  $("#zPrev").hidden = $("#zNext").hidden = zoomD === null;
  $("#quickBtn").textContent = zoomD === null ? "⚡ 快速点亮" : "⚡ 快速点亮这个星座";
  const L = $("#consList");
  L.classList.toggle("on", zoomD !== null);
  if (zoomD === null) { L.innerHTML = ""; return; }
  L.innerHTML = "";
  DOMAINS[zoomD].items.forEach(it => {
    const v = get(it.id), st = starStyle(v), w = (v.n || "").replace(/\s/g, "").length;
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<i style="background:${st.col};box-shadow:${v.lv ? `0 0 ${v.lv*5}px ${st.col}` : "none"}"></i><b></b><small>${LV[v.lv]}${v.tag ? (v.tag === "s" ? " · 长处" : " · 想补") : ""}${w ? " · " + w + " 字" : ""}</small>`;
    b.querySelector("b").textContent = it.name;
    b.addEventListener("click", () => openDrawer(it.id));
    L.appendChild(b);
  });
}
$("#netBtn").addEventListener("click", () => {
  showAllLinks = !showAllLinks;
  $("#netBtn").setAttribute("aria-pressed", String(showAllLinks));
  drawXLinks();
  if (showAllLinks) toast(`显示全部 ${EDGES.length} 条关联`);
});
$("#zPrev").addEventListener("click", () => zoomTo((zoomD - 1 + DOMAINS.length) % DOMAINS.length));
$("#zNext").addEventListener("click", () => zoomTo((zoomD + 1) % DOMAINS.length));

function renderMap(){
  const cols = svg.clientWidth && svg.clientWidth < 680 ? 2 : 4;
  if (cols !== layoutCols || !LAYOUT) {
    layoutCols = cols; LAYOUT = buildLayout(cols);
    applyAR();
    VB = zoomD === null ? fullVB() : consVB(zoomD);
  }
  setVB(VB);
  const onNow = new Set();
  let h = `<defs><filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter></defs><g id="world">`;
  LAYOUT.cons.forEach(c => {
    const done = c.d.items.every(it => get(it.id).lv > 0);
    const litN = c.d.items.filter(it => get(it.id).lv > 0).length;
    h += `<g class="cons${zoomD === c.i ? " focus" : ""}" data-i="${c.i}"><rect class="hit" x="${c.box[0]+6}" y="${c.box[1]+6}" width="${c.box[2]-12}" height="${c.box[3]-12}" rx="18"/>`;
    for (let k = 1; k < c.stars.length; k++) {
      const a = c.stars[k-1], b = c.stars[k], on = get(a.id).lv > 0 && get(b.id).lv > 0, key = a.id + "-" + b.id;
      const len = Math.hypot(b.x-a.x, b.y-a.y).toFixed(1);
      if (on) onNow.add(key);
      const isNew = on && !firstRender && !prevOnLinks.has(key);
      h += `<line class="link${on ? " on" : ""}${isNew ? " draw" : ""}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"${isNew ? ` style="stroke-dasharray:${len};--len:${len}"` : ""}/>`;
    }
    h += `<text class="cons-label${done ? " done" : ""}" x="${c.label.x}" y="${c.label.y}" text-anchor="middle">${esc(c.d.name)}</text>`;
    h += `<text class="cons-sub" x="${c.label.x}" y="${c.label.y + 20}" text-anchor="middle">${done ? "✦ 星座已连成" : litN + " / " + c.d.items.length}</text>`;
    c.stars.forEach((s, k) => {
      const v = get(s.id), st = starStyle(v), it = BY[s.id].it;
      h += `<g class="star${v.lv > 0 ? " lit" : ""}" data-id="${s.id}" tabindex="0" role="button" aria-label="${esc(it.name)}，${LV[v.lv]}${v.tag === "s" ? "，长处" : v.tag === "g" ? "，想补" : ""}" style="--d:${(k*0.37 + c.i*0.21).toFixed(2)}s;--o1:${st.o1};--o2:${st.o2}">
        <circle cx="${s.x}" cy="${s.y}" r="22" fill="transparent"/>
        <circle class="halo" cx="${s.x}" cy="${s.y}" r="${st.halo}" fill="${st.col}" opacity="${st.o1}" filter="url(#glow)"/>
        <circle class="core" cx="${s.x}" cy="${s.y}" r="${st.core}" fill="${st.col}"/>
        <text x="${s.x}" y="${s.y + 24}" text-anchor="middle">${esc(it.name)}</text></g>`;
    });
    h += `</g>`;
  });
  h += `<g id="xlinks"></g></g>`;
  svg.innerHTML = h;
  prevOnLinks = onNow; firstRender = false;
  svg.classList.toggle("zoomed", zoomD !== null);
  bindMap();
  drawXLinks();
}
function bindMap(){
  svg.querySelectorAll(".cons").forEach(g => {
    g.addEventListener("pointerenter", () => { if (zoomD === null) { svg.classList.add("hovering"); g.classList.add("hot"); } });
    g.addEventListener("pointerleave", () => { svg.classList.remove("hovering"); g.classList.remove("hot"); });
    g.querySelector(".hit").addEventListener("click", () => { if (zoomD !== Number(g.dataset.i)) zoomTo(Number(g.dataset.i)); });
  });
  svg.querySelectorAll(".star").forEach(g => {
    g.addEventListener("click", e => { e.stopPropagation(); openDrawer(g.dataset.id); });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(g.dataset.id); } });
    g.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") { showTip(g.dataset.id); linkFocus = g.dataset.id; drawXLinks(); } });
    g.addEventListener("pointerleave", () => { hideTip(); linkFocus = cur; drawXLinks(); });
    g.addEventListener("focus", () => { if (g.matches(":focus-visible")) showTip(g.dataset.id); });
    g.addEventListener("blur", hideTip);
  });
}
const tip = $("#tip");
function showTip(id){
  const g = svg.querySelector(`.star[data-id="${id}"] .core`); if (!g) return;
  const v = get(id), it = BY[id].it, r = g.getBoundingClientRect(), wr = $("#mapWrap").getBoundingClientRect();
  const n = (v.n || "").replace(/【[^】]*】/g, "").replace(/\s+/g, " ").trim();
  tip.innerHTML = `<b>${esc(it.name)}</b><div class="st">${LV[v.lv]}${v.tag ? ` · <i class="${v.tag === "g" ? "g" : ""}">${v.tag === "s" ? "长处" : "想补"}</i>` : ""}</div>${n ? `<q>${esc(n.slice(0, 46))}${n.length > 46 ? "…" : ""}</q>` : ""}`;
  const x = Math.max(90, Math.min(wr.width - 90, r.left + r.width/2 - wr.left));
  tip.style.left = x + "px"; tip.style.top = (r.top - wr.top) + "px";
  tip.classList.add("on");
}
function hideTip(){ tip.classList.remove("on"); }
function applyParallax(){
  const w = svg.querySelector("#world"); if (!w || zoomD !== null) { if (w) w.removeAttribute("transform"); return; }
  w.setAttribute("transform", `translate(${(PAR.x*-10).toFixed(2)} ${(PAR.y*-8).toFixed(2)})`);
}
function burst(id, col, delay){
  const fire = () => {
    const g = svg.querySelector(`.star[data-id="${id}"]`); if (!g) return;
    const c0 = g.querySelector(".core");
    const r = document.createElementNS(NS, "circle");
    r.setAttribute("cx", c0.getAttribute("cx")); r.setAttribute("cy", c0.getAttribute("cy")); r.setAttribute("r", 6);
    r.setAttribute("class", "burst"); r.setAttribute("stroke", col);
    (svg.querySelector("#world") || svg).appendChild(r); setTimeout(() => r.remove(), 1100);
  };
  delay ? setTimeout(fire, delay) : fire();
}
function celebrate(d){ d.items.forEach((it, k) => burst(it.id, "#ffd27a", 120 + k*110)); }
$("#nextStar").addEventListener("click", () => {
  const start = cur ? ORDER.indexOf(cur) + 1 : 0;
  const id = [...ORDER.slice(start), ...ORDER.slice(0, start)].find(x => get(x).lv === 0) || ORDER.find(x => get(x).lv < 2) || ORDER[0];
  const di = BY[id].di;
  if (zoomD !== di) zoomTo(di);
  setTimeout(() => openDrawer(id), zoomD === di ? 0 : 380);
});
let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (svg.clientWidth) renderMap(); }, 150); });

/* ---------- 顶部计数与称号 ---------- */
const RANKS = [[0,"初见星空"],[1,"拾星者"],[9,"观星人"],[18,"绘星师"],[27,"星图守望者"],[36,"满天星图"]];
function rankOf(lit){ let r = 0; RANKS.forEach((x, i) => { if (lit >= x[0]) r = i; }); return r; }
let lastLit = -1, lastRank = -1;
function renderCount(){
  const s = stats();
  const b = $("#litN");
  if (lastLit !== -1 && s.lit !== lastLit) { b.classList.add("bump"); setTimeout(() => b.classList.remove("bump"), 300); }
  const rk = rankOf(s.lit);
  if (lastRank !== -1 && rk > lastRank) setTimeout(() => toast(`<b>✦</b> 称号提升：<b>${RANKS[rk][1]}</b>`), 1400);
  lastLit = s.lit; lastRank = rk; b.textContent = s.lit;
  $("#progBar").style.width = (s.lit / TOTAL * 100) + "%";
  $("#mapHint").textContent = s.lit === 0 ? "点一颗星，或点击星座放大。" : s.lit === TOTAL ? "整片星图都亮了。" : "点击星座可以放大，悬停可以预览。";
  $("#nextStar").textContent = s.lit === TOTAL ? "✦ 回顾一颗" : "✦ 下一颗";
  if (typeof showWelcomeIfNeeded === "function") showWelcomeIfNeeded();
  if (zoomD !== null) renderCrumb();
}

/* ---------- 抽屉 ---------- */
let cur = null;
const drawer = $("#drawer"), scrim = $("#scrim"), note = $("#drNote");
function openDrawer(id){
  cur = id; const {it, d} = BY[id];
  $("#drDom").textContent = d.name; $("#drTitle").textContent = it.name; $("#drGoal").textContent = it.goal;
  const ex = $("#drExplain"); ex.innerHTML = explainHTML(id); bindExplain(ex);
  renderRel(id);
  setLinkFocus(id);
  const body = document.querySelector("#drawer .dr-body"); if (body) body.scrollTop = 0;
  const chips = $("#drChips"); chips.innerHTML = "";
  it.steps.forEach(s => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = "+ " + s;
    b.addEventListener("click", () => {
      const pre = note.value && !note.value.endsWith("\n") ? "\n\n" : (note.value ? "\n" : "");
      note.value += pre + "【" + s + "】\n"; note.focus(); note.setSelectionRange(note.value.length, note.value.length);
      onNote();
    });
    chips.appendChild(b);
  });
  note.value = get(id).n || "";
  syncDrawer();
  drawer.classList.add("on"); scrim.classList.add("on"); drawer.setAttribute("aria-hidden","false");
  setTimeout(() => ($("#drLv button[aria-pressed='true']") || $("#drLv button")).focus({preventScroll:true}), 50);
}
function renderRel(id){
  const box = $("#drRel"), list = REL[id] || [];
  box.innerHTML = list.length ? `<div class="grp-t"><span>相关的星 · ${list.length}</span></div>` : "";
  const wrap = document.createElement("div"); wrap.className = "rel-list";
  list.forEach(r => {
    const v = get(r.id), st = starStyle(v), b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<i style="background:${st.col};box-shadow:${v.lv ? `0 0 ${v.lv*5}px ${st.col}` : "none"}"></i><span><b></b><small></small></span><em></em>`;
    b.querySelector("b").textContent = BY[r.id].it.name;
    b.querySelector("small").textContent = r.why;
    b.querySelector("em").textContent = BY[r.id].d.short;
    b.addEventListener("click", () => { flushNote(); if (zoomD !== null && zoomD !== BY[r.id].di) zoomTo(null); openDrawer(r.id); });
    b.addEventListener("pointerenter", () => { svg.querySelector(`.star[data-id="${r.id}"]`)?.classList.add("peek"); });
    b.addEventListener("pointerleave", () => { svg.querySelector(`.star[data-id="${r.id}"]`)?.classList.remove("peek"); });
    wrap.appendChild(b);
  });
  box.appendChild(wrap);
}
function closeDrawer(){
  flushNote();
  setLinkFocus(null);
  drawer.classList.remove("on"); scrim.classList.remove("on"); drawer.setAttribute("aria-hidden","true");
  const g = svg.querySelector(`.star[data-id="${cur}"]`); cur = null; if (g && $("#v-map").classList.contains("on")) g.focus({preventScroll:true});
}
function syncDrawer(){
  const v = get(cur);
  $("#drLv").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.l) === v.lv)));
  $("#drTag").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.t === v.tag)));
  const h = v.h || [];
  $("#drUp").textContent = h.length >= 2 && h[h.length-1] > h[h.length-2] ? "↑ 比上次更清晰" : "";
  $("#drWc").textContent = (note.value.replace(/\s/g,"").length) + " 字";
  const dots = $("#drDots"); dots.innerHTML = "";
  BY[cur].d.items.forEach(x => {
    const vv = get(x.id), st = starStyle(vv), b = document.createElement("button");
    b.type = "button"; b.title = x.name; b.setAttribute("aria-label", x.name);
    if (x.id === cur) b.setAttribute("aria-current", "true");
    b.innerHTML = `<i style="background:${st.col};box-shadow:${vv.lv ? `0 0 ${vv.lv*5}px ${st.col}` : "none"}"></i>`;
    b.addEventListener("click", () => { if (x.id !== cur) { flushNote(); openDrawer(x.id); } });
    dots.appendChild(b);
  });
}
$("#drLv").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || !cur) return;
  const lv = Number(b.dataset.l), prev = get(cur);
  if (lv === prev.lv) return;
  const before = stats();
  const domDoneBefore = BY[cur].d.items.every(it => get(it.id).lv > 0);
  set(cur, {lv, h: [...(prev.h || []), lv].slice(-10)});
  afterChange();
  const after = stats(), {it, d} = BY[cur];
  burst(cur, starStyle(get(cur)).col);
  if (lv > prev.lv) {
    if (after.lit === TOTAL && before.lit < TOTAL) toast("<b>✦</b> 整片星图都亮了");
    else if (!domDoneBefore && d.items.every(x => get(x.id).lv > 0)) { toast(`<b>✦</b> 「${esc(d.name)}」星座已连成`); celebrate(d); }
    else if (before.lit === 0) toast("<b>✦</b> 第一颗星亮了");
    else toast(`「${esc(it.name)}」${lv === 2 ? "<b>亮起来了</b>" : "开始发光"}`);
  }
  syncDrawer();
});
$("#drTag").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || !cur) return;
  const v = get(cur), t = v.tag === b.dataset.t ? "" : b.dataset.t;
  set(cur, {tag: t}); afterChange(); syncDrawer();
  if (t) { burst(cur, t === "s" ? "#ffd27a" : "#7fd8ff"); toast(t === "s" ? `「${esc(BY[cur].it.name)}」记为<b>长处</b>` : `「${esc(BY[cur].it.name)}」记为<b>想补</b>`); }
});
let nt;
function onNote(){ if (!cur) return; set(cur, {n: note.value}); $("#drWc").textContent = (note.value.replace(/\s/g,"").length) + " 字"; clearTimeout(nt); nt = setTimeout(() => { persist(); renderPanel(); }, 800); }
function flushNote(){ if (nt) { clearTimeout(nt); nt = null; persist(); renderPanel(); } }
note.addEventListener("input", onNote);
function step(dir){ flushNote(); const i = ORDER.indexOf(cur), id = ORDER[(i + dir + TOTAL) % TOTAL]; if (zoomD !== null && zoomD !== BY[id].di) zoomTo(BY[id].di); openDrawer(id); }
$("#drPrev").addEventListener("click", () => step(-1));
$("#drNext").addEventListener("click", () => step(1));
$("#drX").addEventListener("click", closeDrawer);
scrim.addEventListener("click", closeDrawer);
addEventListener("keydown", e => { if (e.key === "Escape") { if (dlg.classList.contains("on")) closeDialog(); else if (!menu.hidden) { toggleMenu(false); menuBtn.focus(); } else if (quick.classList.contains("on")) closeQuick(); else if ($("#imgModal").classList.contains("on")) $("#imgModal").classList.remove("on"); else if (cur) closeDrawer(); else if (zoomD !== null && $("#v-map").classList.contains("on")) zoomTo(null); } });

function afterChange(){ renderMap(); renderCount(); renderPanel(); if (zoomD !== null) renderCrumb(); persist(); }

/* ---------- 角色面板 ---------- */
let radarVals = DOMAINS.map(() => 0), radarAnim;
function radarPts(vals){
  const cx = 220, cy = 200, R = 140;
  return vals.map((v, i) => { const a = -Math.PI/2 + i*2*Math.PI/vals.length, r = 10 + v*(R-10); return [cx + r*Math.cos(a), cy + r*Math.sin(a)]; });
}
function drawRadar(vals){
  const cx = 220, cy = 200, R = 140, n = DOMAINS.length;
  let h = "";
  [0.25,.5,.75,1].forEach(f => { const p = DOMAINS.map((_, i) => { const a = -Math.PI/2 + i*2*Math.PI/n; return (cx + R*f*Math.cos(a)) + "," + (cy + R*f*Math.sin(a)); }).join(" "); h += `<polygon points="${p}" fill="none" stroke="rgba(150,170,235,.18)"/>`; });
  DOMAINS.forEach((d, i) => {
    const a = -Math.PI/2 + i*2*Math.PI/n, x = cx + R*Math.cos(a), y = cy + R*Math.sin(a);
    const lx = cx + (R+26)*Math.cos(a), ly = cy + (R+22)*Math.sin(a);
    h += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(150,170,235,.18)"/>`;
    h += `<text x="${lx}" y="${ly + 4}" text-anchor="${Math.abs(Math.cos(a)) < .2 ? "middle" : Math.cos(a) > 0 ? "start" : "end"}" fill="#8f99bd" font-size="13">${esc(d.short)}</text>`;
  });
  const pts = radarPts(vals);
  h += `<polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="rgba(255,210,122,.16)" stroke="#ffd27a" stroke-width="1.5"/>`;
  pts.forEach(p => { h += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#ffd27a"/>`; });
  $("#radar").innerHTML = h;
}
function renderPanel(){
  const s = stats();
  [["#sLit",s.lit],["#sClear",s.clear],["#sCons",s.cons],["#sWords",s.words]].forEach(([k,v]) => { $(k).textContent = v; });
  const target = DOMAINS.map(domRatio), from = radarVals.slice(), t0 = performance.now();
  cancelAnimationFrame(radarAnim);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = now => { const k = reduce ? 1 : Math.min(1, (now - t0)/600), e = 1 - Math.pow(1-k, 3); radarVals = from.map((f, i) => f + (target[i]-f)*e); drawRadar(radarVals); if (k < 1) radarAnim = requestAnimationFrame(tick); };
  radarAnim = requestAnimationFrame(tick);
  const attr = $("#attr"); attr.innerHTML = "";
  DOMAINS.forEach(d => {
    const lit = d.items.filter(it => get(it.id).lv > 0).length;
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<span>${esc(d.short)}</span><span class="tr"><i style="width:${domRatio(d)*100}%"></i></span><em>${lit}/${d.items.length}</em>`;
    b.title = "在星图中查看" + d.name;
    b.addEventListener("click", () => { location.hash = "map"; setTimeout(() => zoomTo(DOMAINS.indexOf(d)), 120); });
    attr.appendChild(b);
  });
  ["s","g"].forEach(t => {
    const box = $(t === "s" ? "#listS" : "#listG"); box.innerHTML = "";
    const ids = ORDER.filter(id => get(id).tag === t);
    if (!ids.length) { box.innerHTML = `<span class="empty">${t === "s" ? "在星图里把一颗星标为「我的长处」，它会出现在这里。" : "在星图里把一颗星标为「想补」，它会出现在这里。"}</span>`; return; }
    ids.forEach(id => { const b = document.createElement("button"); b.type = "button"; b.textContent = (t === "s" ? "✦ " : "◇ ") + BY[id].it.name; b.addEventListener("click", () => openDrawer(id)); box.appendChild(b); });
  });
  const rk = rankOf(s.lit), nextR = RANKS[rk+1];
  $("#rankName").textContent = RANKS[rk][1];
  const lo = RANKS[rk][0], hi = nextR ? nextR[0] : TOTAL;
  $("#xpBar").style.width = (nextR ? (s.lit - lo) / (hi - lo) * 100 : 100) + "%";
  $("#rankNext").textContent = nextR ? `再点亮 ${hi - s.lit} 颗，成为「${nextR[1]}」` : "整片星图都亮了";
  $("#rankPath").innerHTML = RANKS.slice(1).map((r, i) => `<span class="${rk >= i+1 ? "on" : ""}">${r[1]}</span>`).join("");
  const nm = state.profile.name.trim();
  $("#emblem").textContent = nm ? Array.from(nm)[0] : "我";
}
const pName = $("#pName"), pMotto = $("#pMotto");
pName.value = state.profile.name; pMotto.value = state.profile.motto;
let pt;
[pName, pMotto].forEach(el => el.addEventListener("input", () => {
  state.profile = {name: pName.value, motto: pMotto.value};
  $("#emblem").textContent = pName.value.trim() ? Array.from(pName.value.trim())[0] : "我";
  clearTimeout(pt); pt = setTimeout(persist, 800);
}));

/* ---------- 画像报告 ---------- */
let sampleFn = null, downloadsApi = null, generating = false, apiAI = false;
function aiMode(){ return userAI ? "user" : sampleFn ? "claude" : apiAI ? "api" : "local"; }
function reportData(){
  return DOMAINS.map(d => ({
    领域: d.name,
    条目: d.items.map(it => { const v = get(it.id); return {名称: it.name, 清晰程度: LV[v.lv], 标记: v.tag === "s" ? "长处" : v.tag === "g" ? "想补" : "", 笔记: (v.n || "").slice(0, 700)}; })
      .filter(x => x.清晰程度 !== "还没想过" || x.标记 || x.笔记)
  })).filter(d => d.条目.length);
}
const SRC_LABEL = {claude: "由 Claude 生成", api: "由 AI 生成", user: "由你接入的 AI 生成", local: "基础画像 · 未使用 AI"};
function renderReport(){
  const box = $("#report");
  const s = stats(), mode = aiMode();
  if (generating) { box.innerHTML = `<div class="thinking"><div class="orbit"></div><span>正在根据你写下的内容绘制画像…</span></div>`; return; }
  const r = state.report;
  if (!r) {
    const can = s.lit > 0 || s.words > 0;
    const note = mode === "local" ? "没有接入 AI 时，会根据你的选择和标记生成一份基础画像，内容只在你的浏览器里处理。" : mode === "user" ? `将使用 ${esc(aiLabel(userAI))} 生成。你写下的内容会发给这个服务商。` : "点击后，你写下的内容会发给 AI 来生成画像，只用于这一次生成，不会公开。";
    box.innerHTML = `<div class="card rep-empty"><h2>你的能力画像</h2><p>${can ? `已点亮 ${s.lit} 颗星，写下 ${s.words} 个字。写得越多，画像越准。` : "先在星图里点亮几颗星，再来生成画像。"}</p>
      <button class="btn primary" id="genBtn" ${can ? "" : "disabled"}>生成画像</button>
      <p style="font-size:12px">${note}</p>
      <button class="lnk2" id="aiSetBtn" type="button">${userAI ? "更换 AI" : "接入自己的 AI（支持 DeepSeek、通义、Kimi、OpenAI、Claude、Gemini 等）"}</button></div>`;
    $("#genBtn")?.addEventListener("click", () => generate(false));
    $("#aiSetBtn").addEventListener("click", openAISettings);
    return;
  }
  const list = arr => (arr || []).map(x => `<div class="rep-item"><b>${esc(x.name || "")}</b><span>${esc(x.why || "")}</span></div>`).join("") || `<span class="empty">暂无</span>`;
  box.innerHTML = `
    <div class="card rep-title"><span class="k">能力画像${state.profile.name.trim() ? " · " + esc(state.profile.name.trim()) : ""}</span><h2>${esc(r.title || "")}</h2><p>${esc(r.summary || "")}</p><span class="rep-src" style="justify-self:center">${SRC_LABEL[r.src] || ""}</span></div>
    <div class="rep-cols"><div class="card"><h3>✦ 长处</h3>${list(r.strengths)}</div><div class="card"><h3>◇ 想补</h3>${list(r.gaps)}</div></div>
    <div class="card"><h3>往哪里走</h3><ol class="dir">${(r.directions || []).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
    ${(r.domains || []).length ? `<div class="card"><h3>各领域一句话</h3>${r.domains.map(x => `<div class="rep-dom"><b>${esc(x.name || "")}</b><span>${esc(x.line || "")}</span></div>`).join("")}</div>` : ""}
    <div class="rep-actions"><button class="btn primary" id="imgBtn">生成图片</button><button class="btn" id="copyBtn">复制文字</button><button class="btn" id="regenBtn">重新生成</button></div>
    <div class="rep-meta">生成于点亮 ${r.lit ?? "?"} 颗星时。之后有了新的选择和笔记，重新生成即可更新。<br><button class="lnk2" id="aiSetBtn" type="button">${userAI ? "当前 AI：" + esc(aiLabel(userAI)) + " · 更换" : "接入自己的 AI"}</button></div>`;
  $("#aiSetBtn").addEventListener("click", openAISettings);
  $("#copyBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(reportText(r)); toast("已复制"); } catch(e) { toast("复制失败，请手动选择文字"); }
  });
  $("#regenBtn").addEventListener("click", () => generate(true));
  $("#imgBtn").addEventListener("click", () => makeImage(r));
}
function reportText(r){
  const L = [`【能力画像】${r.title || ""}`, r.summary || "", "", "长处："];
  (r.strengths || []).forEach(x => L.push(`· ${x.name}：${x.why}`));
  L.push("", "想补："); (r.gaps || []).forEach(x => L.push(`· ${x.name}：${x.why}`));
  L.push("", "往哪里走："); (r.directions || []).forEach((x, i) => L.push(`${i+1}. ${x}`));
  return L.join("\n");
}
function buildPrompt(data){
  return `你是一位温和、直接的个人发展顾问。下面是一个人用「能力星图」做的自我盘点：八个领域，每一项有他自选的清晰程度（还没想过 / 有点模糊 / 心里有数）、标记（长处 / 想补）和自己写的笔记。

要求：
- 只根据他写下的内容和标记来写，不编造经历；不打分、不排名。
- 不出现任何日期、期限、时间表或"每天/每周做什么"。方向是目标性的，不是任务清单。
- 语言自然、具体，用中文。称呼用"你"。
- 内容很少时，在 summary 里如实说明，并相应减少条目。

只回复一个 JSON 对象，格式：
{"title":"4到8个字的称号","summary":"2到3句整体画像","strengths":[{"name":"长处","why":"一句依据"}],"gaps":[{"name":"想补的","why":"一句依据"}],"directions":["一句话的目标方向"],"domains":[{"name":"领域名","line":"一句话"}]}
strengths、gaps 各最多 3 条，directions 3 条，domains 只包含他有内容的领域。

他的盘点：
${JSON.stringify(data)}`;
}
function cleanReport(out, src){
  const arr = (a, n) => Array.isArray(a) ? a.slice(0, n) : [];
  const pair = x => ({name: String((x && x.name) || ""), why: String((x && x.why) || "")});
  return {
    title: String(out.title || "").slice(0, 20), summary: String(out.summary || "").slice(0, 400),
    strengths: arr(out.strengths, 3).map(pair), gaps: arr(out.gaps, 3).map(pair),
    directions: arr(out.directions, 4).map(x => String(x).slice(0, 120)),
    domains: arr(out.domains, 8).map(x => ({name: String((x && x.name) || ""), line: String((x && x.line) || "")})),
    lit: stats().lit, src
  };
}
/* 不依赖 AI 的基础画像：只用用户自己的选择、标记和每项的提升建议 */
function localReport(){
  const s = stats(), rk = RANKS[rankOf(s.lit)][1];
  const strengths = ORDER.filter(id => get(id).tag === "s").slice(0, 3);
  const clearOnes = ORDER.filter(id => get(id).lv === 2 && get(id).tag !== "g");
  const sItems = (strengths.length ? strengths : clearOnes.slice(0, 3)).map(id => ({name: BY[id].it.name, why: strengths.includes(id) ? "你把它标为了长处。" : "你对这一项心里有数。"}));
  const gapsIds = ORDER.filter(id => get(id).tag === "g");
  const fuzzy = ORDER.filter(id => get(id).lv === 1 && get(id).tag !== "s");
  const gIds = (gapsIds.length ? gapsIds : fuzzy).slice(0, 3);
  const gItems = gIds.map(id => ({name: BY[id].it.name, why: gapsIds.includes(id) ? "你把它标为了想补。" : "你对这一项还有点模糊。"}));
  const dirIds = [...gIds, ...fuzzy.filter(id => !gIds.includes(id))].slice(0, 3);
  const directions = dirIds.map(id => `${BY[id].it.name}：${(EXPLAIN[id] && EXPLAIN[id].tips[0]) || BY[id].it.goal}`);
  if (!directions.length) { const unlit = ORDER.filter(id => get(id).lv === 0).slice(0, 3); unlit.forEach(id => directions.push(`先看看「${BY[id].it.name}」：${BY[id].it.goal}`)); }
  const best = DOMAINS.slice().sort((a, b) => domRatio(b) - domRatio(a));
  const strongD = best[0], weakD = best[best.length - 1];
  const summary = s.lit === 0 ? "你还没有点亮任何一颗星。先用快速点亮过一遍，画像会更有内容。"
    : `你已经点亮 ${s.lit} 颗星，其中 ${s.clear} 颗心里有数。目前最清楚的领域是「${strongD.name}」，最需要多看看的是「${weakD.name}」。`;
  const domains = DOMAINS.filter(d => d.items.some(it => get(it.id).lv > 0)).map(d => {
    const lit = d.items.filter(it => get(it.id).lv > 0).length, clear = d.items.filter(it => get(it.id).lv === 2).length;
    return {name: d.name, line: `点亮 ${lit}/${d.items.length}，其中 ${clear} 项心里有数。`};
  });
  return cleanReport({title: rk, summary, strengths: sItems, gaps: gItems, directions: directions.slice(0, 3), domains}, "local");
}
async function generate(fresh){
  if (generating) return;
  const data = reportData();
  if (!data.length) { toast("先在星图里点亮几颗星"); return; }
  const mode = aiMode();
  if (mode === "local") { state.report = localReport(); persist(); renderReport(); toast("<b>✦</b> 基础画像已生成"); return; }
  generating = true; renderReport();
  try {
    let out;
    if (mode === "user") out = extractJSON(await callUserAI(userAI, buildPrompt(data)));
    else if (mode === "claude") out = await sampleFn.json(buildPrompt(data), fresh ? {cache:false} : {});
    else {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 90000);
      const res = await fetch("/api/report", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({data}), signal: ctl.signal});
      clearTimeout(t);
      if (!res.ok) throw {code: res.status === 429 ? "rate_limited" : "upstream_error"};
      out = await res.json();
    }
    if (!out || typeof out !== "object" || !out.title) throw {code:"invalid_json"};
    state.report = cleanReport(out, mode);
    persist(); generating = false; renderReport(); toast("<b>✦</b> 画像已生成");
  } catch(e) {
    generating = false;
    const c = e && e.code;
    if (c === "cancelled") { renderReport(); return; }
    if (c === "not_granted" || c === "sampling_disabled") sampleFn = null;
    state.report = localReport(); persist(); renderReport();
    toast(mode === "user" ? `${aiErrorText(e)}，先生成了基础画像` : c === "rate_limited" ? "AI 调用太频繁，先生成了基础画像" : "AI 暂时不可用，先生成了基础画像");
  }
}

/* 画像图片 */
function wrap(x, text, maxW){
  const out = []; let line = "";
  for (const ch of Array.from(text)) { if (x.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; }
  if (line) out.push(line); return out;
}
async function makeImage(r){
  try { await document.fonts.ready; } catch(e) {}
  const W = 1080, P = 90, c = document.createElement("canvas"), x = c.getContext("2d");
  const serif = '"Noto Serif SC","Songti SC",serif', sans = '"Noto Sans SC","PingFang SC",sans-serif';
  const blocks = [];
  x.font = `600 34px ${sans}`;
  const sum = (x.font = `400 32px ${sans}`, wrap(x, r.summary || "", W - P*2));
  const sec = (title, arr, fmt) => { blocks.push({t:"h", s:title}); arr.forEach((it, i) => { x.font = `400 30px ${sans}`; wrap(x, fmt(it, i), W - P*2).forEach((l, k) => blocks.push({t:"p", s:l, first:k===0})); }); };
  sec("✦ 长处", r.strengths || [], it => `${it.name}：${it.why}`);
  sec("◇ 想补", r.gaps || [], it => `${it.name}：${it.why}`);
  sec("往哪里走", r.directions || [], (it, i) => `${i+1}. ${it}`);
  let H = 330 + sum.length*50 + 40;
  blocks.forEach(b => { H += b.t === "h" ? 90 : (b.first ? 54 : 46); });
  H += 160;
  c.width = W; c.height = H;
  const g = x.createRadialGradient(W*.7, 0, 50, W*.5, H*.4, H); g.addColorStop(0, "#1a2556"); g.addColorStop(1, "#070b1a");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const R = rng(4242);
  for (let i = 0; i < 260; i++) { x.globalAlpha = .2 + R()*.6; x.fillStyle = "#cfd8ff"; x.beginPath(); x.arc(R()*W, R()*H, R()*1.6+.3, 0, 6.283); x.fill(); }
  x.globalAlpha = 1;
  x.textAlign = "center"; x.fillStyle = "#8f99bd"; x.font = `400 26px ${sans}`;
  x.fillText("能力画像" + (state.profile.name.trim() ? " · " + state.profile.name.trim() : ""), W/2, 140);
  x.fillStyle = "#ffd27a"; x.font = `700 72px ${serif}`; x.fillText(r.title || "", W/2, 240);
  x.fillStyle = "#e9edff"; x.font = `400 32px ${sans}`;
  let y = 320; sum.forEach(l => { x.fillText(l, W/2, y); y += 50; });
  y += 40; x.textAlign = "left";
  blocks.forEach(b => {
    if (b.t === "h") { y += 40; x.fillStyle = b.s.startsWith("✦") ? "#ffd27a" : b.s.startsWith("◇") ? "#7fd8ff" : "#a9bcff"; x.font = `600 34px ${serif}`; x.fillText(b.s, P, y); y += 50; }
    else { if (b.first) y += 8; x.fillStyle = "#dfe4fb"; x.font = `400 30px ${sans}`; x.fillText(b.s, P, y); y += 46; }
  });
  x.textAlign = "center"; x.fillStyle = "#5d6789"; x.font = `400 22px ${sans}`;
  x.fillText(`能力星图 · 已点亮 ${stats().lit} / ${TOTAL} · 刘橙绿制作`, W/2, H - 70);
  c.toBlob(blob => {
    if (!blob) { toast("图片生成失败"); return; }
    const url = URL.createObjectURL(blob);
    $("#imgPrev").src = url; $("#imgModal").classList.add("on");
    const sv = $("#imgSave");
    sv.hidden = false;
    $("#imgTip").textContent = "点击保存，或在手机上长按图片保存。";
    sv.onclick = () => saveFile("能力画像.png", blob);
  }, "image/png");
}
$("#imgClose").addEventListener("click", () => $("#imgModal").classList.remove("on"));

/* ---------- 名词解释渲染 ---------- */
let explainOpen = false;
function explainHTML(id){
  const e = EXPLAIN[id] || {def:"", src:"", tips:[]};
  return `<p class="def">${esc(e.def)}</p><details${explainOpen ? " open" : ""}><summary>理论来源与提升方法</summary><p class="src"><b>来源：</b>${esc(e.src)}</p><ul>${e.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul></details>`;
}
function bindExplain(box){ const d = box.querySelector("details"); if (d) d.addEventListener("toggle", () => { explainOpen = d.open; }); }

/* ---------- 快速点亮 ---------- */
const quick = $("#quick"), qCard = $("#qCard");
let qi = 0, qBusy = false, qList = ORDER.slice(), qScope = null;
const LVSVG = [
  `<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="3.5" fill="#4a5578"/></svg>`,
  `<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="#c9d2f5" opacity=".18"/><circle cx="15" cy="15" r="5" fill="#c9d2f5"/></svg>`,
  `<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="14" fill="#fff" opacity=".2"/><circle cx="15" cy="15" r="7" fill="#fff"/></svg>`
];
function openQuick(scope){
  hideWelcome(true);
  if (cur) closeDrawer();
  quick.classList.add("on"); document.body.style.overflow = "hidden";
  if (scope === undefined) { renderQPick(); return; }
  startQuick(scope);
}
function startQuick(scope){
  qScope = scope;
  qList = scope === null ? ORDER.slice() : DOMAINS[scope].items.map(it => it.id);
  const i = qList.findIndex(id => get(id).lv === 0);
  qi = i === -1 ? 0 : i;
  renderQ(!REDUCE);
}
function renderQPick(){
  $("#qN").textContent = "选择范围"; $("#qBar").style.width = "0%";
  const s = stats();
  qCard.className = "q-card in";
  qCard.innerHTML = `<span class="dom">快速点亮</span><h2>从哪里开始？</h2>
    <p style="margin:0;color:var(--muted)">每颗星只选一下你现在的了解程度，不用写字。可以一口气过完，也可以一次只过一个星座。</p>
    <button class="btn primary" id="qAll" style="justify-self:start">全部 36 颗 · 已点亮 ${s.lit}</button>
    <div class="q-pick" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px">${DOMAINS.map((d, i) => { const lit = d.items.filter(it => get(it.id).lv > 0).length; return `<button class="btn" data-i="${i}" style="text-align:left;display:flex;justify-content:space-between;gap:8px"><span>${esc(d.name)}</span><span style="color:${lit === d.items.length ? "var(--gold)" : "var(--muted)"}">${lit}/${d.items.length}</span></button>`; }).join("")}</div>`;
  $("#qAll").addEventListener("click", () => startQuick(null));
  qCard.querySelectorAll(".q-pick button").forEach(b => b.addEventListener("click", () => startQuick(Number(b.dataset.i))));
}
function closeQuick(){
  quick.classList.remove("on"); document.body.style.overflow = "";
  renderMap(); renderCount(); renderPanel();
}
function qProgress(){
  const lit = stats().lit;
  const N = qList.length;
  $("#qN").textContent = qi >= N ? "完成" : `${qi + 1} / ${N}`;
  $("#qBar").style.width = (Math.min(qi, N) / N * 100) + "%";
  return lit;
}
function renderQ(anim){
  qProgress();
  if (qi >= qList.length) { renderQDone(); return; }
  const id = qList[qi], {it, d} = BY[id], v = get(id);
  qCard.className = "q-card" + (anim ? " in" : "");
  qCard.innerHTML = `
    <span class="dom">${esc(d.name)} · ${d.items.indexOf(it) + 1} / ${d.items.length}</span>
    <h2>${esc(it.name)}</h2>
    <div class="explain">${explainHTML(id)}</div>
    <div class="q-tag"><span>可选标记</span>
      <button class="btn" data-t="s" aria-pressed="${v.tag === "s"}" style="${v.tag === "s" ? "border-color:var(--gold);color:var(--gold)" : ""}">✦ 我的长处 <kbd>S</kbd></button>
      <button class="btn" data-t="g" aria-pressed="${v.tag === "g"}" style="${v.tag === "g" ? "border-color:var(--cyan);color:var(--cyan)" : ""}">◇ 想补 <kbd>G</kbd></button>
    </div>
    <div class="q-lv">${LV.map((l, k) => `<button data-l="${k}" aria-pressed="${v.lv === k && (v.h || []).length > 0}">${LVSVG[k]}<span>${l}</span><kbd>${k + 1}</kbd></button>`).join("")}</div>
    <div class="q-foot"><button class="lnk" id="qPrev" ${qi === 0 ? "disabled" : ""}>‹ 上一张</button><button class="lnk" id="qWrite">在星图里写笔记</button><button class="lnk" id="qSkip">跳过 ›</button></div>`;
  bindExplain(qCard);
  qCard.querySelectorAll(".q-tag button").forEach(b => b.addEventListener("click", () => qTag(b.dataset.t)));
  qCard.querySelectorAll(".q-lv button").forEach(b => b.addEventListener("click", () => qChoose(Number(b.dataset.l))));
  $("#qPrev").addEventListener("click", () => qGo(-1));
  $("#qSkip").addEventListener("click", () => qGo(1));
  $("#qWrite").addEventListener("click", () => { const id2 = qList[qi]; closeQuick(); location.hash = "map"; const di = BY[id2].di; zoomTo(di); setTimeout(() => openDrawer(id2), 380); });
}
function qTag(t){
  const id = qList[qi], v = get(id);
  set(id, {tag: v.tag === t ? "" : t}); persist(); renderQ(false);
}
function qChoose(lv){
  if (qBusy) return;
  const id = qList[qi], prev = get(id);
  const domDoneBefore = BY[id].d.items.every(x => get(x.id).lv > 0);
  set(id, {lv, h: lv !== prev.lv || !(prev.h || []).length ? [...(prev.h || []), lv].slice(-10) : prev.h});
  persist(); renderCount();
  const d = BY[id].d;
  if (lv > 0 && !domDoneBefore && d.items.every(x => get(x.id).lv > 0)) toast(`<b>✦</b> 「${esc(d.name)}」星座已连成`);
  qGo(1);
}
function qGo(dir){
  if (qBusy) return;
  const n = qi + dir; if (n < 0) return;
  qBusy = true;
  const reduce = REDUCE;
  qCard.classList.add("out");
  setTimeout(() => { qi = n; qBusy = false; renderQ(!reduce); }, reduce ? 0 : 200);
}
function renderQDone(){
  const s = stats(), sN = ORDER.filter(id => get(id).tag === "s").length, gN = ORDER.filter(id => get(id).tag === "g").length;
  const nextD = qScope === null ? -1 : DOMAINS.findIndex((d, i) => i !== qScope && d.items.some(it => get(it.id).lv === 0));
  qCard.className = "q-card q-done in";
  qCard.innerHTML = `<span class="dom">${qScope === null ? "快速点亮完成" : "「" + esc(DOMAINS[qScope].name) + "」完成"}</span><div class="big">${s.lit} / ${TOTAL}</div>
    <p style="margin:0;color:var(--muted)">点亮了 ${s.lit} 颗星，其中 ${s.clear} 颗心里有数${sN || gN ? `；标记了 ${sN} 个长处、${gN} 个想补` : ""}。接下来可以挑一颗慢慢写。</p>
    <div class="row">${nextD >= 0 ? `<button class="btn primary" id="qdNext">继续「${esc(DOMAINS[nextD].name)}」</button>` : ""}<button class="btn ${nextD >= 0 ? "" : "primary"}" id="qdMap">去看星图</button><button class="btn" id="qdPanel">看角色面板</button>${gN ? `<button class="btn" id="qdGap">从想补的开始写</button>` : ""}</div>`;
  $("#qdNext")?.addEventListener("click", () => startQuick(nextD));
  $("#qdMap").addEventListener("click", () => { const z = qScope; closeQuick(); location.hash = "map"; zoomTo(z); });
  $("#qdPanel").addEventListener("click", () => { closeQuick(); location.hash = "panel"; });
  $("#qdGap")?.addEventListener("click", () => { const id = ORDER.find(x => get(x).tag === "g"); closeQuick(); location.hash = "map"; zoomTo(BY[id].di); setTimeout(() => openDrawer(id), 380); });
}
$("#qClose").addEventListener("click", closeQuick);
$("#quickBtn").addEventListener("click", () => zoomD === null ? openQuick() : openQuick(zoomD));
addEventListener("keydown", e => {
  if (!quick.classList.contains("on") || e.target.closest("input,textarea")) return;
  if (!qCard.querySelector(".q-lv")) return;
  if (["1","2","3"].includes(e.key)) { e.preventDefault(); qChoose(Number(e.key) - 1); }
  else if (e.key === "s" || e.key === "S") qTag("s");
  else if (e.key === "g" || e.key === "G") qTag("g");
  else if (e.key === "ArrowLeft") qGo(-1);
  else if (e.key === "ArrowRight") qGo(1);
});

/* ---------- 首次欢迎 ---------- */
function showWelcomeIfNeeded(){
  const w = $("#welcome");
  w.hidden = !(stats().lit === 0 && !state.seenWelcome);
}
function hideWelcome(remember){
  $("#welcome").hidden = true;
  if (remember && !state.seenWelcome) { state.seenWelcome = true; persist(); }
}
$("#welcomeGo").addEventListener("click", () => openQuick());
$("#welcomeSkip").addEventListener("click", () => hideWelcome(true));

/* ---------- 文件保存、对话框、菜单 ---------- */
async function saveFile(filename, blob){
  if (downloadsApi) {
    try { await downloadsApi.save({filename, data: blob}); toast("已保存"); } catch(e) { toast("没有保存"); }
    return;
  }
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast("已保存到下载文件夹");
}
const dlg = $("#dlg");
let dlgReturn = null;
function dialog({title, body, actions}){
  dlgReturn = document.activeElement;
  $("#dlgT").textContent = title; $("#dlgB").innerHTML = body;
  const A = $("#dlgA"); A.innerHTML = "";
  actions.forEach(a => {
    const b = document.createElement("button"); b.type = "button"; b.className = "btn " + (a.cls || ""); b.textContent = a.label;
    b.addEventListener("click", () => { closeDialog(); a.onClick && a.onClick(); });
    A.appendChild(b);
  });
  dlg.classList.add("on");
  setTimeout(() => (A.querySelector(".primary,.danger") || A.querySelector("button")).focus(), 30);
}
function closeDialog(){ dlg.classList.remove("on"); if (dlgReturn && dlgReturn.focus) dlgReturn.focus(); }
dlg.addEventListener("click", e => { if (e.target === dlg) closeDialog(); });

const menu = $("#menu"), menuBtn = $("#menuBtn");
function toggleMenu(open){ menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); if (open) menu.querySelector("button").focus(); }
menuBtn.addEventListener("click", e => { e.stopPropagation(); toggleMenu(menu.hidden); });
document.addEventListener("click", e => { if (!menu.hidden && !e.target.closest(".menu-wrap")) toggleMenu(false); });
menu.addEventListener("click", () => toggleMenu(false));

function rerenderAll(){
  pName.value = state.profile.name; pMotto.value = state.profile.motto;
  lastLit = -1; lastRank = -1; firstRender = true;
  renderCount(); renderMap(); renderPanel(); renderReport();
}
$("#mExport").addEventListener("click", () => {
  const payload = {app: "ability-starmap", version: 1, exportedAt: new Date().toISOString(), data: state};
  const d = new Date(), stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  saveFile(`能力星图备份-${stamp}.json`, new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"}));
});
$("#mImport").addEventListener("click", () => $("#importFile").click());
$("#importFile").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = "";
  if (!f) return;
  let next;
  try { const raw = JSON.parse(await f.text()); next = normalize(raw && raw.data ? raw.data : raw); }
  catch(err) { dialog({title: "无法读取这个文件", body: "<p>请选择从能力星图导出的 .json 备份文件。</p>", actions: [{label: "好的", cls: "primary"}]}); return; }
  const lit = Object.values(next.items).filter(v => v.lv > 0).length;
  dialog({title: "导入这份备份？", body: `<p>备份里点亮了 <b>${lit}</b> 颗星。导入后会<b>替换</b>当前的全部内容。</p>`, actions: [
    {label: "取消"},
    {label: "导入", cls: "primary", onClick: () => { state = next; state.seenWelcome = true; persist(); rerenderAll(); toast("<b>✦</b> 已导入"); }}
  ]});
});
$("#mReset").addEventListener("click", () => dialog({title: "清空全部内容？", body: "<p>所有的选择、标记、笔记和画像都会被删除，无法恢复。需要的话，先导出一份备份。</p>", actions: [
  {label: "先导出备份", onClick: () => $("#mExport").click()},
  {label: "清空", cls: "danger", onClick: () => { state = normalize({}); state.seenWelcome = false; persist(); rerenderAll(); zoomTo(null); toast("已清空"); }}
]}));
$("#mAI").addEventListener("click", openAISettings);
$("#mAbout").addEventListener("click", () => dialog({title: "关于能力星图", body: `
  <p>能力星图把一个人的能力分成 <b>8 个领域、36 项</b>：核心能力、个人硬件条件、资产与财务、职场潜力、创业潜力、内圈关系、外圈关系、资源准入权。</p>
  <p>它不打分，也不排时间表。你只需要选出自己对每一项的了解程度，愿意的话再写下想法。</p>
  <p>由刘橙绿制作。</p>
  <p><b>数据去哪了：</b>你的选择和笔记只保存在当前设备的浏览器里，网站服务器不会保存。只有点击「生成画像」并且网站开启了 AI 时，笔记才会发送给 AI 生成这一次的画像。</p>`, actions: [{label: "知道了", cls: "primary"}]}));

/* ---------- 自带 API：主流 AI 服务预设 ---------- */
/* format: openai = OpenAI 兼容的 /chat/completions；anthropic = Claude Messages；gemini = Gemini generateContent */
const AI_PROVIDERS = [
  {id:"deepseek", name:"DeepSeek", group:"国内", format:"openai", base:"https://api.deepseek.com", model:"deepseek-flash", site:"platform.deepseek.com"},
  {id:"qwen", name:"通义千问（阿里云百炼）", group:"国内", format:"openai", base:"https://dashscope.aliyuncs.com/compatible-mode/v1", model:"qwen-plus", site:"bailian.console.aliyun.com"},
  {id:"kimi", name:"Kimi（月之暗面）", group:"国内", format:"openai", base:"https://api.moonshot.cn/v1", model:"moonshot-v1-8k", site:"platform.moonshot.cn"},
  {id:"zhipu", name:"智谱 GLM", group:"国内", format:"openai", base:"https://open.bigmodel.cn/api/paas/v4", model:"glm-4-flash", site:"open.bigmodel.cn"},
  {id:"doubao", name:"豆包（火山方舟）", group:"国内", format:"openai", base:"https://ark.cn-beijing.volces.com/api/v3", model:"", modelHint:"填写模型 ID 或推理接入点 ID", site:"console.volcengine.com/ark"},
  {id:"hunyuan", name:"腾讯混元", group:"国内", format:"openai", base:"https://api.hunyuan.cloud.tencent.com/v1", model:"hunyuan-turbos-latest", site:"console.cloud.tencent.com/hunyuan"},
  {id:"qianfan", name:"百度千帆（文心）", group:"国内", format:"openai", base:"https://qianfan.baidubce.com/v2", model:"ernie-4.0-turbo-8k", site:"console.bce.baidu.com/qianfan"},
  {id:"minimax", name:"MiniMax", group:"国内", format:"openai", base:"https://api.minimaxi.com/v1", model:"MiniMax-Text-01", site:"platform.minimaxi.com"},
  {id:"stepfun", name:"阶跃星辰", group:"国内", format:"openai", base:"https://api.stepfun.com/v1", model:"step-1-8k", site:"platform.stepfun.com"},
  {id:"yi", name:"零一万物", group:"国内", format:"openai", base:"https://api.lingyiwanwu.com/v1", model:"yi-lightning", site:"platform.lingyiwanwu.com"},
  {id:"siliconflow", name:"硅基流动 SiliconFlow", group:"国内", format:"openai", base:"https://api.siliconflow.cn/v1", model:"deepseek-ai/DeepSeek-V3", site:"cloud.siliconflow.cn"},
  {id:"openai", name:"OpenAI（ChatGPT）", group:"海外", format:"openai", base:"https://api.openai.com/v1", model:"gpt-4o-mini", site:"platform.openai.com"},
  {id:"anthropic", name:"Anthropic（Claude）", group:"海外", format:"anthropic", base:"https://api.anthropic.com", model:"claude-haiku-5-5", site:"console.anthropic.com"},
  {id:"gemini", name:"Google Gemini", group:"海外", format:"gemini", base:"https://generativelanguage.googleapis.com", model:"gemini-2.5-flash", site:"aistudio.google.com"},
  {id:"xai", name:"xAI（Grok）", group:"海外", format:"openai", base:"https://api.x.ai/v1", model:"grok-3-mini", site:"console.x.ai"},
  {id:"mistral", name:"Mistral", group:"海外", format:"openai", base:"https://api.mistral.ai/v1", model:"mistral-small-latest", site:"console.mistral.ai"},
  {id:"groq", name:"Groq", group:"海外", format:"openai", base:"https://api.groq.com/openai/v1", model:"llama-3.3-70b-versatile", site:"console.groq.com"},
  {id:"openrouter", name:"OpenRouter（多模型聚合）", group:"海外", format:"openai", base:"https://openrouter.ai/api/v1", model:"openrouter/auto", site:"openrouter.ai"},
  {id:"ollama", name:"Ollama（本机模型）", group:"本地与自定义", format:"openai", base:"http://localhost:11434/v1", model:"qwen2.5:7b", noKey:true, editableBase:true, site:"ollama.com"},
  {id:"custom", name:"自定义（OpenAI 兼容接口）", group:"本地与自定义", format:"openai", base:"", model:"", editableBase:true}
];
const AI_KEY = "starmap-ai-config";
function loadAI(){
  try { const r = sessionStorage.getItem(AI_KEY) || localStorage.getItem(AI_KEY); return r ? JSON.parse(r) : null; } catch(e) { return null; }
}
function saveAI(cfg, remember){
  try { localStorage.removeItem(AI_KEY); sessionStorage.removeItem(AI_KEY); } catch(e) {}
  if (!cfg) return;
  try { (remember ? localStorage : sessionStorage).setItem(AI_KEY, JSON.stringify(cfg)); } catch(e) {}
}
let userAI = loadAI();
let siteProxy = false;
const providerOf = id => AI_PROVIDERS.find(p => p.id === id);
function aiLabel(cfg){ const p = cfg && providerOf(cfg.provider); return p ? `${p.name} · ${cfg.model || "未填模型"}` : ""; }

function extractJSON(text){
  const t = String(text || "").replace(/```json|```/g, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw {code: "invalid_json"};
  return JSON.parse(t.slice(a, b + 1));
}
function buildRequest(cfg, prompt){
  const p = providerOf(cfg.provider), base = (cfg.base || p.base || "").replace(/\/+$/, "");
  if (p.format === "anthropic") return {url: base + "/v1/messages", init: {method: "POST", headers: {"Content-Type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"}, body: JSON.stringify({model: cfg.model, max_tokens: 1500, messages: [{role: "user", content: prompt}]})}, read: j => (j.content || []).map(c => c.text || "").join("")};
  if (p.format === "gemini") return {url: `${base}/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`, init: {method: "POST", headers: {"Content-Type": "application/json", "x-goog-api-key": cfg.key}, body: JSON.stringify({contents: [{role: "user", parts: [{text: prompt}]}], generationConfig: {temperature: 0.7, maxOutputTokens: 1500, responseMimeType: "application/json"}})}, read: j => (((j.candidates || [])[0] || {}).content || {parts: []}).parts.map(x => x.text || "").join("")};
  const headers = {"Content-Type": "application/json"}; if (cfg.key) headers.Authorization = "Bearer " + cfg.key;
  return {url: base + "/chat/completions", init: {method: "POST", headers, body: JSON.stringify({model: cfg.model, ...(p.id === "deepseek" ? {thinking: {type: "disabled"}} : {}), messages: [{role: "user", content: prompt}], temperature: 0.7, max_tokens: 1500})}, read: j => ((((j.choices || [])[0] || {}).message) || {}).content || ""};
}
async function callUserAI(cfg, prompt, timeoutMs){
  const p = providerOf(cfg.provider); if (!p) throw {code: "no_provider"};
  const req = buildRequest(cfg, prompt);
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutMs || 90000);
  try {
    let res;
    try { res = await fetch(req.url, Object.assign({}, req.init, {signal: ctl.signal})); }
    catch(netErr) {
      /* 浏览器直连被拦（多为跨域限制）时，改走本站的转发接口；自定义和本机地址不转发 */
      if (!siteProxy || p.editableBase || ctl.signal.aborted) throw {code: ctl.signal.aborted ? "timeout" : "network"};
      res = await fetch("/api/proxy", {method: "POST", headers: {"Content-Type": "application/json", Authorization: "Bearer " + cfg.key}, body: JSON.stringify({provider: p.id, model: cfg.model, prompt}), signal: ctl.signal});
      if (!res.ok) throw {code: res.status === 401 || res.status === 403 ? "auth" : res.status === 429 ? "rate_limited" : "upstream_error", status: res.status};
      const j = await res.json(); return j.text || "";
    }
    if (!res.ok) throw {code: res.status === 401 || res.status === 403 ? "auth" : res.status === 429 ? "rate_limited" : res.status === 404 ? "model" : "upstream_error", status: res.status};
    return req.read(await res.json());
  } finally { clearTimeout(t); }
}
function aiErrorText(e){
  const c = e && e.code;
  return c === "auth" ? "API Key 不正确或没有权限" : c === "model" ? "找不到这个模型，请检查模型名" : c === "rate_limited" ? "调用太频繁或额度不足" : c === "timeout" ? "等待超时" : c === "network" ? "连不上这个接口（可能是网络或跨域限制）" : c === "invalid_json" ? "返回的内容格式不对" : "调用失败" + (e && e.status ? `（${e.status}）` : "");
}

/* AI 设置面板 */
function openAISettings(){
  toggleMenu(false);
  const cfg = userAI || {provider: "deepseek", model: "", key: "", base: "", remember: true};
  const groups = ["国内","海外","本地与自定义"];
  dialog({title: "接入你自己的 AI", body: `
    <p>选一个服务商，填入你自己的 API Key，画像就会用它生成。Key 只保存在你的浏览器里，不会进入备份文件。</p>
    <label class="fld"><span>服务商</span><select id="aiProv">${groups.map(g => `<optgroup label="${g}">${AI_PROVIDERS.filter(p => p.group === g).map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</optgroup>`).join("")}</select></label>
    <label class="fld" id="aiBaseRow"><span>接口地址</span><input class="txt" id="aiBase" placeholder="https://…/v1"></label>
    <label class="fld"><span>模型</span><input class="txt" id="aiModel"></label>
    <label class="fld" id="aiKeyRow"><span>API Key</span><span class="keyrow"><input class="txt" id="aiKey" type="password" autocomplete="off" spellcheck="false" placeholder="sk-…"><button type="button" class="btn" id="aiShow">显示</button></span></label>
    <label class="chk"><input type="checkbox" id="aiRemember"> 记住在这台设备上（不勾选则关闭页面后清除）</label>
    <p class="hint2" id="aiSite"></p>
    <p class="ai-status" id="aiStatus" role="status"></p>`,
    actions: []});
  const A = $("#dlgA"); A.innerHTML = "";
  const mk = (label, cls, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn " + cls; b.textContent = label; b.addEventListener("click", fn); A.appendChild(b); return b; };
  const sel = $("#aiProv"), base = $("#aiBase"), model = $("#aiModel"), key = $("#aiKey"), rem = $("#aiRemember"), st = $("#aiStatus");
  sel.value = cfg.provider; key.value = cfg.key || ""; rem.checked = cfg.remember !== false;
  const sync = keepValues => {
    const p = providerOf(sel.value);
    $("#aiBaseRow").hidden = !p.editableBase;
    if (!keepValues || !base.value) base.value = p.editableBase ? (cfg.provider === p.id && cfg.base ? cfg.base : p.base) : p.base;
    if (!keepValues || !model.value) model.value = cfg.provider === p.id && cfg.model ? cfg.model : p.model;
    model.placeholder = p.modelHint || "模型名";
    $("#aiKeyRow").hidden = !!p.noKey;
    $("#aiSite").textContent = p.site ? `在 ${p.site} 申请 API Key。预设的模型名可能随服务商更新，以控制台为准。` : "填写兼容 OpenAI 格式的接口地址（通常以 /v1 结尾）。";
    st.textContent = "";
  };
  sync(true);
  sel.addEventListener("change", () => sync(false));
  $("#aiShow").addEventListener("click", () => { key.type = key.type === "password" ? "text" : "password"; $("#aiShow").textContent = key.type === "password" ? "显示" : "隐藏"; });
  const read = () => ({provider: sel.value, model: model.value.trim(), key: key.value.trim(), base: providerOf(sel.value).editableBase ? base.value.trim() : "", remember: rem.checked});
  const valid = c => { const p = providerOf(c.provider); if (!c.model) return "请填写模型名"; if (!p.noKey && !c.key) return "请填写 API Key"; if (p.editableBase && !/^https?:\/\//.test(c.base)) return "请填写以 http 开头的接口地址"; return ""; };
  if (userAI) mk("停用", "danger", () => { userAI = null; saveAI(null); closeDialog(); renderReport(); toast("已停用自带 API"); });
  const testBtn = mk("测试连接", "", async () => {
    const c = read(), v = valid(c); if (v) { st.textContent = v; st.className = "ai-status bad"; return; }
    st.textContent = "正在测试…"; st.className = "ai-status"; testBtn.disabled = true;
    try { const out = extractJSON(await callUserAI(c, '只回复这个 JSON，不要其他文字：{"ok":true}', 30000)); st.textContent = out && out.ok ? "连接成功" : "连上了，但返回内容不太对，生成时可能需要换个模型"; st.className = "ai-status " + (out && out.ok ? "good" : ""); }
    catch(e) { st.textContent = "测试失败：" + aiErrorText(e); st.className = "ai-status bad"; }
    finally { testBtn.disabled = false; }
  });
  mk("保存", "primary", () => {
    const c = read(), v = valid(c); if (v) { st.textContent = v; st.className = "ai-status bad"; return; }
    userAI = c; saveAI(c, c.remember); closeDialog(); renderReport(); toast(`已接入 <b>${esc(providerOf(c.provider).name)}</b>`);
  });
  setTimeout(() => sel.focus(), 40);
}

/* ---------- 视图切换 ---------- */
const VIEWS = ["map","panel","report"];
function show(v){
  if (!VIEWS.includes(v)) v = "map";
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("on", el.id === "v-" + v));
  document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.v === v)));
  if (v === "map") renderMap();
  if (v === "panel") renderPanel();
  if (v === "report") renderReport();
  if (window.scrollY > 120) window.scrollTo({top: 0, behavior: REDUCE ? "auto" : "smooth"});
}
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => { if (location.hash !== "#" + b.dataset.v) location.hash = b.dataset.v; else show(b.dataset.v); }));
addEventListener("hashchange", () => show(location.hash.slice(1)));

renderCount(); renderPanel(); show(location.hash.slice(1) || "map");

/* ---------- 平台能力：账号同步、AI、下载 ---------- */
(async () => {
  if (!window.claude || typeof window.claude.use !== "function") {
    /* 独立部署：检查服务端 AI（Cloudflare Pages Functions）是否可用 */
    if (location.protocol.startsWith("http")) {
      try {
        const r = await fetch("/api/health", {cache: "no-store"});
        if (r.ok) { const j = await r.json(); apiAI = !!(j && j.ai); siteProxy = !!(j && j.proxy); if ($("#v-report").classList.contains("on")) renderReport(); }
      } catch(e) {}
    }
    return;
  }
  window.claude.use("sample").then(s => { sampleFn = s; if ($("#v-report").classList.contains("on")) renderReport(); }).catch(() => {});
  window.claude.use("downloads").then(d => { downloadsApi = d; }).catch(() => {});
  try {
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) return;
    const uid = await user.id(); if (!uid) return;
    const ref = db.doc("data/users/" + uid + "/inventory");
    const snap = await Promise.race([ref.get(), new Promise((_, rej) => setTimeout(() => rej({code:"timeout"}), 10000))]);
    const localHas = Object.keys(state.items).length > 0 || state.profile.name || state.report;
    if (snap.exists) {
      state = normalize(snap.data());
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {}
      pName.value = state.profile.name; pMotto.value = state.profile.motto;
      lastLit = -1; renderCount(); renderMap(); renderPanel(); renderReport();
      if (cur) { note.value = get(cur).n || ""; syncDrawer(); }
    }
    cloudRef = ref;
    $("#saveState").textContent = "进度保存在你自己的账号空间里，只有你能看到。";
    if (!snap.exists && localHas) persist();
  } catch(e) {
    if (e && e.code === "timeout") $("#saveState").textContent = "暂时连不上账号空间，进度先保存在本浏览器。";
  }
})();
