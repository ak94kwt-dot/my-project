/* ============================================================
   المستشار الشخصي — محرّك الملف الخاص (profile.js)
   ------------------------------------------------------------
   يبني ويخزّن ملف المستخدم الشخصي محلياً بالمتصفّح (localStorage)
   من إجاباته على الأسئلة الخفيفة. الملف *خاص وغير قابل للنشر*.
   منه يستخلص الذكاء الاصطناعي أنماط الشخصية (عبر /api/profile-insights)
   مع fallback محلي بسيط لو ما فيه مفتاح.

   window.Profile = {
     get, reset,
     addAnswer(qid, q, a),
     nextQuestion(),          // يختار سؤال اليوم غير مكرّر
     answeredCount(),
     insights(),              // Promise<{traits, summary, tips}>
     localInsights()          // استخلاص محلي فوري بلا API
   }
   ============================================================ */

(function(){
  "use strict";

  const KEY = "dw_profile_v1";
  const Q = (typeof window!=="undefined" && window.DiwaniyaQuestions) || { QUESTIONS:[], CATEGORIES:[] };

  // ===== التخزين =====
  function blank(){
    return { answers:[], traits:[], summary:"", tips:[], streak:0, lastAsk:0, created:Date.now() };
  }
  function get(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return blank();
      const p = JSON.parse(raw);
      return Object.assign(blank(), p);
    }catch(e){ return blank(); }
  }
  function save(p){
    try{ localStorage.setItem(KEY, JSON.stringify(p)); }catch(e){}
    return p;
  }
  function reset(){ try{ localStorage.removeItem(KEY); }catch(e){} return blank(); }

  // ===== حارس المواضيع الحسّاسة =====
  // أي إجابة حرّة تلمس سياسة/دين/صحّة عميقة تُعلَّم حسّاسة:
  // تبقى محفوظة محلياً للمستخدم، لكن لا تُرسل أبداً للسيرفر
  // ولا تُبنى عليها أنماط (خصوصية + ابتعاد عن المجالات الممنوعة).
  function isSensitive(txt){
    const B = Q.BLOCKED_TOPICS || [];
    const s = String(txt);
    return B.some(w => s.indexOf(w) >= 0);
  }

  // ===== الإجابات =====
  function addAnswer(qid, q, a){
    const p = get();
    const txt = (a==null?"":String(a)).trim();
    if(!txt) return p;
    // نحدّث لو نفس السؤال موجود، وإلا نضيف
    const i = p.answers.findIndex(x=>x.qid===qid);
    const rec = { qid, q, a:txt, ts:Date.now(), sensitive:isSensitive(txt) };
    if(i>=0) p.answers[i] = rec; else p.answers.push(rec);
    p.lastAsk = Date.now();
    // streak: يوم جديد فيه إجابة = +1
    const day = 86400000;
    if(!p._lastDay){ p._lastDay = Date.now(); p.streak = 1; }
    else {
      const lastDay = Math.floor(p._lastDay/day);
      const today = Math.floor(Date.now()/day);
      if(today>lastDay){ p.streak = (today-lastDay===1)?(p.streak+1):1; p._lastDay = Date.now(); }
    }
    return save(p);
  }
  function answeredCount(){ return get().answers.length; }

  // ===== اختيار سؤال اليوم =====
  function nextQuestion(){
    const p = get();
    const answered = new Set(p.answers.map(a=>a.qid));
    const pool = (Q.QUESTIONS||[]).filter(q=>!answered.has(q.qid));
    // لو خلّص كل الأسئلة، نعيد من البداية (يقدر يحدّث إجاباته)
    const list = pool.length ? pool : (Q.QUESTIONS||[]);
    if(!list.length) return null;
    // نوّع التصنيف: تجنّب تكرار نفس cat لآخر سؤالين
    const recentCats = p.answers.slice(-2).map(a=>{
      const def=(Q.QUESTIONS||[]).find(x=>x.qid===a.qid); return def&&def.cat;
    });
    const fresh = list.filter(q=>!recentCats.includes(q.cat));
    const pick = (fresh.length?fresh:list);
    return pick[Math.floor(Math.random()*pick.length)];
  }

  // ===== استخلاص محلي بسيط (بلا API) =====
  function localInsights(){
    const p = get();
    const a = p.answers.filter(x=>!x.sensitive);   // نتجاهل الحسّاس
    if(a.length < 2){
      return { traits:[], summary:"جاوب على كم سؤال خفيف وراح أبدأ أتعرّف على نمطك 👀", tips:[] };
    }
    const byCat = {};
    a.forEach(ans=>{
      const def = (Q.QUESTIONS||[]).find(x=>x.qid===ans.qid);
      const cat = def ? def.cat : "lifestyle";
      (byCat[cat]=byCat[cat]||[]).push(ans.a);
    });
    const traits = [];
    const catLabel = {food:"ذوّاق",outing:"اجتماعي/طلّاع",travel:"محب سفر",mood:"متأمّل بمزاجه",lifestyle:"مهتم بنمط حياته",social:"اجتماعي"};
    Object.keys(byCat).forEach(c=>{
      traits.push({ label: catLabel[c]||c, strength: Math.min(100, 40 + byCat[c].length*15) });
    });
    traits.sort((x,y)=>y.strength-x.strength);
    const top = traits.slice(0,4);
    const summary = "بدأت أعرفك: عندك ميول واضحة بـ" +
      top.slice(0,2).map(t=>t.label).join(" و") +
      ". كل ما تجاوب أكثر، تصير نصايحي أدق وأقرب لك.";
    return { traits:top, summary, tips:[] };
  }

  // ===== استخلاص عبر الذكاء الاصطناعي (مع fallback) =====
  function insights(){
    const p = get();
    const safe = p.answers.filter(x=>!x.sensitive);   // لا نرسل الحسّاس للسيرفر
    if(safe.length < 2){
      return Promise.resolve(localInsights());
    }
    return fetch("/api/profile-insights", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ answers: safe.map(x=>({ q:x.q, a:x.a })) })
    })
    .then(r=> r.ok ? r.json() : Promise.reject(new Error("api "+r.status)))
    .then(r=>{
      if(!r || r.error) throw new Error((r&&r.error)||"empty");
      const out = {
        traits: Array.isArray(r.traits)?r.traits.slice(0,5):[],
        summary: r.summary || localInsights().summary,
        tips: Array.isArray(r.tips)?r.tips.slice(0,4):[]
      };
      const sp = get(); Object.assign(sp, out); save(sp);  // نخزّن آخر تحليل
      return out;
    })
    .catch(err=>{
      console.warn("المستشار: رجعنا للاستخلاص المحلي —", err.message);
      return localInsights();
    });
  }

  const API = { get, reset, addAnswer, nextQuestion, answeredCount, insights, localInsights };
  if (typeof window !== "undefined"){ window.Profile = API; }
})();
