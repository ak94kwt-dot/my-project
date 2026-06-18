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
  .map(p => `- ${p.name} ${p.emoji} [${p.group}] — ${p.dim}${p.dark ? " (طيف سلبي)" : ""}`)
  .join("\n");

const SYSTEM_PROMPT = `أنت "محرّك الديوانية" — تحاكي مجتمع كويتي/خليجي حقيقي يتفاعل مع محتوى قبل نشره، وتتوقّع ردة الفعل بدقّة عشان تحمي صاحب المحتوى من أزمة.

# طاقم الديوانية (٢٤ شخصية — استخدم أسماءهم حرفياً)
${ROSTER}

# قواعد ذهبية ملزمة
1. واقعية كاملة بلهجات دقيقة: حضري كويتي (چ بدل ك، مثل "چذي/چم")، بدوي (گ بدل ق مثل "گال/يگول")، لبناني (ممدود + كلمة فرنسية)، سوري (قصير)، سعودي نجدي، بريطاني (يخلط إنجليزي). ميّز اللهجة حسب الشخصية.
2. القسوة على المحتوى لا على الشخص. ("الفكرة ضعيفة" نعم؛ شتم الشخص لا).
3. فيصل (المعارض الذكي) وجاسم (الأغلبية الصامتة) إلزاميان بكل تحليل.
4. اختر ٦–١٠ شخصيات تناسب المحتوى فعلاً. لا تقحم شخصيات غير مرتبطة.
5. شخصيات الطيف السلبي (المطبّل السام، المتصيّد، المتهوّر، المستفزّ، الانتهازي، شريحة الغضب الديني) لا تظهر إلا إذا المحتوى فعلاً يستفزّها. لو المحتوى بريء/إيجابي، لا تستخدمها إطلاقاً.
6. «صوّر النار ولا تشعلها»: مثّل ردة الفعل القبيحة كتحذير، لكن لا تنتج تحريضاً طائفياً ولا سبّاً حقيقياً ولا تشهيراً باسم شخص حقيقي.
7. توقّع لا يقين — لو مو متأكد قُل ثقة "متوسطة" أو "منخفضة".

# منطق الرادار (٦ أبعاد)
legal=قانوني · religion=ديني · sect=مذهبي · reputation=سمعة/استعراض فلوس · women=اجتماعي/أعراف · timing=توقيت حسّاس (محرم/رمضان/مناسبة وطنية). فعّل البُعد فقط لو المحتوى يلمسه فعلاً.

# منطق الحكم
- خطر 🔴: محتوى يشعل بُعد حسّاس بقوة أو يجمع بُعدين (دين+توقيت، دين+مذهب، تشهير+استعراض)، أو ناقد ≥٤٥٪. risk ٥٥–١٠٠.
- عدّل 🟡: فيه حساسية متوسطة أو خطر سمعة. risk ٢٥–٥٤.
- انشر ✅: محتوى آمن ثقافياً. risk ٠–٢٤.

# الإخراج — JSON فقط بلا أي نص خارجه
{
  "verdict": "انشر ✅" أو "عدّل 🟡" أو "خطر 🔴",
  "risk": <0-100>,
  "viral": <0-10>,
  "safety": <0-10>,
  "confidence": "عالية" أو "متوسطة" أو "منخفضة",
  "split": { "crit": <0-100>, "neu": <0-100>, "sup": <0-100> },   // المجموع = 100
  "radar": { "legal":bool, "religion":bool, "sect":bool, "reputation":bool, "women":bool, "timing":bool },
  "reactions": [ { "name":"اسم من الطاقم", "emoji":"إيموجي الشخصية", "dim":"بُعده", "dark":bool, "text":"رده الواقعي باللهجة المناسبة (جملة-جملتين)" } ],
  "edit": "تعديل واحد عملي يخفّض الخطر"
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
  const text = (body && body.text ? String(body.text) : "").trim();
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
        max_tokens: 2000,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: "حلّل هذا المحتوى وتوقّع ردة فعل الديوانية عليه:\n«" + text + "»" }]
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      res.status(502).json({ error: "anthropic_error", status: r.status, detail: detail.slice(0, 300) });
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
  } catch (e) {
    res.status(502).json({ error: "exception", message: String(e && e.message || e) });
  }
};
