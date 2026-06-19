/* ============================================================
   الفريج الحيّ — محرّك المشهد والكوريوغرافيا (freej.js)
   ------------------------------------------------------------
   يعرّض window.Freej = { mount(el), summon(radar), react(result), reset() }
   - مشهد SVG مسطّح: مبانٍ + ٢٤ شخصية تتحرّك وتتحاور.
   - مستهلك بصري لعقد بيانات المحرّك/الـAPI — لا يغيّره أبداً.
   - يستورد PERSONAS من window.DiwaniyaEngine.
   ============================================================ */
(function(){
  "use strict";

  var ENG = window.DiwaniyaEngine || {};
  var PERSONAS = ENG.PERSONAS || [];
  var byId = {}, byName = {};
  PERSONAS.forEach(function(p){ byId[p.id]=p; byName[p.name]=p; });

  // ===== مواقع الشخصيات الأصلية (نسبة مئوية من المسرح) =====
  var HOME = {
    // النواة + الديوانية المركزية
    bunasser:[50,44], jasim:[43,52], faisal:[57,52],
    // المسجد
    sheikh:[17,27], hussain:[28,30],
    // المخفر
    noura:[81,27],
    // السوق
    bukhaled:[14,73], abuammar:[24,83], rami:[34,75],
    // البيوت
    omfahad:[68,73], haya:[80,71], sara:[70,85], mona:[85,83],
    // طرف البدو
    mtaab:[10,56],
    // بوابة الزوّار (أعلى)
    abdulrahman:[40,11], james:[50,8], george:[60,11],
    // حيّ المحتوى
    sultan:[91,49],
    // الأطراف المظلمة (الطيف السلبي)
    toxicfan:[6,40], troll:[95,42], reckless:[6,88], provocateur:[95,88],
    opportunist:[94,15], religanger:[6,15]
  };

  // ===== المباني =====
  var BUILDINGS = [
    { key:"gate",     label:"بوابة الفريج", x:50, y:9,  dims:[] },
    { key:"mosque",   label:"المسجد",       x:22, y:24, dims:["religion","sect","timing"] },
    { key:"police",   label:"المخفر",       x:81, y:22, dims:["legal"] },
    { key:"diwaniya", label:"الديوانية",    x:50, y:55, dims:[] },
    { key:"market",   label:"السوق",        x:22, y:81, dims:["reputation"] },
    { key:"houses",   label:"البيوت",       x:78, y:81, dims:["women"] }
  ];

  var CENTER = [50, 53];
  var GOLD="#B8862F", SAND="#F3EEE3", TEAL="#0E6B54", DTEAL="#0A4537",
      DANGER="#C0392B", SAFE="#1D9E75", WARN="#BA7517", CHAR="#2E2A24", BRICK="#C98A5E";

  // ===== رسومات المباني (SVG مسطّح فاخر) =====
  function buildingSVG(key){
    switch(key){
      case "diwaniya": return ''+
        '<svg width="118" height="74" viewBox="0 0 118 74">'+
        '<rect x="6" y="26" width="106" height="40" rx="4" fill="'+DTEAL+'"/>'+
        '<rect x="6" y="26" width="106" height="9" fill="'+TEAL+'"/>'+
        '<polygon points="59,4 112,26 6,26" fill="'+GOLD+'"/>'+
        '<polygon points="59,11 100,26 18,26" fill="#caa24f"/>'+
        arches(16,40,5,18,22,"#0c5743")+
        '<rect x="0" y="66" width="118" height="6" rx="3" fill="#d8c39a"/>'+
        '</svg>';
      case "mosque": return ''+
        '<svg width="92" height="78" viewBox="0 0 92 78">'+
        '<rect x="10" y="34" width="62" height="36" rx="4" fill="#f4efe3" stroke="'+TEAL+'" stroke-width="1.5"/>'+
        '<path d="M41 14 c-14 4 -16 20 0 20 16 0 14 -16 0 -20 z" fill="'+TEAL+'"/>'+
        '<rect x="39" y="6" width="4" height="9" fill="'+GOLD+'"/><circle cx="41" cy="5" r="3" fill="'+GOLD+'"/>'+
        '<rect x="74" y="20" width="9" height="50" rx="2" fill="#efe8d8" stroke="'+TEAL+'" stroke-width="1.2"/>'+
        '<rect x="74" y="20" width="9" height="7" fill="'+TEAL+'"/><circle cx="78.5" cy="17" r="3" fill="'+GOLD+'"/>'+
        arches(16,46,4,12,18,TEAL)+
        '<rect x="2" y="70" width="88" height="6" rx="3" fill="#d8c39a"/>'+
        '</svg>';
      case "police": return ''+
        '<svg width="86" height="70" viewBox="0 0 86 70">'+
        '<rect x="8" y="22" width="70" height="42" rx="3" fill="#e9eef0" stroke="#4a6b73" stroke-width="1.5"/>'+
        '<rect x="8" y="22" width="70" height="11" fill="#33525a"/>'+
        '<text x="43" y="31" font-size="9" fill="#fff" text-anchor="middle" font-family="sans-serif">مخفر</text>'+
        windows(18,40,3,12,16,"#9fc0c8")+
        '<rect x="38" y="50" width="12" height="14" fill="#33525a"/>'+
        '<rect x="40" y="6" width="2.5" height="16" fill="#7a7066"/>'+
        '<polygon points="42,6 56,10 42,14" fill="'+DANGER+'"/>'+
        '<rect x="2" y="64" width="82" height="6" rx="3" fill="#cfd7d4"/>'+
        '</svg>';
      case "market": return ''+
        '<svg width="96" height="66" viewBox="0 0 96 66">'+
        '<rect x="10" y="30" width="76" height="30" rx="3" fill="#efe6d2" stroke="'+WARN+'" stroke-width="1.3"/>'+
        awning(10,22,76,GOLD)+
        '<rect x="20" y="40" width="14" height="20" fill="#b98b4a"/>'+
        '<rect x="42" y="40" width="14" height="20" fill="#b98b4a"/>'+
        '<rect x="64" y="40" width="14" height="20" fill="#b98b4a"/>'+
        '<rect x="2" y="60" width="92" height="6" rx="3" fill="#d8c39a"/>'+
        '</svg>';
      case "houses": return ''+
        '<svg width="100" height="66" viewBox="0 0 100 66">'+
        house(4,26,34,SAND,BRICK)+ house(36,18,40,"#fbf6ec",TEAL)+ house(72,30,26,SAND,GOLD)+
        '<rect x="0" y="60" width="100" height="6" rx="3" fill="#d8c39a"/>'+
        '</svg>';
      case "gate": return ''+
        '<svg width="84" height="46" viewBox="0 0 84 46">'+
        '<rect x="6" y="14" width="12" height="30" rx="2" fill="'+DTEAL+'"/>'+
        '<rect x="66" y="14" width="12" height="30" rx="2" fill="'+DTEAL+'"/>'+
        '<path d="M6 16 Q42 -8 78 16" fill="none" stroke="'+GOLD+'" stroke-width="6"/>'+
        '<circle cx="42" cy="5" r="3.5" fill="'+GOLD+'"/>'+
        '</svg>';
    }
    return "";
  }
  function arches(x,y,n,w,h,fill){
    var s="", gap=(w+4); for(var i=0;i<n;i++){ var cx=x+i*gap;
      s+='<path d="M'+cx+' '+(y+h)+' v-'+(h-w/2)+' a'+(w/2)+' '+(w/2)+' 0 0 1 '+w+' 0 v'+(h-w/2)+' z" fill="'+fill+'"/>'; }
    return s;
  }
  function windows(x,y,n,w,h,fill){
    var s="", gap=(w+7); for(var i=0;i<n;i++){ s+='<rect x="'+(x+i*gap)+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1.5" fill="'+fill+'"/>'; }
    return s;
  }
  function awning(x,y,w,fill){
    var s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="9" fill="'+fill+'"/>', n=Math.floor(w/12);
    for(var i=0;i<n;i++){ if(i%2===0) s+='<rect x="'+(x+i*12)+'" y="'+y+'" width="12" height="9" fill="#fff" opacity=".55"/>'; }
    return s;
  }
  function house(x,w,h,wall,roof){
    return '<rect x="'+x+'" y="'+(60-h)+'" width="'+w+'" height="'+h+'" fill="'+wall+'" stroke="'+roof+'" stroke-width="1.2"/>'+
           '<polygon points="'+(x-2)+','+(60-h)+' '+(x+w/2)+','+(60-h-12)+' '+(x+w+2)+','+(60-h)+'" fill="'+roof+'"/>'+
           '<rect x="'+(x+w/2-4)+'" y="'+(60-12)+'" width="8" height="12" fill="'+roof+'" opacity=".7"/>';
  }

  // ===== الحالة الداخلية =====
  var scene=null, vignette=null, hud=null, toast=null;
  var avaEls={};       // id -> element
  var bubbleEls=[];    // فقاعات الجولة الحالية
  var timers=[];       // مؤقتات الجولة (للإلغاء)
  var mounted=false;

  function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
  function later(fn,ms){ var t=setTimeout(fn,ms); timers.push(t); return t; }

  // ===== التركيب =====
  function mount(host){
    if(!host) return;
    scene = host; scene.className="fj-scene"; scene.innerHTML="";

    vignette = el("div",{class:"fj-vignette"}); scene.appendChild(vignette);

    BUILDINGS.forEach(function(b){
      var bd = el("div",{class:"fj-building", "data-key":b.key,
        style:{ left:b.x+"%", top:b.y+"%" }});
      bd.innerHTML = buildingSVG(b.key) + '<div class="fj-blabel">'+b.label+'</div>';
      scene.appendChild(bd);
    });

    PERSONAS.forEach(function(p){
      var pos = HOME[p.id] || [50,50];
      var a = el("div",{class:"fj-ava"+(p.dark?" dark":""), "data-id":p.id,
        style:{ left:pos[0]+"%", top:pos[1]+"%", animationDelay:(Math.random()*2.5).toFixed(2)+"s" }});
      var inner = el("div",{class:"fj-ava-inner"});
      inner.style.animationDelay = (Math.random()*3).toFixed(2)+"s";
      inner.appendChild(el("div",{class:"fj-tok"}, p.emoji||"💬"));
      inner.appendChild(el("div",{class:"fj-shadow"}));
      inner.appendChild(el("div",{class:"fj-name"}, p.name));
      a.appendChild(inner);
      scene.appendChild(a);
      avaEls[p.id]=a;
    });

    toast = el("div",{class:"fj-toast"},
      el("span",{},"الديوانية تتشاور"),
      el("span",{class:"fj-dot"}), el("span",{class:"fj-dot"}), el("span",{class:"fj-dot"}));
    scene.appendChild(toast);

    hud = el("div",{class:"fj-hud"}); scene.appendChild(hud);
    mounted=true;
  }

  // ===== اختيار الطاقم محلياً (للحركة المبكّرة قبل وصول الـAPI) =====
  function pickCast(radar){
    var set={}; ["faisal","jasim","bunasser","abdulrahman","george"].forEach(function(id){set[id]=1;});
    if(radar.reputation) ["sultan","omfahad","bukhaled","bunasser","toxicfan"].forEach(function(id){set[id]=1;});
    if(radar.legal) ["noura","opportunist"].forEach(function(id){set[id]=1;});
    if(radar.religion) ["sheikh","hussain","provocateur","religanger"].forEach(function(id){set[id]=1;});
    if(radar.sect) ["hussain","religanger"].forEach(function(id){set[id]=1;});
    if(radar.women) ["sara","mona","mtaab","haya"].forEach(function(id){set[id]=1;});
    if(radar.timing) ["sheikh","religanger","hussain"].forEach(function(id){set[id]=1;});
    if(radar.reputation||radar.women) ["abuammar","haya"].forEach(function(id){set[id]=1;});
    return Object.keys(set).filter(function(id){ return byId[id]; });
  }

  // ترتيب الطاقم بقوس حول الديوانية
  function gather(ids){
    var n=ids.length||1, rx=27, ry=18;
    ids.forEach(function(id,i){
      var ang = (Math.PI*2)*(i/n) - Math.PI/2;
      var x = CENTER[0] + rx*Math.cos(ang);
      var y = CENTER[1] + ry*Math.sin(ang);
      moveTo(id, x, y);
    });
    // البقية تخفت وترجع بيتها
    PERSONAS.forEach(function(p){
      if(ids.indexOf(p.id)===-1){
        var a=avaEls[p.id]; if(!a) return;
        a.classList.add("dimmed");
        var h=HOME[p.id]||[50,50]; a.style.left=h[0]+"%"; a.style.top=h[1]+"%";
      }
    });
  }
  function moveTo(id,x,y){
    var a=avaEls[id]; if(!a) return;
    a.classList.remove("dimmed");
    a.style.left=x+"%"; a.style.top=y+"%";
  }
  function homeAll(){
    PERSONAS.forEach(function(p){
      var a=avaEls[p.id]; if(!a) return;
      a.classList.remove("dimmed","speaking");
      var h=HOME[p.id]||[50,50]; a.style.left=h[0]+"%"; a.style.top=h[1]+"%";
    });
  }

  function lightBuildings(radar){
    BUILDINGS.forEach(function(b){
      var on = b.dims.some(function(d){ return radar[d]; });
      var bd = scene.querySelector('.fj-building[data-key="'+b.key+'"]');
      if(bd) bd.classList.toggle("lit", !!on);
    });
  }
  function unlightBuildings(){
    scene.querySelectorAll(".fj-building.lit").forEach(function(b){ b.classList.remove("lit"); });
  }

  function showToast(on){ if(toast) toast.classList.toggle("show", !!on); }

  // ===== المرحلة ١: SUMMON (عند الإرسال) =====
  function summon(radar){
    if(!mounted) return;
    reset(true);                 // ينظّف الجولة السابقة بلا إرجاع كامل مفاجئ
    radar = radar || {};
    lightBuildings(radar);
    var cast = pickCast(radar);
    gather(cast);
    showToast(true);
  }

  // ===== المرحلة ٣+٤: REACTIONS ثم VERDICT (عند وصول النتيجة) =====
  function react(result){
    if(!mounted){ return; }
    if(!result){ showToast(false); return; }

    // مدخل غير كافٍ: جاسم وحده يعلّق
    if(result.insufficient){
      showToast(false); homeAll();
      later(function(){ bubble("jasim", "اكتب محتوى أوضح عشان نقدر نحكم 😐", "neu"); }, 350);
      return;
    }

    var reactions = result.reactions || [];
    // طابق الأسماء بالـ id الحقيقي من النتيجة
    var ids=[], used={};
    reactions.forEach(function(rx){
      var nm = rx.persona && rx.persona.name;
      var p = nm && byName[nm];
      var id = p ? p.id : null;
      if(id && !used[id]){ used[id]=1; ids.push(id); }
    });
    if(!ids.length){ showToast(false); return; }

    // أعد التجميع على الطاقم الحقيقي
    gather(ids);
    showToast(true);

    // فقاعات تتابعية
    var STEP=950, START=650;
    reactions.forEach(function(rx, i){
      var nm = rx.persona && rx.persona.name;
      var p = nm && byName[nm]; if(!p) return;
      var tone = (rx.persona && rx.persona.dark) ? "crit" : "neu";
      later(function(){
        if(i===0) showToast(false);
        bubble(p.id, (rx.text||""), tone, nm);
      }, START + i*STEP);
    });

    // الحكم بعد آخر فقاعة
    var verdictAt = START + reactions.length*STEP + 500;
    later(function(){ showVerdict(result); }, verdictAt);
  }

  // فقاعة كلام فوق شخصية
  function bubble(id, text, tone, nameOverride){
    var a=avaEls[id]; if(!a) return;
    a.classList.add("speaking");
    var b = el("div",{class:"fj-bubble "+(tone||"neu")},
      el("span",{class:"fj-bname"}, nameOverride || (byId[id]&&byId[id].name) || ""),
      document.createTextNode(text));
    a.appendChild(b); bubbleEls.push(b);
    // إظهار بعد إطار
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ b.classList.add("show"); }); });
    // إزالة وسم المتكلّم بعد فترة (تبقى الفقاعة للقراءة حتى reset)
    later(function(){ a.classList.remove("speaking"); }, 2600);
  }

  // شريط الحكم + هالة لونية
  function showVerdict(r){
    if(!hud) return;
    var color = r.color || (/[🔴]/.test(r.verdict)?DANGER : /[🟡]/.test(r.verdict)?WARN : SAFE);
    var sp = r.split || {crit:33,neu:34,sup:33};
    hud.innerHTML="";
    hud.appendChild(el("div",{class:"fj-hud-v", style:{background:color}}, r.verdict||"—"));
    var meta = el("div",{class:"fj-hud-meta"});
    meta.appendChild(el("div",{}, "احتمال الأزمة ", el("b",{}, (r.risk!=null?r.risk:"—")+"%"),
      " · فيرال ", el("b",{}, (r.viral!=null?r.viral:"—")+"/10"),
      " · أمان ", el("b",{}, (r.safety!=null?r.safety:"—")+"/10")));
    var split = el("div",{class:"fj-hud-split"});
    split.appendChild(el("i",{style:{width:sp.crit+"%", background:DANGER}}));
    split.appendChild(el("i",{style:{width:sp.neu+"%", background:"#9C9488"}}));
    split.appendChild(el("i",{style:{width:sp.sup+"%", background:SAFE}}));
    meta.appendChild(split);
    hud.appendChild(meta);
    hud.classList.add("show");

    // هالة لونية على المشهد كله
    if(vignette){
      var rgba = color===DANGER?"rgba(192,57,43,.30)" : color===WARN?"rgba(186,117,23,.26)" : "rgba(29,158,117,.24)";
      vignette.style.boxShadow = "inset 0 0 90px "+rgba;
    }
  }

  // ===== إرجاع المشهد لوضع السكون =====
  function reset(soft){
    clearTimers();
    bubbleEls.forEach(function(b){ if(b.parentNode) b.parentNode.removeChild(b); });
    bubbleEls=[];
    if(hud){ hud.classList.remove("show"); }
    if(vignette){ vignette.style.boxShadow="inset 0 0 0 rgba(0,0,0,0)"; }
    unlightBuildings();
    showToast(false);
    PERSONAS.forEach(function(p){ var a=avaEls[p.id]; if(a) a.classList.remove("speaking"); });
    if(!soft){ homeAll(); }
  }

  // أداة بناء DOM مصغّرة
  function el(tag, attrs){
    var e=document.createElement(tag), i, kids=[].slice.call(arguments,2);
    if(attrs) Object.keys(attrs).forEach(function(k){
      var v=attrs[k];
      if(k==="style" && typeof v==="object") Object.assign(e.style,v);
      else if(k==="class") e.className=v;
      else e.setAttribute(k,v);
    });
    kids.forEach(function(k){ e.appendChild(typeof k==="string"?document.createTextNode(k):k); });
    return e;
  }

  window.Freej = { mount:mount, summon:summon, react:react, reset:reset };
})();
