# الباكند — Supabase (ناقشنا)

## الحالة
- **مشروع حيّ:** `naqishna` · ref `umxhuuqsoygzcmpnliqb` · منطقة `eu-west-2` (لندن) · الطبقة المجانية ($0/شهر).
- **API URL:** `https://umxhuuqsoygzcmpnliqb.supabase.co`
- **الجدول:** `public.profiles` — RLS مفعّل، صفر تحذيرات أمنية.
- **المخطط بالمستودع:** `supabase/migrations/0001_profiles_with_rls.sql` + `0002_harden_set_updated_at.sql` (مصدر الحقيقة، مطابق للمطبَّق).

## نموذج الأمان (RLS)
- مصادقة مجهولة (anonymous) → لكل جهاز `auth.uid()` خاص.
- سياسات `profiles`: كل مستخدم يرى/يعدّل **صفّه فقط** (`auth.uid() = user_id`) لكل من select/insert/update/delete.
- دالّة `set_updated_at` محصّنة (سُحبت صلاحية تنفيذها من anon/authenticated).
- **الخصوصية:** لا يُخزَّن إلا الملف **غير الحسّاس** — `profile.js` يفلتر السياسة/الدين/الصحّة قبل أي إرسال.

## المفاتيح
| المفتاح | القيمة | ملاحظة |
|---|---|---|
| `SUPABASE_URL` | `https://umxhuuqsoygzcmpnliqb.supabase.co` | عام |
| publishable (anon) | `sb_publishable_Ychd9uT4NuvXA2Ku1yOfLQ_-mtkWz18` | **عام بطبيعته**، محميّ بـRLS — آمن بكود العميل (نمط Supabase القياسي) |
| `service_role` | — | ⛔ سرّي — لا يوضع بأي ملف أبداً. يبقى بلوحة Supabase فقط |

> المفتاح المنشور موضوع في `db.js` لأنه مصمَّم ليكون عاماً (المتصفّح يحتاجه)، والحماية الحقيقية من RLS لا من إخفائه.

## التكامل (db.js)
- وحدة مستقلّة بلا SDK وبلا build — `fetch` مباشر على REST.
- تعرّض `window.Cloud = { enable, disable, isEnabled, syncUp(data), syncDown() }`.
- **مرآة اختيارية:** الأصل يبقى محلياً (localStorage)؛ السحابة مزامنة عبر الأجهزة فقط.
- CSP مُحدّث ليسمح بالاتصال: `connect-src 'self' https://umxhuuqsoygzcmpnliqb.supabase.co`.

## ⚠️ خطوتان لتفعيل المزامنة (على المالك)
1. **فعّل المصادقة المجهولة:** Supabase → Authentication → Sign In / Providers → **Allow anonymous sign-ins = ON**.
2. **حمّل الوحدة + فعّلها:**
   - أضِف `<script src="db.js"></script>` في `index.html` (قبل `app.js`).
   - استدعِ `Cloud.enable()` (أو اضبط `localStorage["dw_cloud"]="1"`) عند موافقة المستخدم.
   - اربط: عند كل `Profile.addAnswer` → `Cloud.syncUp(safeProfile)`؛ وعند التحميل → `Cloud.syncDown()` لدمج ملف الأجهزة الأخرى.

> لماذا غير مُفعّل تلقائياً الآن؟ لأن المزامنة لا تُتحقَّق طرف-لطرف قبل تفعيلك للمصادقة المجهولة. الكود جاهز ومُختبَر التحميل، يُفعَّل بخطوة واحدة.

## قانوني/خصوصية
- مع تخزين أي بيانات مستخدم على السحابة: تلزم **سياسة خصوصية + موافقة صريحة** (قانون الكويت 63/2015) — مراجعة محامٍ بشري قبل الإطلاق العام. خارج نطاقي.
