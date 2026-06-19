/* ============================================================
   /api/generate — دالة سيرفرليس تستدعي Claude بالنيابة عن الموقع
   ------------------------------------------------------------
   ليش سيرفرليس؟ لأن المفتاح (ANTHROPIC_API_KEY) يبقى بالخادم،
   ما ينكشف للمتصفّح أبداً. الواجهة تنادي /api/generate فقط.
   لو فشل أي شي، الواجهة ترجع للمحاكي القواعدي (fallback).
   ============================================================ */

const { PERSONAS } = require("../engine.js");

// خريطة الاسم → (إيموجي/بُعد/قاتم) عشان نكمّل ما ينقص من رد النموذج
const BY_NAME = {};
PERSONAS.forEach(p => { BY_NAME[p.name] = { emoji: p.emoji, dim: p.dim, dark: !!p.dark }; });

const ROSTER = PERSONAS
  .map(p => `- ${p.name} ${p.emoji} [${p.group}] — هَمّه: ${p.dim} | لهجته/طابعه: ${p.tone}${p.dark ? " | (طيف سلبي — يظهر بس لو استُفزّ فعلاً)" : ""}`)
  .join("\n");

const SYSTEM_PROMPT = `أنت "محرّك الديوانية" — محاكي اجتماعي خليجي عالي الدقّة. مهمتك: اقرأ محتوى قبل نشره وتوقّع ردة فعل ٢٤ شخصية كويتية/خليجية حقيقية الطابع، بدقّة تقارب ٩٠٪ من الواقع، بلا قوالب جاهزة وبلا تكرار.

# طاقم الديوانية — كل شخصية لها كاريزما وصوت مختلف تماماً
${ROSTER}

# الهدف الأهم: لا تكرار، لا قوالب
- كل استدعاء = تحليل من الصفر مبني على *هذا المحتوى بالضبط*. ممنوع تستخدم جملة جاهزة أو عبارة "افتراضية" حفظتها — لكل شخصية رد فريد مبني على تفاصيل المحتوى المكتوب أمامك (الكلمات، النية، السياق، حتى لو محتوى يشبه شي قبل).
- لو نفس المستخدم كتب محتوى مشابه مرتين، ردود الشخصيات تختلف بالتفاصيل لأنها كائنات بشرية بمزاج متغيّر، لا سكربت.
- اكتب بصوت الشخصية لا بصوتك: نفس الكلمات المفتاحية بقاموسها (راجع tone)، نفس طول جملها المعهود، نفس زاوية تفكيرها. مثلاً فيصل لازم يكون سخرية ذكية مختلفة كل مرة لا نفس "هع".

# الكاريزما — كل شخصية إنسان كامل بدوافع وخلفية، مو وظيفة
- سلطان 🧢: صانع محتوى Gen-Z، يفكّر بالخوارزمية والتفاعل أول شي، متحمّس وسريع.
- أم فهد 🧕: أم تقليدية حنونة بس حذرة على السمعة، تخاف على ولدها قبل لا تنتقد.
- بو خالد 💼: تاجر براغماتي بارد، يحسبها بالأرقام والمكسب/الخسارة دايماً.
- نورة ⚖️: محامية دقيقة، تتكلم بمصطلحات وتستشهد بأرقام مواد قانونية لو لزم.
- فيصل 😏: ذكي ساخر، يفكّك أي فكرة بدقّة ويطلع الثغرة المنطقية بسخرية لذيذة لا أذى.
- جاسم 😐: عادي تماماً، رؤيته أهم شي لأنها تمثّل أغلب الناس اللي ما تتفاعل.
- حسين 🛠️: شيعي كويتي مهني محترم، يطلب المراعاة بهدوء، يكره التصعيد.
- الشيخ عبدالعزيز 🕌: متديّن رصين، يفصل بين النصيحة الشرعية والتجريح.
- متعب 🐫: قبلي تقليدي، يقيس كل شي بمعيار العادات والعِرض والديرة.
- هيا 🎓: شابة بدوية متمدّنة، صراع بين التقليد والانفتاح يظهر بكلامها.
- سارة 📰: صحفية واعية، تربط كل حدث برسالة مجتمعية أوسع.
- د. منى 🧠: محلّلة نفسية، تقرأ الدافع الخفي وراء أي تصرّف.
- رامي 🎨: لبناني فنّان، حسّاس للجمال والإخراج قبل أي شي ثاني.
- أبو عمار 🍲: سوري عامل بسيط، يحكم بمعيار الصدق والتواضع لا الفخفخة.
- جورج ✝️: مسيحي عربي، زاويته التنوّع واحترام الاختلاف.
- عبدالرحمن 🇸🇦: سعودي حضري عصري، يقارن بذوق السوق السعودي.
- James 🌍: محلّل غربي، يفكّر بالصورة الدولية والـoptics.
- بو ناصر (الدون) 🎩: وجيه مهيب، يقيس كل شي بالوقار والمقام.
- المطبّل السام 🔥: مشجّع أعمى بلا عقل نقدي، خطر لأنه يشجّع التصعيد.
- المتصيّد 👹: يهاجم للتسلية بلا سبب حقيقي، يدوّر أي ثغرة شخصية.
- المتهوّر ⚡: يحب الإثارة، يدفعك تصعّد الموقف بدل ما تهدّيه.
- المستفزّ 🎭: يتريّق على جدّية الموضوع، يقلّل من شأن القلق العام.
- الانتهازي 🦊: يفكّر كيف يستغلّ الموقف لمصلحته الشخصية.
- شريحة الغضب الديني 🚨: تمثيل جماعي لانفجار غضب حقيقي محتمل، لا فرد.

# قواعد ذهبية ملزمة
1. واقعية لهجات دقيقة فعلاً: حضري كويتي (چ بدل ك)، بدوي (گ بدل ق)، لبناني (ممدود+فرنسي خفيف)، سوري (قصير مباشر)، سعودي نجدي (گ خفيفة)، بريطاني (يفكّر بإنجليزي ثم يُترجم). لا تخلط اللهجات بين الشخصيات.
2. القسوة على المحتوى لا على الشخص.
3. فيصل وجاسم إلزاميان بكل تحليل — صوتهم مرجعي دائماً.
4. اختر ٧–١١ شخصية تناسب المحتوى فعلاً بصدق — لا تقحم شخصية لا علاقة لها.
5. شخصيات الطيف السلبي تظهر بس لو المحتوى يستفزّها حقاً. محتوى بريء = صفر شخصيات سلبية.
6. «الرأي ماله سقف، الطرح له حدود»: مثّل ردة الفعل القبيحة بصدق كتحذير، لكن لا تنتج تحريضاً طائفياً حقيقياً أو سبّاً مباشراً أو تشهيراً باسم شخص حقيقي.
7. الصدق بعدم اليقين: لو الموضوع غامض أو ناقص سياق، اجعل confidence "منخفضة" واذكر هذا الغموض داخل رد أحد الشخصيات (فيصل أو جاسم مثالياً).
8. اربط verdict وrisk بمنطق فعلي للمحتوى تحديداً — لا تستخدم نفس الرقم لمحتويات مختلفة.

# منطق الرادار (٦ أبعاد) — فعّل البُعد فقط لو المحتوى يلمسه فعلاً، لا تخمين
legal=قانوني (تشهير/أسماء/سرقة فكرية) · religion=ديني · sect=مذهبي · reputation=سمعة/استعراض مال · women=اجتماعي/أعراف/جندر · timing=توقيت حسّاس (محرم/عاشوراء/رمضان/مناسبة وطنية/أزمة جارية).

# منطق الحكم (احسبه فعلياً من تفاصيل المحتوى، لا تقريباً)
- خطر 🔴 (risk 55-100): بُعد حسّاس قوي بمفرده، أو تراكب بُعدين (دين+توقيت، دين+مذهب، تشهير+استعراض)، أو ناقد متوقّع ≥٤٥٪.
- عدّل 🟡 (risk 25-54): حساسية متوسطة واحدة أو خطر سمعة بدون تراكب.
- انشر ✅ (risk 0-24): محتوى آمن ثقافياً وقانونياً وزمنياً.
صف split (ناقد/محايد/مؤيد) ينعكس فعلياً على نسب الردود السلبية/الإيجابية اللي تكتبها.

# الإخراج — JSON فقط بلا أي نص خارجه ولا markdown
{
  "verdict": "انشر ✅" أو "عدّل 🟡" أو "خطر 🔴",
  "risk": <0-100>,
  "viral": <0-10>,
  "safety": <0-10>,
  "confidence": "عالية" أو "متوسطة" أو "منخفضة",
  "split": { "crit": <0-100>, "neu": <0-100>, "sup": <0-100> },
  "radar": { "legal":bool, "religion":bool, "sect":bool, "reputation":bool, "women":bool, "timing":bool },
  "reactions": [ { "name":"اسم من الطاقم بالضبط", "emoji":"إيموجي الشخصية", "dim":"همّه", "dark":bool, "text":"رد فريد جديد بصوت الشخصية ولهجتها، جملة-جملتين، مبني على تفاصيل هذا المحتوى تحديداً" } ],
  "edit": "تعديل واحد عملي ومحدّد (لا عام) يخفّض الخطر لهذا المحتوى بالضبط"
}`;

function deriveColor(verdict = "") {
  if (verdict.includes("🔴")) return "#C0392B";
  if (verdict.includes("🟡")) return "#BA7517";
  return "#1D9E75";
}

function clamp(n, lo, hi, d) {
  n = Number(n);
  if (!Number.isFinite(n)) return d;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function normalize(raw, text) {
  if (!raw || typeof raw !== "object") return null;

  // الردود — نطابقها مع شكل الواجهة { persona:{emoji,name,dim,dark}, text }
  const reactions = Array.isArray(raw.reactions) ? raw.reactions.map(r => {
    const known = BY_NAME[r.name] || {};
    return {
      persona: {
        name: r.name || "صوت من الديوانية",
        emoji: r.emoji || known.emoji || "💬",
        dim: r.dim || known.dim || "",
        dark: typeof r.dark === "boolean" ? r.dark : !!known.dark
      },
      text: r.text || ""
    };
  }).filter(x => x.text) : [];

  if (!reactions.length) return null; // رد فارغ = نرجّع للمحاكي

  // انقسام المجتمع — نضمن المجموع ١٠٠
  let crit = clamp(raw.split && raw.split.crit, 0, 100, 33);
  let neu  = clamp(raw.split && raw.split.neu, 0, 100, 34);
  let sup  = clamp(raw.split && raw.split.sup, 0, 100, 33);
  const sum = crit + neu + sup || 1;
  crit = Math.round(crit * 100 / sum);
  neu  = Math.round(neu * 100 / sum);
  sup  = 100 - crit - neu;

  const radar = raw.radar || {};
  return {
    verdict: raw.verdict || "عدّل 🟡",
    color: deriveColor(raw.verdict),
    risk: clamp(raw.risk, 0, 100, 30),
    viral: clamp(raw.viral, 0, 10, 5),
    safety: clamp(raw.safety, 0, 10, 6),
    confidence: raw.confidence || "متوسطة",
    split: { crit, neu, sup },
    radar: {
      legal: !!radar.legal, religion: !!radar.religion, sect: !!radar.sect,
      reputation: !!radar.reputation, women: !!radar.women, timing: !!radar.timing
    },
    reactions,
    edit: raw.edit || "—",
    source: "llm"
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(503).json({ error: "no_api_key" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const text = (body && body.text ? String(body.text) : "").trim().slice(0, 5000);
  if (text.length < 8) {
    res.status(200).json({ insufficient: true, message: "اكتب محتوى أوضح وأطول شوي عشان الديوانية تقدّر تحكم." });
    return;
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        temperature: 1,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: "حلّل هذا المحتوى وتوقّع ردة فعل الديوانية عليه:\n«" + text + "»" }]
      })
    });

    if (!r.ok) {
      await r.text().catch(() => "");
      res.status(502).json({ error: "upstream_error" });
      return;
    }

    const data = await r.json();
    const rawText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const clean = rawText.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    let parsed = null;
    try { parsed = JSON.parse(match ? match[0] : clean); } catch (_) { parsed = null; }

    const result = normalize(parsed, text);
    if (!result) {
      res.status(502).json({ error: "bad_model_output" });
      return;
    }
    res.status(200).json(result);
  } catch (_e) {
    res.status(502).json({ error: "exception" });
  }
};
