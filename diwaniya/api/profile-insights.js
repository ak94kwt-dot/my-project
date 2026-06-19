/* ============================================================
   المستشار الشخصي — استخلاص الأنماط (api/profile-insights.js)
   ------------------------------------------------------------
   نقطة سيرفرليس: تستقبل إجابات المستخدم الخفيفة وترجّع أنماط
   شخصيته + ملخّص + نصائح يومية — كلها بعيدة عن السياسة والدين
   والصحّة العميقة. تستخدم Claude مع Prompt Caching.

   الإدخال : { answers: [{ q, a }, ...] }
   الإخراج : { traits:[{label,strength}], summary, tips:[...] }

   ملاحظة خصوصية: لا نخزّن أي شيء على السيرفر — التحليل لحظي
   والملف يبقى محلياً بمتصفّح المستخدم (غير قابل للنشر).
   ============================================================ */

const SYSTEM_PROMPT = [
  "أنت «المستشار الشخصي» داخل تطبيق خليجي/كويتي. مهمتك تقرأ إجابات المستخدم الخفيفة عن نمط حياته اليومي",
  "(أكل، طلعات، سفر، مزاج، نوم، جمعه) وتستخلص منها أنماط شخصيته بلُطف وذكاء، ثم تعطيه نصائح يومية عملية قريبة منه.",
  "",
  "الهدف الأعمق: تصير رفيقاً يومياً لا يُستغنى عنه — تفهمه، تذكر تفاصيله، وتقترح عليه أشياء تناسب شخصيته بالضبط.",
  "",
  "قواعد ذهبية:",
  "- اكتب بلهجة كويتية/خليجية دافئة وراقية، مختصرة وبدون مبالغة.",
  "- ابتعد تماماً عن: السياسة، الدين والمذاهب، والأمور الصحية/الطبية العميقة (تشخيص، أدوية، أمراض، نفسية عميقة). لو إجابة لمّحت لها، تجاهلها بلطف ولا تبني عليها.",
  "- لا تتظاهر بمعرفة أكثر من المتاح. لو الإجابات قليلة، خلّي استنتاجك متواضع وصادق.",
  "- النصائح عملية وخفيفة ويومية (أكل، طلعة، روتين، تنظيم وقت، هواية) — لا وعظ ولا أحكام.",
  "- لا تشهير، لا أحكام أخلاقية على المستخدم. أنت معه لا ضده.",
  "",
  "أخرج JSON فقط بهذا الشكل بالضبط، بدون أي نص خارجه:",
  '{',
  '  "traits": [{"label":"وصف نمط قصير بالعربي","strength": رقم 0-100}, ...] (3 إلى 5 أنماط),',
  '  "summary": "فقرة قصيرة (سطرين) تلخّص شخصيته كما فهمتها، بضمير المخاطب وبدفء",',
  '  "tips": ["نصيحة يومية عملية قصيرة", ...] (2 إلى 4 نصائح تناسب شخصيته)',
  '}'
].join("\n");

function clampNum(n, lo, hi, d){
  const v = Number(n);
  if (!isFinite(v)) return d;
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function normalize(raw){
  if (!raw || typeof raw !== "object") return null;
  let traits = Array.isArray(raw.traits) ? raw.traits : [];
  traits = traits
    .filter(t => t && t.label)
    .slice(0, 5)
    .map(t => ({ label: String(t.label).slice(0, 40), strength: clampNum(t.strength, 0, 100, 55) }));
  let tips = Array.isArray(raw.tips) ? raw.tips : [];
  tips = tips.filter(Boolean).slice(0, 4).map(t => String(t).slice(0, 160));
  const summary = raw.summary ? String(raw.summary).slice(0, 400) : "";
  if (!traits.length && !summary) return null;
  return { traits, summary, tips, source: "llm" };
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
  const answers = ((body && Array.isArray(body.answers)) ? body.answers : []).slice(0, 100);
  if (answers.length < 2) {
    res.status(200).json({ insufficient: true, message: "محتاج إجابات أكثر شوي عشان أتعرّف على نمطك." });
    return;
  }

  const transcript = answers
    .map(x => "س: " + String(x.q || "").slice(0, 120) + "\nج: " + String(x.a || "").slice(0, 200))
    .join("\n\n");

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
        max_tokens: 1200,
        temperature: 0.9,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: "هذي إجابات المستخدم الخفيفة، استخلص أنماط شخصيته ونصائح تناسبه:\n\n" + transcript }]
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

    const result = normalize(parsed);
    if (!result) {
      res.status(502).json({ error: "bad_model_output" });
      return;
    }
    res.status(200).json(result);
  } catch (_e) {
    res.status(502).json({ error: "exception" });
  }
};
