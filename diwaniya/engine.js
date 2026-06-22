/* ============================================================
   محرّك ناقشنا — Engine Core (v4.5)
   ملف منطق مستقل. يعمل في المتصفّح وفي Node.
   يحوي: ٢٤ شخصية بلهجات مدقّقة + رادار ردة الفعل + منطق الحكم.
   ملاحظة للفريق التقني: هذا "محاكي قواعدي" (rule-based mock)
   لإثبات التجربة. الإنتاج الحقيقي يستبدل دالّة generate()
   باستدعاء LLM (Claude/GPT) + البرومبت من ملف المحرّك.
   ============================================================ */

const PERSONAS = [
  // النواة الكويتية
  { id:"sultan", name:"سلطان", emoji:"🧢", group:"كويتي", dim:"الفيرال",
    tone:"حضري Gen-Z، إنجليزي سوشيال متداخل، چ لا ك",
    keys:["ترند","فايب","يفايرل","چذي يطلع","سكِب"] },
  { id:"omfahad", name:"أم فهد", emoji:"🧕", group:"كويتي", dim:"السمعة العائلية",
    tone:"حضرية سنية، دافئ + ديني خفيف + أمثال",
    keys:["ما شاء الله","عيب يمّه","يخزي العين","الله يهديه"] },
  { id:"bukhaled", name:"بو خالد", emoji:"💼", group:"كويتي", dim:"تجاري/براند",
    tone:"تاجر حضري، جُمل قصيرة حازمة",
    keys:["السوق","مردود","خسارة","السمعة رأس مال"] },
  { id:"noura", name:"نورة", emoji:"⚖️", group:"كويتي", dim:"القانون",
    tone:"محامية، فصحى قانونية دقيقة",
    keys:["قانونياً","المادة تنصّ","التشهير","المساءلة"] },
  { id:"faisal", name:"فيصل", emoji:"😏", group:"كويتي", dim:"نقاط الضعف",
    tone:"المعارض الساخر، حاد على المحتوى لا الشخص",
    keys:["هع","أكيد","عاد صدّقناك","خوش بطل"] },
  { id:"jasim", name:"جاسم", emoji:"😐", group:"كويتي", dim:"الأغلبية الصامتة",
    tone:"محايد بسيط، جُمل قصيرة جداً",
    keys:["عادي","ماكو شي","الله أعلم","مدري"] },
  // الطيف المذهبي
  { id:"hussain", name:"حسين", emoji:"🛠️", group:"مذهبي", dim:"حساسية شريحة كبيرة",
    tone:"شيعي كويتي حضري، فصيح هادئ يحترم، بلا لهجة طائفية",
    keys:["فيه شريحة ما تشوفها مثلك","خلّنا نراعي","بصراحة فيه حساسية"] },
  { id:"sheikh", name:"الشيخ عبدالعزيز", emoji:"🕌", group:"مذهبي", dim:"الشرعي",
    tone:"فصحى رصينة مستشهدة سليمة نحوياً",
    keys:["هذا لا يجوز شرعاً","الأصل في كذا","اتّقِ الله"] },
  // البدو
  { id:"mtaab", name:"متعب", emoji:"🐫", group:"بدو", dim:"الأمن + العِرض",
    tone:"بدوي قبلي، گاف بدل قاف (گال/گاعد)",
    keys:["العادات","الديرة","ما يمشي عندنا","الرجال","العِرض"] },
  { id:"haya", name:"هيا", emoji:"🎓", group:"بدو", dim:"الجيل الجديد",
    tone:"بدوية شابة، گاف + سوشيال مدموج",
    keys:["گلت لها","يا بنت","ستوري","گاعدة أتابع","بس برضو"] },
  // النسائي + النفسي
  { id:"sara", name:"سارة", emoji:"📰", group:"إعلام", dim:"المرأة/الإعلام",
    tone:"صحفية، فصحى إعلامية + وعي نسوي",
    keys:["الرسالة المرسلة","الصورة النمطية","المسؤولية المجتمعية"] },
  { id:"mona", name:"د. منى", emoji:"🧠", group:"نفسي", dim:"التأثير النفسي",
    tone:"نفسية، عامية مثقفة هادئة",
    keys:["نفسياً هذا يدل","الدافع وراء","التقدير الذاتي","القلق"] },
  // المقيمون العرب
  { id:"rami", name:"رامي", emoji:"🎨", group:"مقيم", dim:"الذوق البصري",
    tone:"لبناني، ممدود + مزج فرنسي خفيف + جُمل أطول",
    keys:["شو هالفكرة","هيدا حلو كتيـر","عنجد؟","عال","ça va"] },
  { id:"abuammar", name:"أبو عمار", emoji:"🍲", group:"مقيم", dim:"الطبقة الشغّيلة",
    tone:"سوري، شامي مباشر قصير بلا مزج أجنبي",
    keys:["شو يا معلّم","تكرم عينك","طيّب","ماشي الحال","أي والله"] },
  // التنوع الديني
  { id:"george", name:"جورج", emoji:"✝️", group:"تنوّع", dim:"التنوّع الديني",
    tone:"مسيحي، عربي محترم، التمايز بالزاوية لا اللهجة",
    keys:["من زاوية غير المسلمين","التنوّع قيمة","بكل احترام"] },
  // الخليجي + الأجنبي + النخبة
  { id:"abdulrahman", name:"عبدالرحمن", emoji:"🇸🇦", group:"خليجي", dim:"السوق الخليجي",
    tone:"سعودي حضري معاصر، گاف خفيفة محدودة",
    keys:["كذا الوضع","الحين","أبشر","وش رايك","تمام كذا"] },
  { id:"james", name:"James", emoji:"🌍", group:"عالمي", dim:"البُعد العالمي",
    tone:"بريطاني تحليلي → يُترجم بفصحى مختصرة",
    keys:["من منظور عالمي","قد يُساء فهمه دولياً","الصورة الخارجية"] },
  { id:"bunasser", name:"بو ناصر (الدون)", emoji:"🎩", group:"نخبة", dim:"المكانة والهيبة",
    tone:"وجيه مهيب، جُمل قليلة رصينة موزونة",
    keys:["الوقار","المقام","ما يليق بمثله","عيب على مثله"] },
  // أرشيتايبات الطيف (الجانب الناقص)
  { id:"toxicfan", name:"المطبّل السام", emoji:"🔥", group:"طيف", dim:"المجاملة الخطرة", dark:true,
    tone:"يأيّد كل شي بحماس أعمى",
    keys:["انشرها لا تحذف","أسطورة","خلّهم يحترقون","وش فيها"] },
  { id:"troll", name:"المتصيّد", emoji:"👹", group:"طيف", dim:"العداء المنظّم", dark:true,
    tone:"يهاجم للتسلية يدوّر نقطة ضعف",
    keys:["هع","مدري ليش","شكله","تفلسف"] },
  { id:"reckless", name:"المتهوّر", emoji:"⚡", group:"طيف", dim:"الإغراء بالتصعيد", dark:true,
    tone:"يدفع للمخاطرة",
    keys:["خشها أقوى","لا تخاف","صعّدها","سوّي اللي يحرقهم"] },
  { id:"provocateur", name:"المستفزّ", emoji:"🎭", group:"طيف", dim:"الاستفزاز الساخر", dark:true,
    tone:"يتريّق على الجدّية — يُصوَّر موقفه بلا إنتاج إساءة",
    keys:["عقدتوها","ليش الجدّية","فضّيتوها"] },
  { id:"opportunist", name:"الانتهازي", emoji:"🦊", group:"طيف", dim:"استغلال الزلّة", dark:true,
    tone:"يركب على غلطتك",
    keys:["نستفيد","فرصة","نركب الموجة"] },
  { id:"religanger", name:"شريحة الغضب الديني", emoji:"🚨", group:"طيف", dim:"انفجار الحساسية", dark:true,
    tone:"ردة فعل متوقّعة — تُصوَّر لا تُنتَج إساءة",
    keys:["شريحة بتنفجر","بتشوفها مساس","استفزاز للمشاعر"] }
];

/* كلمات مفتاحية تشغّل أبعاد الرادار (مبسّطة للبرهان) */
const TRIGGERS = {
  legal:   ["اسم","فلان","تشهير","سرقة","فضيحة","شتم"],
  religion:["دين","صلاة","محرم","عاشوراء","الله","حلال","حرام","رقص","خمر"],
  sect:    ["سني","شيعي","حسيني","مذهب","طائفة"],
  reputation:["استعراض","فلوس","فلوسي","سيارة","سيارتي","تفاخر","فشخرة","بنات","بيكيني","قدام الناس","شراتها","ثروة","كاش","ماركات"],
  women:   ["بنت","مرأة","نساء","حريم","طلاق"],
  timing:  ["محرم","عاشوراء","رمضان","عيد","عزاء"]
};

function scanRadar(text){
  const t = text || "";
  const countHits = (arr)=>arr.filter(w=>t.includes(w)).length;
  const dims = {
    legal: countHits(TRIGGERS.legal),
    religion: countHits(TRIGGERS.religion),
    sect: countHits(TRIGGERS.sect),
    reputation: countHits(TRIGGERS.reputation),
    women: countHits(TRIGGERS.women),
    timing: countHits(TRIGGERS.timing)
  };
  // نرجّع شكلين: منطقي (boolean) للتوافق + شدّة (count) للذكاء
  return {
    legal: dims.legal>0, religion: dims.religion>0, sect: dims.sect>0,
    reputation: dims.reputation>0, women: dims.women>0, timing: dims.timing>0,
    _intensity: dims
  };
}

/* توليد ردّ تمثيلي لكل شخصية (mock ذكي يتفاعل مع الشدّة). الإنتاج = LLM */
function reactionFor(p, radar, text){
  const I = radar._intensity || {};
  const strong = (dim)=> (I[dim]||0) >= 2; // إشارة قوية = كلمتين+
  const R = {
    sultan: radar.reputation ? "صراحة بيفايرل، بس نص التعليقات بتكون ضدّك — الترند سيف ذو حدّين."
                              : "محتوى عادي، مدري بيطلّع ترند ولا يموت بصمت. يبي هوك أقوى بأول ٣ ثواني.",
    omfahad: radar.reputation ? "عيب يمّه، يخزي العين عليك. الناس بتحسد والسمعة تخصّ أهلك كلهم."
                              : "ما شاء الله، شي طيّب وما فيه اللي يعيب — انشره وأنت مطمئن.",
    bukhaled: radar.reputation ? "تجارياً يلفت نظر بس يضرّ صورتك على المدى الطويل — السمعة رأس مال."
                               : "ماكو ضرر تجاري، ممكن يفيد البراند لو ربطته بقيمة.",
    noura: radar.legal ? "قانونياً فيه شبهة تشهير لو ذُكر اسم صريح — يعرّضك للمساءلة بقانون ٦٣/٢٠١٥."
                       : "قانونياً ما أشوف مخالفة واضحة، بس راجع الآداب العامة بالصياغة.",
    faisal: radar.reputation||radar.religion||radar.legal
              ? "هع، خوش بطل. عاد صدّقنا — الفكرة فيها ثغرة تنقري غلط من أول نظرة."
              : "عادي يعني… ولا شي يستاهل. ممكن أحسن بشوي.",
    jasim: "عادي مو شي. أغلب الناس بيمرّون عليه بلا ما يوقفون، الله أعلم.",
    hussain: (radar.sect||radar.religion)
              ? (strong("sect")||strong("religion")
                  ? "بصراحة هذا يمسّ شريحة كبيرة بشكل مباشر — أتوقّع ردة فعل قوية، راجعه زين قبل."
                  : "فيه حساسية بسيطة هنا — فيه شريحة ما تشوفها مثلك، خلّنا نراعي الصياغة.")
              : "ما أشوف فيه شي يمسّ أحد، طبيعي.",
    sheikh: radar.religion
              ? (strong("religion")||radar.timing
                  ? "هذا لا يجوز بهالشكل، اتّقِ الله؛ والتوقيت يزيد الأمر حساسية — الأصل مراعاة الحُرمة."
                  : "فيه ملاحظة شرعية بالصياغة، راجِع الأصل وراعِ الاحتشام.")
              : "ما فيه محذور شرعي ظاهر، والنية الطيبة مطلوبة.",
    mtaab: radar.reputation||radar.women ? "ما يمشي هذا عندنا گاعد، يمسّ العادات والعِرض — الديرة لها احترامها وگال الرجال كلمتهم."
                                         : "عادي، ما يخالف العادات. گال الرجال كلمتهم وخلاص.",
    haya: "گلت لها هالكلام بيتفاعل، بس برضو فيه ناس بتنتقد — يعتمد على ستوري التقديم.",
    sara: radar.women ? "فيه صورة نمطية للمرأة لازم ننتبه لها — الرسالة المرسلة أقوى من القصد."
                      : "إعلامياً مقبول، بس راعِ المسؤولية المجتمعية بالطرح.",
    mona: "نفسياً هذا يدلّ على رغبة بالتقدير. انتبه إنه ما يثير قلق أو يجرح أحد بشكل غير مقصود.",
    rami: "شو هالفكرة! هيدا حلو كتيـر من ناحية الإخراج، بس الألوان بدّها شغل — ça va بس مش عال بعد.",
    abuammar: "طيّب، شو يا معلّم — الناس البسيطة بتحبّه لو كان صادق. ماشي الحال بس بلا تكلّف.",
    george: "من زاوية غير المسلمين بالمجتمع، بكل احترام، ما فيه شي يخدش — التنوّع قيمة نحافظ عليها.",
    abdulrahman: radar.reputation ? "كذا الوضع بيلفت بالسعودية بس بصياغة أهدى عندنا. وش رايك تخفّف الاستعراض؟"
                                  : "الحين هذا ينفع للسوق الخليجي، أبشر — قريب من ذوقنا.",
    james: "From a global perspective → من منظور عالمي، لو انتشر برّا بلا سياق قد يُساء فهمه ويصير صورة نمطية.",
    bunasser: radar.reputation ? "هذا ما يليق بمثلك. الوقار يرفع المقام، والاستعراض يقلّله — عيب على مثلك."
                               : "كلام طيّب، يحفظ المقام. لا بأس.",
    toxicfan: "🔥 أسطورة! انشرها لا تحذف، خلّهم يحترقون — وش فيها؟ (تحذير: تصفيق خطر يغرّك)",
    troll: "هع، مدري ليش متحمّس — شكله كلّف عليه وطلع چذي. (هجوم للتسلية، توقّعه)",
    reckless: "خشها أقوى، لا تخاف! صعّدها وسوّي اللي يحرقهم — (إغراء بالتصعيد، خطر)",
    provocateur: radar.religion ? "عقدتوها، ليش الجدّية؟ فضّيتوها — (استفزاز ساخر متوقّع، يُصوَّر لا يُتبنّى)"
                                : "ليش كل هالجدّية؟ (نبرة استفزاز خفيفة)",
    opportunist: "فرصة نركب الموجة ونستفيد من غلطتك — (انتهازي، توقّع وجوده)",
    religanger: radar.religion||radar.sect||radar.timing ? "🚨 شريحة بتنفجر عليك وتشوفها مساس بالمشاعر — (ردة فعل متوقّعة، تحذير مبكر)"
                                                          : null
  };
  return R[p.id] || null;
}

/* اختيار الشخصيات ذات الصلة + الإلزاميين (فيصل + جاسم) */
function selectCast(radar){
  // أصوات أساسية تحضر دائماً: المعارض + الأغلبية الصامتة + الذوق البصري
  const always = ["faisal","jasim","rami"];
  const picked = new Set(always);
  // أبعاد ترفع شخصيات
  if(radar.reputation){ ["sultan","omfahad","bukhaled","bunasser","toxicfan"].forEach(x=>picked.add(x)); }
  if(radar.legal){ picked.add("noura"); picked.add("opportunist"); }
  if(radar.religion){ ["sheikh","hussain","provocateur","religanger"].forEach(x=>picked.add(x)); }
  if(radar.sect){ ["hussain","religanger"].forEach(x=>picked.add(x)); }
  if(radar.women){ ["sara","mona","mtaab","haya"].forEach(x=>picked.add(x)); }
  if(radar.timing){ ["sheikh","religanger","hussain"].forEach(x=>picked.add(x)); }
  // صوت الطبقة الشغّيلة + الجيل الجديد يحضرون مع المحتوى الاجتماعي/السمعة
  if(radar.reputation||radar.women){ ["abuammar","haya"].forEach(x=>picked.add(x)); }
  // ضمان وجود مؤيد وموازِن دائماً
  picked.add("abdulrahman"); picked.add("george");
  // ضمان مطبّل واحد لو فيه أي خطر
  if(radar.reputation||radar.legal||radar.religion) picked.add("toxicfan");
  return PERSONAS.filter(p=>picked.has(p.id));
}

/* حساب المؤشّرين والحكم */
function computeVerdict(radar, split){
  let riskPoints =
    (radar.legal?35:0) + (radar.religion?25:0) + (radar.sect?20:0) +
    (radar.timing?20:0) + (radar.reputation?22:0) + (radar.women?12:0);

  // تصعيد التراكب: لما تجتمع أبعاد حسّاسة، الخطر يقفز (مو يُجمع خطّياً بس)
  if(radar.religion && radar.timing) riskPoints += 15;   // دين + توقيت حسّاس (محرم/عاشوراء)
  if(radar.religion && radar.sect)   riskPoints += 15;   // دين + مذهب = برميل بارود
  if(radar.legal && radar.reputation) riskPoints += 10;  // تشهير + استعراض

  let risk = Math.min(95, riskPoints);
  // الحكم يتأثّر بانقسام المجتمع: لو الناقد كثير، الخطر يرتفع منطقياً
  if(split && split.crit>=30) risk = Math.max(risk, 28);
  if(split && split.crit>=45) risk = Math.max(risk, 50);
  // فيرال تقديري (الجدل يرفع الانتشار أحياناً)
  const viral = Math.min(10, 5 + (radar.reputation?2:0) + (radar.religion?1:0) + (radar.timing?1:0));
  const safety = Math.max(1, 10 - Math.round(risk/10));
  let verdict, color, conf;
  if(risk>=55){ verdict="خطر 🔴"; color="#C0392B"; }
  else if(risk>=25){ verdict="عدّل 🟡"; color="#BA7517"; }
  else { verdict="انشر ✅"; color="#1D9E75"; }
  conf = (radar.legal||radar.religion) ? "متوسطة" : "عالية";
  return { risk, viral, safety, verdict, color, conf };
}

/* انقسام المجتمع التقديري */
function societySplit(radar){
  let crit = 20 + (radar.religion?20:0)+(radar.legal?15:0)+(radar.reputation?15:0)+(radar.timing?10:0);
  crit = Math.min(70, crit);
  const neu = 20;
  const sup = Math.max(10, 100 - crit - neu);
  return { crit, neu, sup };
}

/* اقتراح تعديل واحد فوري (mock) */
function editSuggestion(radar){
  if(radar.timing) return "نفس الفكرة، بس انشرها بعد انتهاء المناسبة (التوقيت هو المشكلة مو الفكرة).";
  if(radar.religion) return "خفّف الزاوية الدينية الحسّاسة أو أضف سياق احترام واضح.";
  if(radar.legal) return "احذف أي اسم صريح أو تلميح يعرّفك بشخص — تجنّب شبهة التشهير.";
  if(radar.reputation) return "حوّل الاستعراض لقصة (تعبت سنين وهذي ثمرتها) بدل التفاخر المباشر.";
  if(radar.women) return "أعد صياغة الإشارة للمرأة لتجنّب الصورة النمطية.";
  return "المحتوى قوي — حسّن الهوك بأول ٣ ثواني عشان يمسك الانتباه.";
}

/* الدالّة الرئيسية: تأخذ نص المحتوى وترجّع تقرير ناقشنا كامل */
function generate(text){
  const clean = (text||"").trim();
  // حارس المدخل: لو ما فيه محتوى كافٍ، ما نعطي حكماً مضلّلاً
  if(clean.length < 3){
    return {
      insufficient: true,
      message: "اكتب محتوى أوضح عشان ناقشنا يقدرون يتشاورون — كلمة أو كلمتين ما تكفي.",
      radar:{legal:false,religion:false,sect:false,reputation:false,women:false,timing:false},
      reactions:[], viral:0, safety:0, risk:0,
      verdict:"—", color:"#9C9488", confidence:"—",
      split:{crit:0,neu:0,sup:0}, edit:""
    };
  }
  const radar = scanRadar(clean);
  const cast = selectCast(radar);
  const reactions = cast
    .map(p=>({ persona:p, text:reactionFor(p, radar, clean) }))
    .filter(r=>r.text);
  const split = societySplit(radar);
  const v = computeVerdict(radar, split);
  return {
    radar, reactions,
    viral:v.viral, safety:v.safety, risk:v.risk,
    verdict:v.verdict, color:v.color, confidence:v.conf,
    split, edit: editSuggestion(radar)
  };
}

if (typeof module !== "undefined" && module.exports){
  module.exports = { PERSONAS, generate, scanRadar };
}

// جسر المتصفّح: نعرّض المحرّك على window عشان الموقع الكامل يوصله
if (typeof window !== "undefined"){
  window.DiwaniyaEngine = { PERSONAS, generate, scanRadar };
}
