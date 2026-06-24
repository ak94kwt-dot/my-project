/* ============================================================
   ناقشنا (Naqishna) — ملخّص المشروع الكامل بصيغة JavaScript
   ------------------------------------------------------------
   ملف مرجعي واحد يقف لحاله. يلخّص كل شي: المنتج، الاسم، البنية،
   الملفات، التصميم، النقاش، الأمان، المعلّقات، والباكلوگ.
   آخر تحديث: 2026-06-24 · آخر commit: 77fdf71
   ============================================================ */

const NAQISHNA = {

  // ===== ١) المنتج =====
  product: {
    nameAr: "ناقشنا",
    nameEn: "Naqishna",
    formerName: "الديوانية",
    tagline: "اعرف ردة فعل جمهورك قبل لا تنشر",
    motto: "نصوّر النار، ما نشعلها",
    layers: [
      {
        key: "advisor",
        title: "المستشار الشخصي (الرئيسية)",
        what: "أسئلة يومية خفيفة → ملف خاص محلي غير قابل للنشر → أنماط شخصية + نصائح",
        goal: "رفيق يومي لا يُستغنى عنه (≥35% من الحياة الشخصية)"
      },
      {
        key: "freej",
        title: "الفريج الحيّ (أداة)",
        what: "خريطة فيها 24 شخصية تتناقش بوجوه/مشاعر، تتوقّع ردة فعل المجتمع قبل النشر",
        extra: "تحليل: منو أثّر على منو ومنو غيّر رأيه"
      }
    ]
  },

  // ===== ٢) الاسم — القرار النهائي (مُنجَز) =====
  name: {
    decision: "ناقشنا / Naqishna",
    status: "✅ تمّ تغييره فعلياً بالموقع والكود",
    domainAvailable: "naqishna.com (~$11)",
    rejected: {
      "ناقشني": "منصّة أردنية قديمة موجودة (naqeshni.com) — تعارض",
      "ChatMe": "مزدحم (تطبيقات مراسلة كثيرة)",
      "Freejna": "مأخوذ (تطبيقان)"
    },
    preserved: "اسم مبنى «الديوانية» داخل خريطة الفريج (مكان فيزيائي، مو اسم المنتج)",
    pending: "تأكيد علامة تجارية رسمي (وزارة التجارة الكويتية + GCC) — خارج نطاقي، يحتاج محامٍ"
  },

  // ===== ٣) النشر والبنية التحتية =====
  infra: {
    host: "Vercel (auto-deploy عند push على main)",
    liveUrl: "https://my-project-git-main-ak-s-pr.vercel.app",
    rootDirectory: "diwaniya",
    runtime: "static + 3 دوال سيرفرليس (nodejs)",
    vercelTeam: "team_BdMPEvXh1WlN3Ex1tGMrOWII (slug: ak-s-pr)",
    vercelProject: "prj_Ph0tvPg0oU6jwDitmAfYBxMbNm86",
    rateLimit: "lib/ratelimit.js — هجين (ذاكرة الآن، يترقّى لـUpstash) على كل /api/*",
    supabase: {
      project: "naqishna (ref umxhuuqsoygzcmpnliqb, eu-west-2, مجاني)",
      url: "https://umxhuuqsoygzcmpnliqb.supabase.co",
      table: "public.profiles + RLS (كل مستخدم صفّه فقط) — صفر تحذيرات أمنية",
      client: "db.js (window.Cloud) — مزامنة اختيارية، غير مُفعّلة حتى يبدّل المالك Anonymous sign-ins",
      docs: "docs/BACKEND.md + supabase/migrations/*.sql"
    },
    git: {
      devBranch: "claude/keen-noether-m3vjnl",
      deployBranch: "main",
      sync: "الفرعان متزامنان دائماً",
      lastCommit: "90791d0+"
    }
  },

  // ===== ٤) الملفات =====
  files: {
    "index.html":              "الصفحة الكاملة + كل الـCSS (تصميم نظيف + تأثيرات 3D)",
    "app.js":                  "يبني الموقع ديناميكياً: المستشار + النتائج + لوحة التحليل",
    "engine.js":               "المحرّك القواعدي (24 شخصية + رادار 6 أبعاد) — fallback",
    "questions.js":            "بنك الأسئلة الخفيفة (6 أقسام، بعيدة عن الحسّاس)",
    "profile.js":              "الملف الشخصي المحلي (localStorage) + حارس الخصوصية",
    "advisor.css":             "أنماط المستشار الشخصي",
    "freej.js":                "خريطة الفريج + النقاش + العدوى المزاجية + التحليل",
    "freej.css":               "أنماط مشهد الفريج (+ تأثيرات 3D)",
    "api/generate.js":         "سيرفرليس: توقّع ردة الفعل عبر Claude (+ fallback)",
    "api/profile-insights.js": "سيرفرليس: استخلاص أنماط الشخصية من الملف الخاص",
    "api/debate-narrate.js":   "سيرفرليس: سرد تحليل النقاش بأسلوب أحلى (اختياري)",
    "vercel.json":             "رؤوس الأمان (CSP، HSTS، nosniff...)",
    "docs/NOTES-5.md":         "ملف التسليم المرجعي النشط",
    "docs/PROJECT-SUMMARY.js": "هذا الملف (ملخّص كامل)"
  },

  // ===== ٥) التصميم =====
  design: {
    style: "نظيف فخم مستوحى من Resend (عمل أصلي لا نسخ)",
    palette: "أبيض/زنك + gradient تيل→ذهبي على الشعار",
    font: "Readex Pro للنص + JetBrains Mono للأرقام",
    buttons: "سوداء، بطاقات rounded، هيرو بتوهّج + شبكة",
    map: "خريطة احترافية بستايل Pam Pam (أرض كريمية + ساحة دوّارة + شوارع منقّطة + حدائق + ماء)، شخصيات دبابيس Pins بيضاء",
    effects3D: {
      tech: "CSS perspective + translateZ فقط (بدون مكتبات)",
      hero: "عمق parallax — العنوان والزرّ يطفون فوق الشبكة والتوهّج",
      stepCards: "tilt 3D عند الهوفر (كل بطاقة بزاوية مختلفة)",
      featureCards: "دوران 3D + الأيقونة تقفز للأمام",
      freejScene: "perspective كامل + ميلان خفيف عند الهوفر",
      pins: "دبابيس عائمة (translateZ 15px) + حركة إيقاعية بعمق",
      buildings: "مرتفعة عن الأرضية + تكبر عند الإضاءة",
      hud: "شريط الحكم عائم (translateZ 40px)",
      verdict: "لمعة زجاجية + نص عائم",
      footer: "طبقة ضوء + توهّج الشعار"
    },
    principle: "ما يبين إنه مسوّي بذكاء اصطناعي — احترافي مصنوع بإتقان"
  },

  // ===== ٦) نموذج النقاش + العدوى المزاجية (freej.js) =====
  debateModel: {
    mood: "مزاج من -2 إلى +2 لكل شخصية",
    seed: "seedMood — السلبي/المتصيّد يبدأ معصّب",
    rounds: 4,
    contagion: {
      angerWeight: 0.55,   // العصب يعدّي أسرع
      calmWeight: 0.38,
      trollNeighbor: -0.40 // الجار المتصيّد يجرّ للأسفل
    },
    provenance: "يسجّل منو أثّر على منو كل جولة",
    verdictShift: {
      mode: "دراما عالية",
      formula: "delta = -groupMood * 24",
      effect: "يقدر يقلب الحكم 🟢 ↔ 🔴"
    },
    analysis: "buildAnalysis → منو تواجه منو + بدأ←انتهى لكل شخص + المؤثّر + استنتاجات",
    render: "renderAnalysis (محلي + سرد AI عبر /api/debate-narrate)"
  },

  // ===== ٧) الأمان (OWASP — مُنجَز) =====
  security: {
    headers: {
      CSP: "صارم — script-src 'self' (لا inline JS)",
      antiClickjacking: "X-Frame-Options DENY + frame-ancestors 'none'",
      nosniff: "X-Content-Type-Options",
      other: "Referrer-Policy، Permissions-Policy، HSTS",
      apiCache: "Cache-Control: no-store على /api/*"
    },
    functions: "ما تسرّب تفاصيل أخطاء (أكواد عامّة) + حدود مدخلات (نص ≤5000، إجابات ≤100)",
    xss: "كل النصوص عبر createTextNode/textContent — صفر innerHTML للمحتوى",
    secrets: "ANTHROPIC_API_KEY عبر process.env فقط — أبداً بالكود",
    ssrf: "عنوان API ثابت",
    dependencies: "صفر تبعيات",
    remaining: "Rate-limiting + مصادقة (مع الباكند لاحقاً)"
  },

  // ===== ٨) الخصوصية =====
  privacy: {
    storage: "localStorage محلي بالمتصفّح (dw_profile_v1) — غير قابل للنشر",
    sensitiveGuard: "isSensitive() يفلتر السياسة/الدين/الصحّة العميقة",
    rule: "الإجابات الحسّاسة تبقى محلية ولا تُرسل للسيرفر أبداً",
    law: "قبل الإطلاق العام: مراجعة قانون الكويت 63/2015 — يحتاج محامٍ بشري"
  },

  // ===== ٩) معلّق على المالك =====
  ownerTodos: [
    {
      priority: "🔴",
      key: "المفتاح",
      task: "أضِف ANTHROPIC_API_KEY ببيئة Vercel + Redeploy",
      effect: "يفعّل Claude الحقيقي + السرد بالـAI",
      steps: [
        "console.anthropic.com → API Keys → Create Key → انسخ sk-ant-...",
        "Billing → اشحن $5–$10 (كل توقّع سنتات قليلة)",
        "Vercel → my-project → Settings → Environment Variables → أضِف ANTHROPIC_API_KEY → Production → Save",
        "Vercel → Deployments → آخر نشر → ··· → Redeploy"
      ]
    },
    {
      priority: "🟡",
      key: "الحماية",
      task: "تعطيل Vercel Deployment Protection (سبب الـ403)",
      where: "Vercel → my-project → Settings → Deployment Protection → 'None' أو 'Only Preview'",
      temp: "رابط مشاركة مؤقت يعمل 23 ساعة عبر get_access_to_vercel_url"
    },
    {
      priority: "🔵",
      key: "قانوني",
      task: "رأي قانوني بشري قبل الإطلاق العام (خصوصية + قانون 63/2015)",
      note: "خارج نطاقي"
    }
  ],

  // ===== ١٠) الباكلوگ =====
  backlog: [
    "🟢 شخصيات SVG مرسومة بدل الإيموجي (M2)",
    "🟢 إثراء المجتمعات + نصائح استباقية + streak",
    "🟢 A3: Supabase + تسجيل دخول + ملف دائم + Rate-limiting + إشعارات",
    "🟡 معايرة دقّة المحرّك",
    "🟡 نطاق أنظف (naqishna.com)"
  ],

  // ===== ١١) المُنجَز بآخر جلسة =====
  doneThisSession: [
    "✅ تدقيق كامل (syntax + ملفات + XSS + أسرار + خصوصية + CSP) — نظيف",
    "✅ تغيير الاسم «الديوانية» → «ناقشنا» في كل مكان (24 موضع)",
    "✅ تأثيرات 3D عبر كل التصميم (CSS بحت)",
    "✅ رابط مشاركة مؤقت لتجاوز الحماية + خطوات التعطيل الدائم",
    "✅ تحديث NOTES-5 + رفع لكل الفروع"
  ],

  // ===== ١٢) سير العمل =====
  workflow: {
    develop: "على فرع claude/keen-noether-m3vjnl",
    sync: "دمج مع main لتشغيل auto-deploy",
    commitFooter: "Co-Authored-By + Claude-Session",
    preCheck: "node --check + سيرفر محلي + تأكيد deployment READY"
  }
};

// للاستخدام كمرجع برمجي (Node) أو كملف توثيقي
if (typeof module !== "undefined" && module.exports) module.exports = NAQISHNA;
