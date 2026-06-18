/* ============================================================
   الديوانية — موقع كامل بصيغة JavaScript (app.js)
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
    { n:"٢", t:"الديوانية تتشاور", d:"٢٤ شخصية تتفاعل لايف" },
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
      el("div",{class:"dw-logo"}, "الديوانية ", el("span",{class:"dw-shield"},"🛡️")),
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
      el("button",{class:"dw-cta-lg", onClick:()=>scrollToApp()},"جرّب الديوانية مجاناً"),
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
      el("h2",{class:"dw-sec-title"},"كيف تشتغل الديوانية"),
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
      el("h2",{class:"dw-sec-title"},"ليش الديوانية"),
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

    const btn = el("button",{class:"dw-run", onClick:()=>runAnalysis(ta.value, result)},"اعرض على الديوانية");

    return el("section",{id:"app", class:"dw-app"},
      el("h2",{class:"dw-sec-title"},"جرّبها الآن"),
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

    // شاشة التشاور
    container.innerHTML = "";
    container.appendChild(el("div",{class:"dw-thinking"},
      el("div",{class:"dw-think-text"},"الديوانية تتشاور…"),
      el("div",{class:"dw-dots"}, el("span",{class:"dw-dot"}), el("span",{class:"dw-dot"}), el("span",{class:"dw-dot"}))
    ));
    container.scrollIntoView({behavior:"smooth", block:"center"});

    setTimeout(()=>{
      const r = engine.generate(text);
      renderResult(r, container);
    }, 1400);
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

    // أصوات الديوانية
    container.appendChild(el("div",{class:"dw-voices-title"},"أصوات الديوانية"));
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
    container.appendChild(el("div",{class:"dw-conf"}, "مستوى ثقة الديوانية بهالتوقّع: "+r.confidence));
  }

  // ===== الفوتر =====
  function buildFooter(){
    return el("footer",{class:"dw-footer"},
      el("div",{class:"dw-footer-logo"},"الديوانية 🛡️"),
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
    root.appendChild(buildHero());
    root.appendChild(buildHow());
    root.appendChild(buildFeatures());
    root.appendChild(buildApp());
    root.appendChild(buildFooter());
  }

  // تشغيل بعد تحميل الصفحة
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", buildSite);
  } else { buildSite(); }

})();
