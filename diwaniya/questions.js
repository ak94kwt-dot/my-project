/* ============================================================
   بنك الأسئلة الخفيفة — Questions Bank (questions.js)
   ------------------------------------------------------------
   أسئلة يومية خفيفة يرسلها البرنامج للمشترك ليبني ملفه الشخصي
   الخاص (غير قابل للنشر). كلها بعيدة عن السياسة والدين
   والأمور الصحية العميقة — مجرّد إشارات نمط حياة يستخلص منها
   الذكاء الاصطناعي أنماط الشخصية.

   كل سؤال: { qid, cat, text, kind, chips? }
     - cat : التصنيف (food/outing/travel/mood/lifestyle/social)
     - kind: "text" (إجابة حرّة) أو "chips" (اختيارات سريعة)
     - chips: اختيارات جاهزة لو kind=chips (تبقى الإجابة الحرّة متاحة)
   ============================================================ */

(function(){
  "use strict";

  // التصنيفات المسموحة (تظهر كأقسام على اليمين)
  const CATEGORIES = [
    { key:"food",      label:"أكل ومزاج",   emoji:"🍽️" },
    { key:"outing",    label:"خروج وطلعات", emoji:"🚗" },
    { key:"travel",    label:"سفر",         emoji:"✈️" },
    { key:"mood",      label:"مزاج اليوم",  emoji:"🌤️" },
    { key:"lifestyle", label:"نمط حياة",    emoji:"🌿" },
    { key:"social",    label:"ناسك وجمعتك", emoji:"👥" }
  ];

  // المجالات الممنوعة (للحارس في profile.js / الـAPI)
  const BLOCKED_TOPICS = ["سياسة","دين","طائف","مذهب","مرض","تشخيص","دواء","علاج","اكتئاب","انتحار"];

  const QUESTIONS = [
    // ===== أكل ومزاج =====
    { qid:"food_today",   cat:"food", kind:"chips", text:"شنو ودّك تاكل اليوم؟",
      chips:["مجبوس","برجر","بيتزا","مشاوي","آسيوي","سلطة وخفيف","ما لي خلق آكل"] },
    { qid:"food_cook",    cat:"food", kind:"chips", text:"تطبخ بالبيت لو تطلب برّا أكثر؟",
      chips:["أطبخ غالباً","أطلب غالباً","نص نص"] },
    { qid:"food_coffee",  cat:"food", kind:"chips", text:"قهوتك كيف؟",
      chips:["أمريكانو","لاتيه","قهوة عربية","ما أشرب قهوة","شاي أحب"] },
    { qid:"food_late",    cat:"food", kind:"text",  text:"آخر أكلة فتحت نفسك — شنو كانت ووين؟" },

    // ===== خروج وطلعات =====
    { qid:"out_lastout",  cat:"outing", kind:"chips", text:"من متى ما طلعت من البيت طلعة عدلة؟",
      chips:["اليوم","هالأسبوع","صار لي فترة","بصراحة قاعد بالبيت من زمان"] },
    { qid:"out_type",     cat:"outing", kind:"chips", text:"وين ترتاح نفسيتك أكثر؟",
      chips:["البحر","البر","مول","ديوانية/قعدة","كافيه","بيتي وبس"] },
    { qid:"out_when",     cat:"outing", kind:"chips", text:"وقت طلعاتك عادة؟",
      chips:["الصبح","العصر","الليل","آخر الليل"] },
    { qid:"out_alone",    cat:"outing", kind:"chips", text:"تحب تطلع لحالك لو مع جمعك؟",
      chips:["لحالي أرتاح","لازم جمعي","حسب مزاجي"] },

    // ===== سفر =====
    { qid:"trav_last",    cat:"travel", kind:"text",  text:"شنو آخر سفرة لك — وين وكيف كانت؟" },
    { qid:"trav_biggest", cat:"travel", kind:"text",  text:"أكبر/أحلى سفرة سويتها بحياتك كانت وين؟" },
    { qid:"trav_style",   cat:"travel", kind:"chips", text:"نوع السفر اللي يناسبك؟",
      chips:["مغامرة وطبيعة","تسوّق ومدن","استجمام وفخامة","ثقافة وتاريخ","أهم شي راحة"] },
    { qid:"trav_next",    cat:"travel", kind:"text",  text:"لو تسافر بكرة بدون قيود — وين توّدي؟" },

    // ===== مزاج اليوم =====
    { qid:"mood_now",     cat:"mood", kind:"chips", text:"كيف مزاجك الحين؟",
      chips:["مرتاح","نشيط","تعبان","زهق","متحمّس","مدري والله"] },
    { qid:"mood_energy",  cat:"mood", kind:"chips", text:"طاقتك اليوم وين؟",
      chips:["فل طاقة","عادية","واطية","محتاج أشحن"] },
    { qid:"mood_recharge",cat:"mood", kind:"text",  text:"شنو الشي اللي يرجّع لك مزاجك بسرعة؟" },

    // ===== نمط حياة =====
    { qid:"life_sleep",   cat:"lifestyle", kind:"chips", text:"نومك كيف هاليومين؟",
      chips:["منتظم","أنام متأخر","قليل","فوضى كاملة"] },
    { qid:"life_morning", cat:"lifestyle", kind:"chips", text:"إنت شخص صبح لو ليل؟",
      chips:["صباحي","ليلي","حسب اليوم"] },
    { qid:"life_hobby",   cat:"lifestyle", kind:"text",  text:"شنو الهواية اللي تضيّع فيها الوقت وما تحس؟" },
    { qid:"life_spend",   cat:"lifestyle", kind:"chips", text:"وقت فراغك تصرفه بـ؟",
      chips:["سوشيال/جوال","رياضة","قراءة/تعلّم","ألعاب","طلعات","شغل جانبي"] },

    // ===== ناسك وجمعتك =====
    { qid:"soc_circle",   cat:"social", kind:"chips", text:"جمعتك كبيرة لو قليلين ومخلصين؟",
      chips:["جمع كبير","قليلين ومخلصين","أغلب وقتي لحالي"] },
    { qid:"soc_meet",     cat:"social", kind:"chips", text:"تشوف ربعك كم بالأسبوع؟",
      chips:["يومياً تقريباً","مرّة مرّتين","نادر","صار لنا فترة"] },
    { qid:"soc_role",     cat:"social", kind:"chips", text:"بالقعدة إنت عادة؟",
      chips:["اللي يونّس","اللي يسمع","اللي ينظّم","اللي يطنّش بهدوء"] }
  ];

  const API = { CATEGORIES, QUESTIONS, BLOCKED_TOPICS };

  if (typeof module !== "undefined" && module.exports){ module.exports = API; }
  if (typeof window !== "undefined"){ window.DiwaniyaQuestions = API; }
})();
