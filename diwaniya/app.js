/* ============================================================
   ناقشنا — موقع كامل بصيغة JavaScript (app.js)
   ------------------------------------------------------------
   ملف واحد يبني الموقع كامل: صفحة هبوط + تطبيق التوقّع.
   يشتغل مع index-full.html (الموجود بنفس المجلّد).

   كيف تشغّله بكلاود كود:
     1) ضعه بنفس مجلّد engine.js و index-full.html
     2) python3 -m http.server 8000
     3) افتح http://localhost:8000/index-full.html

   البنية:
     - يستورد المحرّك (engine.js) عبر window.DiwaniyaEngine
     - يبني: الهيدر، صفحة الهبوط، التطبيق، الفوتر
     - كله ديناميكي من JS — سهل التوسعة
   ============================================================ */

(function(){
  "use strict";

  // ===== الهوية البصرية =====
  const BRAND = {
    teal:"#0E6B54", dteal:"#0A4537", gold:"#B8862F", sand:"#F3EEE3",
    char:"#2E2A24", white:"#FFFFFF", safe:"#1D9E75", warn:"#BA7517",
    danger:"#C0392B", mute:"#897F6E", line:"#E2DACB", card:"#FFFFFF"
  };

  // ===== محتوى صفحة الهبوط =====
  const FEATURES = [
    { icon:"🛡️", title:"رادار ردة الفعل", desc:"يحذّرك من الأزمة قبل وقوعها — قانونياً، دينياً، اجتماعياً." },
    { icon:"👥", title:"٢٤ شخصية حقيقية", desc:"مجتمع خليجي مصغّر يتفاعل مع محتواك بلهجات دقيقة." },
    { icon:"⚡", title:"حكم واضح بثانية", desc:"انشر / عدّل / خطر — مع تعديل واحد يرفع فرصتك." },
    { icon:"🔁", title:"يتعلّم ويتطوّر", desc:"كل توقّع يحسّن دقّة المحرّك تلقائياً." }
  ];

  const STEPS = [
    { n:"١", t:"اكتب محتواك", d:"فكرة، تغريدة، سكربت فيديو" },
    { n:"٢", t:"ناقشنا يتشاورون", d:"٢٤ شخصية تتفاعل لايف" },
    { n:"٣", t:"حكم + تعديل", d:"تعرف ردة الفعل قبل النشر" }
  ];

  // ===== أدوات بناء DOM =====
  function el(tag, attrs, ...kids){
    const e = document.createElement(tag);
    if(attrs) Object.entries(attrs).forEach(([k,v])=>{
      if(k==="style" && typeof v==="object") Object.assign(e.style, v);
      else if(k==="class") e.className = v;
      else if(k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    kids.flat().forEach(k=> e.appendChild(typeof k==="string"?document.createTextNode(k):k));
    return e;
  }

  // ===== الهيدر =====
  function buildHeader(){
    return el("header",{class:"dw-header"},
      el("div",{class:"dw-logo"}, "ناقشنا ", el("span",{class:"dw-shield"},"🛡️")),
      el("nav",{class:"dw-nav"},
        el("a",{href:"#how", class:"dw-navlink"},"كيف تشتغل"),
        el("a",{href:"#features", class:"dw-navlink"},"المميّزات"),
        el("button",{class:"dw-cta-sm", onClick:()=>scrollToApp()},"جرّبها الآن")
      )
    );
  }

  // ===== صفحة الهبوط =====
  function buildHero(){
    return el("section",{class:"dw-hero"},
      el("div",{class:"dw-hero-badge"},"🇰🇼 صناعة كويتية"),
      el("h1",{class:"dw-hero-title"},"اعرف ردة فعل جمهورك", el("br"), "قبل لا تنشر"),
      el("p",{class:"dw-hero-sub"},"أول منصة عربية تتوقّع نجاح المحتوى وتحذّر من أزماته. تدخل محتواك، يتفاعل معه مجتمع خليجي مُحاكى، وتطلع لك ردة الفعل المتوقّعة — كل هذا قبل النشر."),
      el("button",{class:"dw-cta-lg", onClick:()=>scrollToApp()},"جرّب ناقشنا مجاناً"),
      el("p",{class:"dw-hero-note"},"«ما نوقفك… نخلّيك أذكى»")
    );
  }

  function buildHow(){
    const cards = STEPS.map((s,i)=>
      el("div",{class:"dw-step"},
        el("div",{class:"dw-step-num"}, s.n),
        el("div",{class:"dw-step-title"}, s.t),
        el("div",{class:"dw-step-desc"}, s.d)
      )
    );
    return el("section",{id:"how", class:"dw-section"},
      el("h2",{class:"dw-sec-title"},"كيف يشتغل ناقشنا"),
      el("div",{class:"dw-steps"}, ...cards)
    );
  }

  function buildFeatures(){
    const cards = FEATURES.map(f=>
      el("div",{class:"dw-feature"},
        el("div",{class:"dw-feature-icon"}, f.icon),
        el("div",{class:"dw-feature-title"}, f.title),
        el("div",{class:"dw-feature-desc"}, f.desc)
      )
    );
    return el("section",{id:"features", class:"dw-section dw-section-alt"},
      el("h2",{class:"dw-sec-title"},"ليش ناقشنا"),
      el("div",{class:"dw-features"}, ...cards)
    );
  }

  // ===== التطبيق =====
  function buildApp(){
    const ta = el("textarea",{class:"dw-input", id:"dwContent",
      placeholder:"اكتب محتواك هنا… (فكرة بوست، تغريدة، سكربت فيديو)"});
    const examples = [
      "شوفوا سيارتي الجديدة شراتها بفلوسي قدام الناس",
      "فيديو رقص وخمر في شهر محرم",
      "نصيحة عن تنظيم الوقت بالمذاكرة"
    ];
    const chips = examples.map(ex=>
      el("span",{class:"dw-chip", onClick:()=>{ta.value=ex;}}, ex)
    );
    const result = el("div",{class:"dw-result", id:"dwResult"});

    const btn = el("button",{class:"dw-run", onClick:()=>runAnalysis(ta.value, result)},"اعرض على ناقشنا");

    // مشهد الفريج الحيّ (يُركّب عبر window.Freej)
    const scene = el("div",{id:"dwFreej"});
    if(window.Freej && window.Freej.mount){ window.Freej.mount(scene); }

    return el("section",{id:"app", class:"dw-app"},
      el("h2",{class:"dw-sec-title"},"ناقشنا — شوف الفريج يتفاعل"),
      scene,
      el("div",{class:"dw-app-card"},
        ta,
        el("div",{class:"dw-chips"}, ...chips),
        btn
      ),
      result
    );
  }

  // ===== تشغيل التحليل =====
  function runAnalysis(text, container){
    const engine = window.DiwaniyaEngine;
    if(!engine){ container.innerHTML = "<p style='color:"+BRAND.danger+"'>المحرّك ما تحمّل. تأكّد إن engine.js موجود.</p>"; return; }
    if(!text || !text.trim()){ container.innerHTML = "<p style='color:"+BRAND.warn+"'>اكتب محتوى أول 🙂</p>"; return; }

    // المرحلة ١: الفريج يتجمّع فوراً (قبل وصول الـAPI) حسب الرادار المحلي
    const freej = window.Freej;
    if(freej && engine.scanRadar){
      const dwFreej = document.getElementById("dwFreej");
      if(dwFreej) dwFreej.scrollIntoView({behavior:"smooth", block:"center"});
      freej.summon(engine.scanRadar(text));
    }

    // شاشة التشاور (التفاصيل الكاملة تنزل تحت المشهد)
    container.innerHTML = "";
    container.appendChild(el("div",{class:"dw-thinking"},
      el("div",{class:"dw-think-text"},"ناقشنا يتشاورون…"),
      el("div",{class:"dw-dots"}, el("span",{class:"dw-dot"}), el("span",{class:"dw-dot"}), el("span",{class:"dw-dot"}))
    ));

    // نحاول العقل الحقيقي (Claude عبر /api/generate)، وإذا فشل نرجع للمحاكي
    const started = Date.now();
    const finish = (r)=>{
      const wait = Math.max(0, 900 - (Date.now()-started)); // نخلّي شاشة التشاور تبان
      setTimeout(()=>{
        renderResult(r, container);                 // عرض مبدئي (قبل النقاش)
        if(freej && freej.react){
          // المشهد يشغّل النقاش الحيّ، وعند انتهائه يرجّع حكماً متأثّراً بالنقاش
          freej.react(r, function(adjusted){ if(adjusted) renderResult(adjusted, container); });
        }
      }, wait);
    };

    fetch("/api/generate", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ text })
    })
    .then(res => res.ok ? res.json() : Promise.reject(new Error("api "+res.status)))
    .then(r => {
      if(!r || (r.error)) throw new Error(r && r.error || "empty");
      finish(r);
    })
    .catch(err => {
      console.warn("ناقشنا: رجعنا للمحاكي القواعدي —", err.message);
      finish(engine.generate(text));
    });
  }

  // ===== عرض النتيجة =====
  function renderResult(r, container){
    container.innerHTML = "";

    // حالة المدخل غير الكافي
    if(r.insufficient){
      container.appendChild(el("div",{class:"dw-verdict", style:{background:BRAND.mute}},
        el("div",{class:"dw-verdict-v", style:{fontSize:"18px"}},"✍️ محتاج محتوى أوضح"),
        el("div",{class:"dw-verdict-r"}, r.message)
      ));
      return;
    }

    // الحكم
    container.appendChild(el("div",{class:"dw-verdict", style:{background:r.color}},
      el("div",{class:"dw-verdict-v"}, r.verdict),
      el("div",{class:"dw-verdict-r"}, "احتمال الأزمة: "+r.risk+"%")
    ));

    // أثر النقاش الحيّ على الحكم (إن وُجد)
    if(r.debate){
      container.appendChild(el("div",{style:{textAlign:"center", fontSize:"12px",
        color:BRAND.mute, margin:"-4px 0 14px"}},
        "بدأ "+r.debate.before+"٪ ← بعد نقاش الفريج "+r.debate.after+"٪ · "+r.debate.reason));
    }

    // المؤشّران
    const safeColor = r.safety>=7?BRAND.safe : r.safety>=4?BRAND.warn : BRAND.danger;
    container.appendChild(el("div",{class:"dw-dials"},
      el("div",{class:"dw-dial"},
        el("div",{class:"dw-dial-lbl"},"🔥 فيرال متوقّع"),
        el("div",{class:"dw-dial-num", style:{color:BRAND.teal}}, r.viral+"/10")
      ),
      el("div",{class:"dw-dial"},
        el("div",{class:"dw-dial-lbl"},"🛡️ أمان ثقافي"),
        el("div",{class:"dw-dial-num", style:{color:safeColor}}, r.safety+"/10")
      )
    ));

    // انقسام المجتمع
    const bar = el("div",{class:"dw-split"});
    bar.appendChild(el("div",{style:{width:r.split.crit+"%", background:BRAND.danger}}, r.split.crit+"%"));
    bar.appendChild(el("div",{style:{width:r.split.neu+"%", background:"#9C9488"}}, r.split.neu+"%"));
    bar.appendChild(el("div",{style:{width:r.split.sup+"%", background:BRAND.safe}}, r.split.sup+"%"));
    container.appendChild(bar);
    container.appendChild(el("div",{class:"dw-split-lbl"},
      "ناقد "+r.split.crit+"% · محايد "+r.split.neu+"% · مؤيد "+r.split.sup+"%"));

    // رادار الأبعاد
    const radarNames = {legal:"⚖️ قانوني", religion:"🕌 ديني", sect:"☪️ مذهبي",
      reputation:"💸 سمعة", women:"👥 اجتماعي", timing:"⏰ توقيت"};
    const fired = Object.keys(radarNames).filter(k=>r.radar[k]);
    const radarRow = el("div",{class:"dw-radar"});
    if(fired.length){
      fired.forEach(k=> radarRow.appendChild(el("span",{class:"dw-radar-chip dw-radar-on"}, radarNames[k])));
    } else {
      radarRow.appendChild(el("span",{class:"dw-radar-chip dw-radar-off"},"🛡️ ما اشتعل أي بُعد خطر"));
    }
    container.appendChild(radarRow);

    // تحليل النقاش (منو أثّر على منو ومنو غيّر رأيه)
    if(r.analysis){ renderAnalysis(r.analysis, container); }

    // أصوات ناقشنا
    container.appendChild(el("div",{class:"dw-voices-title"},"أصوات ناقشنا"));
    const voices = el("div",{class:"dw-voices"});
    r.reactions.forEach(x=>{
      voices.appendChild(el("div",{class:"dw-voice"},
        el("div",{class:"dw-voice-top"},
          el("span",{class:"dw-voice-em"}, x.persona.emoji),
          el("span",{class:"dw-voice-nm"}, x.persona.name),
          el("span",{class:"dw-voice-dm"+(x.persona.dark?" dark":"")}, x.persona.dim)
        ),
        el("div",{class:"dw-voice-tx"}, x.text)
      ));
    });
    container.appendChild(voices);

    // التعديل المقترح
    container.appendChild(el("div",{class:"dw-edit"},
      el("div",{class:"dw-edit-h"},"✏️ تعديل مقترح واحد"),
      el("div",{class:"dw-edit-t"}, r.edit)
    ));

    // الثقة
    container.appendChild(el("div",{class:"dw-conf"}, "مستوى ثقة ناقشنا بهالتوقّع: "+r.confidence));
  }

  // ===== لوحة تحليل النقاش =====
  function renderAnalysis(an, container){
    const panel = el("div",{class:"dw-analysis"});
    panel.appendChild(el("div",{class:"dw-an-h"},"🔎 تحليل النقاش"));

    // استنتاج عام (يُثرى بالذكاء الاصطناعي إن توفّر «المفتاح»)
    const sum = el("div",{class:"dw-an-sum"}, an.summary && an.summary.overall || "");
    panel.appendChild(sum);

    // منو تواجه منو
    if(an.pairs && an.pairs.length){
      panel.appendChild(el("div",{class:"dw-an-sub"},"منو تواجه منو"));
      const pw = el("div",{class:"dw-an-pairs"});
      an.pairs.forEach(pr=> pw.appendChild(el("span",{class:"dw-an-pair"}, pr.join(" ↔ "))));
      panel.appendChild(pw);
    }

    // وش صار لكل واحد
    panel.appendChild(el("div",{class:"dw-an-sub"},"وش صار لكل واحد"));
    const list = el("div",{class:"dw-an-people"});
    (an.people||[]).forEach(pp=>{
      list.appendChild(el("div",{class:"dw-an-person"+(pp.changed?(" "+pp.direction):"")},
        el("span",{class:"dw-an-em"}, pp.emoji),
        el("div",{class:"dw-an-body"},
          el("span",{class:"dw-an-nm"}, pp.name),
          el("span",{class:"dw-an-line"}, pp.line)
        )
      ));
    });
    panel.appendChild(list);
    container.appendChild(panel);

    // إثراء السرد بالذكاء الاصطناعي (اختياري — يرجع للمحلي لو ما فيه مفتاح)
    fetch("/api/debate-narrate", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ analysis: an })
    })
    .then(x=> x.ok ? x.json() : Promise.reject(new Error("n/a")))
    .then(j=>{ if(j && j.text){ sum.textContent = j.text; sum.classList.add("ai"); } })
    .catch(()=>{});
  }

  // ===== المستشار الشخصي (الصفحة الرئيسية الجديدة) =====
  let _prefCat = null;

  function buildAdvisor(){
    const Q = window.DiwaniyaQuestions;
    const cats = el("div",{class:"av-cats"});
    (Q ? Q.CATEGORIES : []).forEach(c=>{
      cats.appendChild(el("div",{class:"av-cat", "data-cat":c.key, onClick:()=>selectCat(c.key)},
        el("span",{class:"av-cat-em"}, c.emoji), c.label));
    });
    const side = el("aside",{class:"av-side"},
      el("div",{class:"av-side-h"},"الأقسام"),
      cats,
      el("div",{class:"av-side-tools"},
        el("button",{class:"av-tool-btn", onClick:()=>scrollToApp()},"🛠️ أدوات: شوف الفريج يتفاعل"))
    );
    const main = el("div",{class:"av-main"}, el("div",{id:"avAsk"}), el("div",{id:"avProfile"}));
    const wrap = el("section",{id:"advisor", class:"av-wrap"}, side, main);
    setTimeout(()=>{ renderAsk(); refreshProfile(); }, 0);
    return wrap;
  }

  function selectCat(key){
    _prefCat = (_prefCat===key) ? null : key;
    document.querySelectorAll(".av-cat").forEach(n=>
      n.classList.toggle("active", n.getAttribute("data-cat")===_prefCat));
    renderAsk();
  }

  function renderAsk(){
    const P = window.Profile, Q = window.DiwaniyaQuestions;
    const host = document.getElementById("avAsk");
    if(!host || !P) return;
    let q = P.nextQuestion();
    if(_prefCat && Q){
      const answered = new Set(P.get().answers.map(a=>a.qid));
      const inCat = Q.QUESTIONS.filter(x=>x.cat===_prefCat && !answered.has(x.qid));
      const pool = inCat.length ? inCat : Q.QUESTIONS.filter(x=>x.cat===_prefCat);
      if(pool.length) q = pool[Math.floor(Math.random()*pool.length)];
    }
    host.innerHTML = "";
    if(!q){ host.appendChild(el("div",{class:"av-ask"},
      el("div",{class:"av-ask-q"},"خلّصت أسئلة اليوم 🌙 ارجع بكرة ونكمّل.")));
      return; }
    const card = el("div",{class:"av-ask"});
    card.appendChild(el("div",{class:"av-ask-kicker"},"سؤال اليوم · يبني ملفك الخاص"));
    card.appendChild(el("div",{class:"av-ask-q"}, q.text));
    if(q.kind==="chips" && q.chips){
      const chips = el("div",{class:"av-chips"});
      q.chips.forEach(c=> chips.appendChild(
        el("span",{class:"av-chip", onClick:()=>handleAnswer(q, c)}, c)));
      card.appendChild(chips);
    }
    const inp = el("input",{class:"av-ask-input", placeholder:"أو اكتب جوابك بكلماتك…"});
    const send = el("button",{class:"av-ask-send",
      onClick:()=>{ if(inp.value.trim()) handleAnswer(q, inp.value); }},"إرسال");
    inp.addEventListener("keydown",(e)=>{ if(e.key==="Enter" && inp.value.trim()) handleAnswer(q, inp.value); });
    card.appendChild(el("div",{class:"av-ask-free"}, inp, send));
    card.appendChild(el("button",{class:"av-ask-skip", onClick:()=>renderAsk()},"سؤال ثاني ↻"));
    host.appendChild(card);
  }

  function handleAnswer(q, a){
    if(!window.Profile) return;
    window.Profile.addAnswer(q.qid, q.text, a);
    renderAsk();
    refreshProfile();
  }

  function renderInsightsInto(host, ins){
    if(ins.summary) host.appendChild(el("div",{class:"av-pf-sum"}, ins.summary));
    (ins.traits||[]).forEach(t=>{
      host.appendChild(el("div",{class:"av-trait"},
        el("div",{class:"av-trait-top"}, el("span",{}, t.label), el("span",{}, (t.strength||0)+"%")),
        el("div",{class:"av-trait-bar"}, el("div",{class:"av-trait-fill", style:{width:(t.strength||0)+"%"}}))
      ));
    });
    if(ins.tips && ins.tips.length){
      const tips = el("div",{class:"av-tips"}, el("div",{class:"av-tips-h"},"💡 نصايح تناسبك"));
      ins.tips.forEach(t=> tips.appendChild(
        el("div",{class:"av-tip"}, el("span",{class:"av-tip-em"},"◆"), t)));
      host.appendChild(tips);
    }
  }

  function refreshProfile(){
    const P = window.Profile;
    const host = document.getElementById("avProfile");
    if(!host || !P) return;
    const p = P.get();
    host.innerHTML = "";
    const card = el("div",{class:"av-profile"});
    card.appendChild(el("div",{class:"av-pf-top"},
      el("div",{class:"av-pf-h"},"🧠 ملفّك الشخصي"),
      el("div",{class:"av-pf-lock"},"🔒 خاص — لا يُنشر")
    ));
    if(p.answers.length){
      card.appendChild(el("div",{class:"av-pf-streak"},
        "🔥 "+p.streak+" يوم · "+p.answers.length+" إجابة"));
    }
    const body = el("div",{id:"avPfBody"});
    if(!p.answers.length){
      body.appendChild(el("div",{class:"av-pf-empty"},
        "جاوب على سؤال اليوم وراح أبدأ أكوّن صورة عنك 👀"));
    } else {
      renderInsightsInto(body, P.localInsights());
      if(p.answers.length>=2){
        body.appendChild(el("div",{class:"av-loading", id:"avLoad"},"المستشار يحلّل نمطك بدقّة أعلى…"));
      }
    }
    card.appendChild(body);
    if(p.answers.length){
      card.appendChild(el("button",{class:"av-pf-reset",
        onClick:()=>{ if(confirm("تصفّر ملفك الخاص نهائياً؟")){ P.reset(); renderAsk(); refreshProfile(); } }},
        "تصفير الملف"));
    }
    host.appendChild(card);
    if(p.answers.length>=2){
      P.insights().then(ins=>{
        const b = document.getElementById("avPfBody");
        if(b){ b.innerHTML=""; renderInsightsInto(b, ins); }
      });
    }
  }

  // ===== الفوتر =====
  function buildFooter(){
    return el("footer",{class:"dw-footer"},
      el("div",{class:"dw-footer-logo"},"ناقشنا 🛡️"),
      el("div",{class:"dw-footer-tag"},"اعرف ردة فعل جمهورك… قبل لا تنشر"),
      el("div",{class:"dw-footer-note"},"نموذج تجريبي — التوقّع احتمالي لا يقيني · صناعة كويتية 🇰🇼")
    );
  }

  // ===== مساعد: التمرير للتطبيق =====
  function scrollToApp(){
    const app = document.getElementById("app");
    if(app) app.scrollIntoView({behavior:"smooth"});
  }

  // ===== بناء الموقع كامل =====
  function buildSite(){
    const root = document.getElementById("dw-root");
    if(!root){ console.error("ما لقيت #dw-root"); return; }
    root.appendChild(buildHeader());
    root.appendChild(buildAdvisor());   // المستشار الشخصي = الرئيسية الجديدة
    root.appendChild(buildHero());
    root.appendChild(buildHow());
    root.appendChild(buildFeatures());
    root.appendChild(buildApp());       // أداة الفريج (تُفتح من زر الأدوات)
    root.appendChild(buildFooter());
  }

  // تشغيل بعد تحميل الصفحة
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", buildSite);
  } else { buildSite(); }

})();
