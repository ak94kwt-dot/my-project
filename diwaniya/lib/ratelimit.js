/* ============================================================
   طبقة تحديد المعدّل (Rate Limiting) — دفاع مشترك للدوال
   ------------------------------------------------------------
   ليش؟ منع إساءة الاستخدام والتكلفة الزائدة على /api/* بعد تفعيل
   المفتاح. الدوال سيرفرليس بلا حالة بين النسخ، فالحلّ هجين:

   - افتراضياً: عدّاد داخل الذاكرة (أفضل-جهد، لكل نسخة دافئة) —
     يشتغل فوراً بلا أي بنية مدفوعة. يرفع الحاجز لكن ليس مثالياً
     لأن Vercel قد يوزّع الطلبات على نسخ متعددة.
   - لو وُجد Upstash Redis (متغيّرا البيئة أدناه): يستخدم عدّاداً
     مركزياً عبر REST (INCR + EX) — دقيق عبر كل النسخ. صفر تبعيات.

   ملاحظة أمنية: المفتاح/التوكن من process.env فقط، لا بالكود.
   التهيئة الاختيارية (Vercel → Environment Variables):
     UPSTASH_REDIS_REST_URL = https://...upstash.io
     UPSTASH_REDIS_REST_TOKEN = ********
   ============================================================ */

// مخزن داخل الذاكرة (لكل نسخة دافئة) — fallback
const _hits = new Map(); // key -> [timestamps]

function clientIp(req) {
  const xff = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xff || req.headers["x-real-ip"] || "0.0.0.0";
}

// عدّاد داخل الذاكرة بنافذة منزلقة
function memoryAllow(key, limit, windowMs) {
  const now = Date.now();
  const arr = (_hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  _hits.set(key, arr);
  // تنظيف دوري بسيط لتفادي تضخّم الذاكرة
  if (_hits.size > 5000) {
    for (const [k, v] of _hits) {
      const live = v.filter((t) => now - t < windowMs);
      if (live.length) _hits.set(k, live); else _hits.delete(k);
    }
  }
  const remaining = Math.max(0, limit - arr.length);
  return { ok: arr.length <= limit, remaining, retryAfter: Math.ceil(windowMs / 1000) };
}

// عدّاد مركزي عبر Upstash REST (اختياري)
async function redisAllow(key, limit, windowMs) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const winSec = Math.ceil(windowMs / 1000);
  // pipeline: INCR ثم EXPIRE (NX إن دعمها الإصدار) — نضبط TTL عند أوّل ضربة
  const r = await fetch(url + "/pipeline", {
    method: "POST",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(winSec), "NX"]
    ])
  });
  if (!r.ok) throw new Error("upstash_" + r.status);
  const data = await r.json(); // [{result:count}, {result:0|1}]
  const count = Number(data && data[0] && data[0].result) || 1;
  const remaining = Math.max(0, limit - count);
  return { ok: count <= limit, remaining, retryAfter: winSec };
}

/**
 * يفحص ويطبّق الحدّ. يرجّع { ok, remaining, retryAfter }.
 * @param {object} req  - طلب Vercel/Node
 * @param {object} opts - { bucket, limit, windowMs }
 */
async function rateLimit(req, opts) {
  const bucket = (opts && opts.bucket) || "api";
  const limit = (opts && opts.limit) || 30;
  const windowMs = (opts && opts.windowMs) || 60000;
  const key = "rl:" + bucket + ":" + clientIp(req);

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await redisAllow(key, limit, windowMs);
    } catch (_e) {
      // لو فشل المخزن المركزي لأي سبب، لا نكسر التجربة — نسقط للذاكرة
      return memoryAllow(key, limit, windowMs);
    }
  }
  return memoryAllow(key, limit, windowMs);
}

/**
 * مساعد: يطبّق الحدّ ويكتب رؤوس 429 عند التجاوز.
 * يرجّع true لو مسموح، false لو حُظِر (وقد كُتب الرد).
 */
async function enforce(req, res, opts) {
  const r = await rateLimit(req, opts);
  res.setHeader("X-RateLimit-Remaining", String(r.remaining));
  if (!r.ok) {
    res.setHeader("Retry-After", String(r.retryAfter));
    res.status(429).json({ error: "rate_limited" });
    return false;
  }
  return true;
}

module.exports = { rateLimit, enforce, clientIp };
