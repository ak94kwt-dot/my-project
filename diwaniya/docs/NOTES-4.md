# الديوانية — ملف التسليم الكامل (NOTES-4) · المرجع النشط الوحيد

> `NOTES.md` · `NOTES-2.md` · `NOTES-3.md` **مُغلقة**. هذا الملف **شامل ويقف لحاله** — الجلسة الجديدة تقرأه وحده وتكمل.
> للمتابعة بجلسة جديدة، قُل: «اقرأ `diwaniya/docs/NOTES-4.md` ونكمّل».

---

## ١) شنو المنتج
أداة خليجية/كويتية فيها طبقتان:
- **المستشار الشخصي** (الصفحة الرئيسية): أسئلة يومية خفيفة → ملف خاص غير قابل للنشر → الذكاء يتعلّم أنماط الشخصية ويعطي نصائح. الهدف بعيد المدى: رفيق يومي لا يُستغنى عنه.
- **الفريج الحيّ** (أداة): مشهد SVG فيه ٢٤ شخصية تتناقش بوجوه ومشاعر، تتوقّع ردة فعل المجتمع على محتوى قبل نشره، مع تحليل «منو أثّر على منو».

خط المحتوى الثابت: **«نصوّر النار، ما نشعلها»** — واقعية بلا سقف بتمثيل ردّات الفعل، بلا إنتاج تحريض/تشهير/شتائم حقيقية.

---

## ٢) النشر والبنية التحتية
- منشور لايف على Vercel من فرع `main` (Git Integration: أي push على `main` ينشر تلقائياً). Root Directory = `diwaniya`.
- الرابط: `https://my-project-git-main-ak-s-pr.vercel.app`
- فرع التطوير: `claude/keen-noether-m3vjnl` (نطوّر عليه ثم ندمج على `main`؛ حالياً متزامنين).
- Vercel: team `team_BdMPEvXh1WlN3Ex1tGMrOWII` (slug `ak-s-pr`) · project `prj_Ph0tvPg0oU6jwDitmAfYBxMbNm86`.
- ٣ دوال سيرفرليس (`nodejs:3`). لا `vercel.json` — Vercel يكتشف مجلّد `api/` تلقائياً.
- بنية static + no-build: لا مكتبات، لا خطوة بناء. كل شي DOM/CSS/SVG + دوال `api/*`.

---

## ٣) الملفات
| الملف | الدور |
|------|------|
| `index.html` | الصفحة الكاملة + كل الـCSS (يربط freej.css/advisor.css + سكربتات engine/questions/profile/freej/app). |
| `app.js` | يبني الموقع ديناميكياً: الهيدر، **المستشار** (`buildAdvisor`)، الهيرو/الخطوات/المميّزات، **أداة الفريج** (`buildApp`)، الفوتر. + `runAnalysis` (يستدعي API ثم الفريج) + `renderResult` + **`renderAnalysis`** (لوحة تحليل النقاش). |
| `engine.js` | محرّك قواعدي (fallback): `PERSONAS` (24)، `scanRadar`، `selectCast`، `generate`. يُصدّر لـNode وللمتصفّح (`window.DiwaniyaEngine`). |
| `questions.js` | `window.DiwaniyaQuestions = {CATEGORIES(6), QUESTIONS(22), BLOCKED_TOPICS}`. أسئلة خفيفة بعيدة عن سياسة/دين/صحة عميقة. |
| `profile.js` | `window.Profile = {get,reset,addAnswer,nextQuestion,answeredCount,insights,localInsights}`. تخزين محلي `localStorage["dw_profile_v1"]`. حارس `isSensitive` يعلّم الإجابات الحسّاسة فلا تُرسل للسيرفر. |
| `advisor.css` | أنماط المستشار (أقسام يمين + بطاقة سؤال + بطاقة الملف). |
| `freej.js` | `window.Freej = {mount,summon,react,reset}`. المشهد + النقاش + العدوى + التحليل. |
| `freej.css` | أنماط المشهد + الوجوه/المزاج + الـHUD. |
| `api/generate.js` | توقّع ردة الفعل عبر Claude (`claude-sonnet-4-6` + Prompt Caching)، يطابق عقد بيانات المحاكي، يقرأ `ANTHROPIC_API_KEY`. |
| `api/profile-insights.js` | استخلاص أنماط الشخصية من إجابات الملف. |
| `api/debate-narrate.js` | سرد تحليل النقاش بأسلوب أحلى (اختياري). |
| `docs/engine-spec-v4.6.md` | الوثيقة المرجعية الكاملة للشخصيات/اللهجات. |
| `docs/partner-deck.pptx` | عرض الشركاء (288KB — أبقيناه؛ يُحذف بطلب المالك). |
| محذوف للتنظيف | ~~`llm-bridge.js`~~ ، ~~`app.html`~~ ، ~~`docs/gap-report.md`~~. |

---

## ٤) عقد البيانات (مشترك بين المحاكي والـAPI)
`{ verdict, color, risk(0-100), viral(0-10), safety(0-10), confidence, split:{crit,neu,sup}, radar:{legal,religion,sect,reputation,women,timing}, reactions:[{persona:{name,emoji,dim,dark}, text}], edit, insufficient? }`
- بعد النقاش يُضاف: `debate:{before,after,delta,reason}` و`analysis:{pairs, people:[{name,emoji,changed,direction,influencer,viaDark,line}], summary:{changedCount,angered,calmed,topInfluencer,overall}}`.
- الواجهة دائماً تجرّب `/api/*` أول، وتسقط للمحاكي/المحلي عند أي فشل — التجربة ما تنكسر.

---

## ٥) نموذج النقاش + العدوى المزاجية (في freej.js)
- المزاج رقم من -2 (😡) إلى +2 (😄). `seedMood`: الطيف السلبي (`dark`) يبدأ ~-1.3؛ الباقي يبدأ مرتاح/محايد حسب خطورة المحتوى.
- `simulate(ids,seed,darkSet)`: ٤ جولات. كل جولة كل شخص يتأثّر بجيرانه (يسار/يمين بالدائرة). **العصب يعدّي أسرع** (وزن 0.55 لو الجار سالب مقابل 0.38)، **الجار المتصيّد يطرح -0.40**، المتصيّد نفسه يبقى مولّع. يسجّل provenance (منو سحب منو) كل جولة.
- **تأثير الحكم (دراما عالية):** `delta = round(-groupMood * 24)` → يقدر يقلب 🟢↔🔴. `after = clamp(base+delta,2,98)`، ويُعاد حساب tier/color. الـsplit يتحسب من المزاج النهائي.
- **التحليل:** `buildAnalysis` يطلّع الأزواج، ولكل شخص بدأ←انتهى + أقوى مؤثّر + سبب، + استنتاجات. يُعرض بلوحة `renderAnalysis` تحت المشهد (محلي دائماً؛ يُثرى عبر `/api/debate-narrate` لو فيه مفتاح).
- الوجوه: `applyMood` يحدّث إيموجي الوجه + كلاس مزاج (m-angry يرتجف أحمر، m-happy يقفز أخضر).

---

## ٦) معلّق على المالك (لا يُنفّذ بدون طلب)
1. 🔴 **«المفتاح» = `ANTHROPIC_API_KEY`** (يفعّل Claude الحقيقي بدل المحاكي + سرد AI). الخطوات الكاملة عند قول المالك «المفتاح»:
   - console.anthropic.com → Settings → API Keys → Create Key → انسخ `sk-ant-...`.
   - Settings → Billing → اشحن $5–10.
   - Vercel → my-project → Settings → Environment Variables → `ANTHROPIC_API_KEY` = المفتاح → Production → Save.
   - Vercel → Deployments → آخر نشر → ··· → Redeploy.
   - السرّ لا يُخزَّن بأي ملف أبداً.
2. 🟡 **تعطيل Vercel Deployment Protection** لو الرابط طلب تسجيل دخول (Settings → Deployment Protection → Disabled → Save).
3. 🔵 **رأي قانوني (محامٍ بشري)** قبل أي إطلاق عام للملف الخاص (خصوصية + موافقة + قانون الكويت 63/2015). خارج نطاقي — لا أقدّم استشارة قانونية.

---

## ٧) أفكار التطوير الجاية (Backlog)
- 🟢 شخصيات SVG مرسومة كاملة بدل الإيموجي (M2 للفريج) + مشي إطاري.
- 🟢 إثراء «المجتمعات» بالمستشار (تفاعل فعلي) + نصائح يومية استباقية + تذكيرات/streak أعمق.
- 🟡 معايرة دقّة المحرّك (مثال اختبار: «رقص وخمر بمحرم» لازم 🔴) · نطاق أنظف · تحسينات واجهة.
- 🟢 A3: Supabase + تسجيل دخول + ملف دائم عبر الأجهزة + سياسة خصوصية (بعد محامٍ) + إشعارات.

---

## ٨) سير العمل وgit
- التطوير على `claude/keen-noether-m3vjnl`، الدمج على `main` للنشر، والفرعان يبقيان متزامنين.
- نهاية رسائل الـcommit: سطرا Co-Authored-By + Claude-Session.
- لا تُنشأ PR إلا بطلب صريح.
- فحص قبل الرفع: `node --check` على كل JS + تشغيل `python3 -m http.server` وتأكيد 200 + (إن أمكن) تأكيد deployment READY عبر Vercel MCP.

## ٩) التحقق السريع
```bash
cd diwaniya && python3 -m http.server 8000   # افتح /
```
- الرئيسية: أقسام يمين + «سؤال اليوم» + بطاقة «ملفك». جاوب ٢-٣ أسئلة → الملف يتكوّن (يثبت بعد reload).
- «أدوات → الفريج» → اكتب محتوى → تجمّع ثنائيات → وجوه تتغيّر/تتعصّب → HUD «بدأ←بعد النقاش» → لوحة التحليل.
- آخر commit وقت كتابة هذا الملف: `1b41afd`.
