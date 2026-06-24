# ناقشنا (الديوانية سابقاً) — ملف التسليم الكامل · NOTES-5 (المرجع النشط الوحيد)

> `NOTES.md` … `NOTES-4.md` **مُغلقة**. هذا الملف شامل ويقف لحاله.
> للمتابعة بجلسة جديدة: «اقرأ `diwaniya/docs/NOTES-5.md` ونكمّل».

## ١) المنتج
أداة خليجية، طبقتان:
- **المستشار الشخصي** (الرئيسية): أسئلة يومية خفيفة → ملف خاص محلي غير قابل للنشر → أنماط شخصية + نصائح. هدف بعيد: رفيق يومي.
- **الفريج الحيّ** (أداة): خريطة احترافية فيها ٢٤ شخصية تتناقش بوجوه/مشاعر، تتوقّع ردة فعل المجتمع قبل النشر + تحليل «منو أثّر على منو».

خط ثابت: «نصوّر النار، ما نشعلها».

## ٢) الاسم — القرار النهائي ✅
**«ناقشنا» / Naqishna** (بعد بحث كامل: نظيف بالمتاجر، `naqishna.com` متاح، يميّزنا عن «ناقشني/Naqeshny» القديمة).
- ❌ «ناقشني» (منصّة قديمة بنفس الاسم naqeshni.com) · ❌ «ChatMe» (مزدحم) · ❌ «Freejna» (مأخوذ).
- ✅ **مُنجَز:** تغيير الاسم فعلياً بالموقع/الكود من «الديوانية» → «ناقشنا» (تمّ). + تأكيد علامة تجارية رسمي (وزارة التجارة + GCC) — خارج نطاقي.

## ٣) النشر والبنية
- لايف على Vercel من `main` (auto-deploy). الرابط: `https://my-project-git-main-ak-s-pr.vercel.app`
- فرع التطوير: `claude/keen-noether-m3vjnl` (متزامن مع main).
- Vercel: team `team_BdMPEvXh1WlN3Ex1tGMrOWII` · project `prj_Ph0tvPg0oU6jwDitmAfYBxMbNm86`.
- static + ٣ دوال سيرفرليس (`nodejs:3`). `vercel.json` فيه رؤوس الأمان.

## ٤) الملفات
- `index.html` (تصميم نظيف فخم + CSS) · `app.js` (المستشار + النتائج + لوحة التحليل)
- `engine.js` (محرّك fallback) · `questions.js` · `profile.js` · `advisor.css`
- `freej.js` (خريطة + نقاش + عدوى + تحليل) · `freej.css`
- `api/generate.js` · `api/profile-insights.js` · `api/debate-narrate.js`
- `vercel.json` (رؤوس أمان) · `docs/engine-spec-v4.6.md` · `docs/partner-deck.pptx` · `NOTES*.md`

## ٥) التصميم (ستايل نظيف مستوحى من Resend + خريطة Pam Pam)
- أبيض/زنك، عناوين حادّة، gradient (تيل→ذهبي) على الشعار، JetBrains Mono للأرقام، أزرار سوداء، بطاقات rounded-2xl، هيرو بتوهّج+شبكة.
- **الفريج كخريطة احترافية:** طبقة أساس SVG (أرض كريمية + ساحة دوّارة + شبكة شوارع بخطوط منقّطة + حدائق + ماء + كتل)، والشخصيات **دبابيس Pins بيضاء مدوّرة** بذيل وظلّ (السلبي فحمي).
- **تأثيرات 3D (CSS perspective/translateZ):** الهيرو بعمق parallax، البطاقات بتأثير tilt عند الهوفر، الدبابيس عائمة فوق الخريطة (translateZ)، شريط الحكم HUD عائم، المباني مرتفعة، أيقونات المميّزات تطفو عند الهوفر، الحكم بلمعة زجاجية. كل شي CSS بحت بدون مكتبات.

## ٦) نموذج النقاش + العدوى (freej.js)
مزاج -2..+2. `seedMood` (السلبي يبدأ معصّب). `simulate` ٤ جولات: العصب يعدّي أسرع (وزن 0.55 مقابل 0.38)، الجار المتصيّد -0.40، يسجّل provenance. تأثير الحكم دراما عالية `delta=-groupMood*24` (يقلب 🟢↔🔴). `buildAnalysis` → منو تواجه منو + بدأ←انتهى لكل شخص + المؤثّر + استنتاجات. تُعرض بلوحة `renderAnalysis` (محلي + سرد AI عبر `/api/debate-narrate`).

## ٧) الأمان (OWASP — مُنجَز)
- `vercel.json`: CSP صارم (`script-src 'self'`)، `X-Frame-Options DENY` + `frame-ancestors 'none'`، `nosniff`، Referrer/Permissions-Policy، HSTS، `Cache-Control: no-store` على `/api/*`.
- الدوال: ما تسرّب تفاصيل أخطاء (أكواد عامّة)، وحدود مدخلات (نص ≤5000، إجابات ≤100).
- XSS: كل النصوص عبر `createTextNode`. SSRF: عنوان ثابت. صفر تبعيات.
- متبقّي (مع الباكند لاحقاً): Rate-limiting + مصادقة.

## ٨) معلّق على المالك
1. 🔴 **«المفتاح»** = ANTHROPIC_API_KEY بـVercel + Redeploy (يفعّل Claude الحقيقي + سرد AI). خطوات كاملة عند قول «المفتاح».
2. 🟡 تعطيل Vercel Deployment Protection لو طلب تسجيل دخول.
3. ✅ تغيير الاسم لـ«ناقشنا» (تمّ).
4. 🔵 رأي قانوني بشري قبل الإطلاق العام (خصوصية + قانون 63/2015) — خارج نطاقي.

## ٩) الباكلوگ
- 🟢 شخصيات SVG مرسومة بدل الإيموجي (M2) · إثراء المجتمعات + نصائح استباقية + streak.
- ✅ Rate-limiting (lib/ratelimit.js على كل /api/*) · ✅ باكند Supabase حيّ (profiles + RLS، صفر تحذيرات) — راجع docs/BACKEND.md.
- 🟡 تفعيل المزامنة: المالك يبدّل Anonymous sign-ins + يربط db.js (window.Cloud) · إشعارات.
- 🟡 معايرة دقّة المحرّك · نطاق أنظف (naqishna.com) · 3D للموبايل مُسطّح + reduced-motion ✅.

## ١٠) سير العمل
تطوير على الفرع، دمج/مزامنة مع main، نهاية كل commit: Co-Authored-By + Claude-Session. فحص قبل الرفع: `node --check` + سيرفر محلي + تأكيد deployment READY. آخر commit: `dfb7dac`.
