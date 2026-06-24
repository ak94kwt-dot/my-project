/* ============================================================
   ناقشنا — وحدة المزامنة السحابية الاختيارية (db.js)
   ------------------------------------------------------------
   مرآة سحابية اختيارية للملف الشخصي عبر Supabase. الأصل يبقى
   محلياً (localStorage) — هذه طبقة مزامنة عبر الأجهزة فقط.

   التصميم: بلا SDK وبلا build — fetch مباشر على REST من نفس
   المنشأ المسموح بـCSP. مصادقة مجهولة (anonymous) فيكون لكل
   جهاز auth.uid() خاص، وRLS بالخادم يضمن عزل البيانات.

   الخصوصية: لا يُرسَل إلا الملف غير الحسّاس (profile.js يفلتر
   الحسّاس أصلاً قبل أي إرسال).

   ⚠️ التفعيل يتطلّب خطوتين من المالك:
     1) Supabase → Authentication → Sign In/Up → Allow anonymous
        sign-ins = ON
     2) تحميل هذا الملف في index.html ثم استدعاء Cloud.enable()
        (أو ضبط localStorage["dw_cloud"]="1")

   المفاتيح أدناه عامّة بطبيعتها (publishable + URL) ومحميّة
   بـRLS — آمنة بكود العميل. لا يوضع service_role هنا أبداً.
   ============================================================ */
(function () {
  "use strict";

  var URL_BASE = "https://umxhuuqsoygzcmpnliqb.supabase.co";
  var ANON_KEY = "sb_publishable_Ychd9uT4NuvXA2Ku1yOfLQ_-mtkWz18";
  var SESS_KEY = "dw_cloud_sess_v1"; // {access_token, refresh_token, user_id}

  function isOn() {
    try { return localStorage.getItem("dw_cloud") === "1"; } catch (_) { return false; }
  }
  function loadSess() {
    try { return JSON.parse(localStorage.getItem(SESS_KEY) || "null"); } catch (_) { return null; }
  }
  function saveSess(s) {
    try { localStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (_) {}
  }

  // مصادقة مجهولة → جلسة فيها access_token و user.id
  function signInAnon() {
    return fetch(URL_BASE + "/auth/v1/signup", {
      method: "POST",
      headers: { apikey: ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({})
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("anon_" + r.status)); })
      .then(function (j) {
        var sess = {
          access_token: j.access_token,
          refresh_token: j.refresh_token,
          user_id: j.user && j.user.id
        };
        if (!sess.access_token || !sess.user_id) throw new Error("no_session");
        saveSess(sess);
        return sess;
      });
  }

  function getSession() {
    var s = loadSess();
    if (s && s.access_token && s.user_id) return Promise.resolve(s);
    return signInAnon();
  }

  function authHeaders(sess) {
    return {
      apikey: ANON_KEY,
      authorization: "Bearer " + sess.access_token,
      "content-type": "application/json"
    };
  }

  var Cloud = {
    available: true,

    // تفعيل المزامنة (يضبط العلم ويهيّئ الجلسة)
    enable: function () {
      try { localStorage.setItem("dw_cloud", "1"); } catch (_) {}
      return getSession().then(function () { return true; }).catch(function () { return false; });
    },
    disable: function () {
      try { localStorage.removeItem("dw_cloud"); localStorage.removeItem(SESS_KEY); } catch (_) {}
    },
    isEnabled: isOn,

    // رفع الملف غير الحسّاس (upsert على user_id)
    syncUp: function (data) {
      if (!isOn()) return Promise.resolve(false);
      return getSession().then(function (sess) {
        var h = authHeaders(sess);
        h.prefer = "resolution=merge-duplicates,return=minimal";
        return fetch(URL_BASE + "/rest/v1/profiles?on_conflict=user_id", {
          method: "POST",
          headers: h,
          body: JSON.stringify([{ user_id: sess.user_id, data: data || {} }])
        }).then(function (r) { return r.ok; });
      }).catch(function () { return false; });
    },

    // جلب الملف من السحابة (يرجّع data أو null)
    syncDown: function () {
      if (!isOn()) return Promise.resolve(null);
      return getSession().then(function (sess) {
        return fetch(
          URL_BASE + "/rest/v1/profiles?select=data&user_id=eq." + sess.user_id,
          { headers: authHeaders(sess) }
        ).then(function (r) { return r.ok ? r.json() : []; })
         .then(function (rows) { return (rows && rows[0] && rows[0].data) || null; });
      }).catch(function () { return null; });
    }
  };

  window.Cloud = Cloud;
})();
