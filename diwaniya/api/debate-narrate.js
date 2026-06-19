/* ============================================================
   /api/debate-narrate — سرد تحليل النقاش بأسلوب أحلى (Claude)
   ------------------------------------------------------------
   يستقبل حقائق التحليل المحسوبة محلياً (منو أثّر على منو ومنو
   غيّر رأيه) ويرجّع فقرة عربية راقية تلخّص ديناميكية النقاش.
   إثراء اختياري: لو ما فيه مفتاح، الواجهة تبقى على النص المحلي.
   ============================================================ */

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: "no_api_key" }); return; }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const an = body && body.analysis;
  if (!an || !Array.isArray(an.people) || !an.people.length) {
    res.status(400).json({ error: "no_analysis" }); return;
  }

  const facts = an.people.map(function (p) {
    return "- " + p.name + ": " + (p.line || "");
  }).join("\n");
  const pairs = (an.pairs || []).map(function (pr) { return pr.join(" ↔ "); }).join("، ");

  const SYSTEM = [
    "أنت محلّل اجتماعي يكتب بالعربية الفصحى المبسّطة بنبرة خليجية راقية.",
    "تُعطى وقائع نقاش محاكى بين شخصيات خليجية: منو تواجه منو، ومنو غيّر رأيه، ومنو أثّر عليه.",
    "اكتب فقرة واحدة (٣ إلى ٤ أسطر) تحكي ديناميكية النقاش: كيف بدأ المزاج، كيف انتشرت العدوى، منو كان المؤثّر، وكيف انتهى.",
    "كن دقيقاً مع الوقائع المعطاة فقط، بلا مبالغة وبلا أحكام أخلاقية. أخرج نصاً عادياً فقط (بدون JSON وبدون عناوين)."
  ].join("\n");

  const user = "الأزواج: " + (pairs || "—") + "\n\nوقائع كل شخصية:\n" + facts +
    "\n\nالخلاصة المحلية: " + ((an.summary && an.summary.overall) || "");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        temperature: 0.85,
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: user }]
      })
    });
    if (!r.ok) {
      await r.text().catch(() => "");
      res.status(502).json({ error: "upstream_error" });
      return;
    }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    if (!text) { res.status(502).json({ error: "empty" }); return; }
    res.status(200).json({ text: text.slice(0, 600) });
  } catch (_e) {
    res.status(502).json({ error: "exception" });
  }
};
