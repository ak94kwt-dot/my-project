# الدرس 6: الاتصال بالخدمات الخارجية و Credentials

قوة n8n الحقيقية إنها تربط مئات الخدمات: Gmail، تيليجرام، Google Sheets، OpenAI، Slack... في هذا الدرس تتعلم كيف.

## طريقتان للاتصال بأي خدمة

### 1. النودات الجاهزة (Dedicated Nodes) — الأفضل
n8n عندها +400 نود جاهز لخدمات مشهورة. مثلاً نود Gmail يعطيك خيارات جاهزة: أرسل إيميل، اقرأ إيميلات، أضف label... بدون ما تعرف أي شي عن الـ API حقهم.

**القاعدة**: إذا في نود جاهز للخدمة، استخدمه.

### 2. HTTP Request — للباقي
إذا الخدمة ما لها نود جاهز، نود **HTTP Request** يتصل بأي API بالعالم. استخدمناه في درس 5 مع Open-Meteo.

أهم إعداداته:
- **Method**: نوع الطلب — GET (جلب بيانات) / POST (إرسال بيانات)...
- **URL**: رابط الـ API
- **Query Parameters**: معاملات تنضاف للرابط (مثل `latitude` و `longitude` في درس 5)
- **Headers / Body**: بيانات إضافية حسب متطلبات الـ API

## شنو هي Credentials؟

أغلب الخدمات تحتاج **إثبات هوية** عشان تسمح لك بالوصول — هذا هو الـ Credential:
- **API Key**: مفتاح نصي طويل (مثل OpenAI)
- **OAuth2**: تسجيل دخول بنافذة منبثقة "اسمح لـ n8n بالوصول لحسابك" (مثل Gmail و Google Sheets)
- **Username/Password**: اسم مستخدم وكلمة سر

## كيف تضيف Credential

1. من القائمة الرئيسية → **Credentials** → **Add credential**
2. اختر نوع الخدمة (مثلاً OpenAI)
3. حط المفتاح / سجل دخول
4. **Save** — يصير متاح لكل النودات اللي تحتاجه

أو مباشرة من داخل أي نود: حقل **Credential to connect with** → **Create new credential**.

## قواعد أمان مهمة جداً ⚠️

1. **لا تحط المفتاح أبداً داخل إعدادات النود نفسه** (URL أو Headers يدوياً) — دايماً استخدم نظام Credentials. n8n يشفر الـ credentials ويخفيها.
2. **لا تشارك مفاتيحك** مع أحد ولا تحطها في كود مكشوف.
3. إذا انكشف مفتاح، ادخل على لوحة الخدمة وألغيه (revoke) وسوّ واحد جديد.

## مثال عملي: ربط Open-Meteo (ما يحتاج credential!)

افتح workflow درس 5 → نود "جلب طقس الكويت":
- لاحظ **Authentication: None** — لأن Open-Meteo مجاني ومفتوح
- الـ APIs المفتوحة ممتازة للتعلم: jsonplaceholder.typicode.com (بيانات وهمية)، api.open-meteo.com (طقس)، restcountries.com (معلومات دول)

## تمارين الدرس

1. افتح نود "جلب طقس الكويت" في درس 5، وغيّر الإحداثيات لمدينة ثانية (دبي: lat 25.2048, lon 55.2708) ونفّذ.
2. أضف query parameter جديد اسمه `daily` بقيمة `temperature_2m_max` وشوف شنو زاد في الرد.
3. جهّز مفتاح OpenAI API للدرس الجاي: سجل في [platform.openai.com](https://platform.openai.com) → API keys → Create new secret key (يحتاج رصيد بسيط، 5 دولار تكفي للتعلم بشهور).

التالي: [الدرس 7: AI Agent — قلب الدورة ←](07-ai-agent.md)
