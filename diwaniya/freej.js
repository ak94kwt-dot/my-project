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

  // ===== رسومات المباني — مجسمات أيزومترية low-poly بثلاثة أوجه مظللة =====
  // إسقاط 2:1: المحور الشرقي e=(1,0.5)، الشمالي n=(-1,0.5)، الارتفاع للأعلى.
  // الإحداثيات تُحسب برمجياً (أدقّ من الرسم اليدوي) لإعطاء «ظلال مخبوزة».
  function pt(x,y){ return (Math.round(x*10)/10)+","+(Math.round(y*10)/10); }
  function poly(points, fill, extra){
    return '<polygon points="'+points.map(function(p){return pt(p[0],p[1]);}).join(" ")+'" fill="'+fill+'"'+(extra||"")+'/>';
  }
  // منشور أيزومتري: (fx,fy) ركن المقدّمة السفلي · w شرقاً · d شمالاً · h ارتفاعاً
  function isoPrism(fx,fy,w,d,h,topC,leftC,rightC){
    var F=[fx,fy], R=[fx+w,fy+w/2], L=[fx-d,fy+d/2], K=[fx+w-d,fy+w/2+d/2];
    var F2=[fx,fy-h], R2=[fx+w,fy+w/2-h], L2=[fx-d,fy+d/2-h], K2=[fx+w-d,fy+w/2+d/2-h];
    return poly([F,R,R2,F2], rightC)+            // الوجه الأيمن (أغمق)
           poly([F,L,L2,F2], leftC)+             // الوجه الأيسر (متوسّط)
           poly([F2,R2,K2,L2], topC);            // السطح العلوي (أفتح)
  }
  // سقف هرمي أيزومتري فوق منشور بعرض w وعمق d وارتفاع قمّة rh، قمّته على المركز العلوي
  function isoRoof(fx,fy,w,d,rh,c1,c2){
    var F2=[fx,fy], R2=[fx+w,fy+w/2], L2=[fx-d,fy+d/2], K2=[fx+w-d,fy+w/2+d/2];
    var apex=[fx+(w-d)/2, fy+(w+d)/4 - rh];
    return poly([F2,R2,apex], c2)+poly([R2,K2,apex], c1)+
           poly([K2,L2,apex], c2)+poly([L2,F2,apex], c1);
  }

  function buildingSVG(key){
    switch(key){
      case "diwaniya": return ''+   // الديوانية: مجسم زجاجي مركزي + قبّة ذهبية
        '<svg width="132" height="104" viewBox="0 0 132 104">'+
        // ظلّ أرضي مخبوز
        poly([[66,84],[104,103],[66,122],[28,103]], "rgba(46,42,36,.16)", ' opacity=".5"')+
        isoPrism(66,84,42,30,40, "#15705a","#0c4f3f","#0a3f33")+
        // ألواح زجاج (خطوط فاتحة على السطح والأوجه)
        '<g stroke="#3f9f86" stroke-width="1" opacity=".55">'+
          '<line x1="66" y1="44" x2="108" y2="65"/><line x1="66" y1="44" x2="24" y2="65"/>'+
          '<line x1="80" y1="51" x2="80" y2="79"/><line x1="52" y1="51" x2="52" y2="79"/>'+
        '</g>'+
        // قبّة ذهبية + هلال
        '<ellipse cx="66" cy="40" rx="15" ry="9" fill="'+GOLD+'"/>'+
        '<path d="M58 40 a9 9 0 0 1 16 0 z" fill="#caa24f"/>'+
        '<circle cx="66" cy="27" r="3" fill="'+GOLD+'"/>'+
        '</svg>';
      case "mosque": return ''+   // المسجد: مجسم + قبّة + مئذنة
        '<svg width="116" height="104" viewBox="0 0 116 104">'+
        poly([[52,80],[86,97],[52,114],[18,97]], "rgba(46,42,36,.15)", ' opacity=".5"')+
        isoPrism(52,80,32,26,24, "#f3eee1","#d9d0bd","#cbc1ab")+
        // قبّة
        '<ellipse cx="52" cy="56" rx="14" ry="9" fill="'+TEAL+'"/>'+
        '<path d="M45 56 a7 7 0 0 1 14 0 z" fill="#0c5743"/>'+
        '<rect x="50.5" y="44" width="3" height="9" fill="'+GOLD+'"/><circle cx="52" cy="43" r="2.6" fill="'+GOLD+'"/>'+
        // مئذنة (منشور رفيع)
        isoPrism(92,74,7,7,42, "#efe8d8","#dcd3c0","#cfc6b1")+
        '<rect x="88.5" y="30" width="7" height="5" fill="'+TEAL+'"/><circle cx="92" cy="28" r="2.4" fill="'+GOLD+'"/>'+
        '</svg>';
      case "police": return ''+   // المخفر: مجسم رمادي + سارية وعلم
        '<svg width="110" height="98" viewBox="0 0 110 98">'+
        poly([[50,76],[84,93],[50,110],[16,93]], "rgba(46,42,36,.15)", ' opacity=".5"')+
        isoPrism(50,76,34,24,22, "#e7edee","#c2ced0","#b3c0c2")+
        // شريط علوي داكن
        poly([[50,54],[84,71],[50,88],[16,71]], "#33525a", ' opacity=".9"')+
        // سارية + علم
        '<rect x="84" y="34" width="2.4" height="30" fill="#7a7066"/>'+
        poly([[86,34],[99,38],[86,42]], DANGER)+
        '</svg>';
      case "market": return ''+   // السوق: مجسم منخفض + مظلّة مخطّطة
        '<svg width="116" height="92" viewBox="0 0 116 92">'+
        poly([[54,70],[92,89],[54,108],[16,89]], "rgba(46,42,36,.14)", ' opacity=".5"')+
        isoPrism(54,72,38,28,16, "#efe6d2","#d6c8a8","#c9ba98")+
        // مظلّة مخطّطة (سطح مائل ذهبي/أبيض)
        '<g>'+poly([[54,52],[92,71],[54,90],[16,71]], GOLD)+
        '<g opacity=".5">'+poly([[54,52],[73,61.5],[54,71],[35,61.5]], "#fff")+
        poly([[73,61.5],[92,71],[73,80.5],[54,71]], "#fff")+'</g></g>'+
        '</svg>';
      case "houses": return ''+   // البيوت: ٣ مجسمات بسقوف هرمية
        '<svg width="124" height="92" viewBox="0 0 124 92">'+
        poly([[60,66],[100,86],[60,106],[20,86]], "rgba(46,42,36,.13)", ' opacity=".45"')+
        isoPrism(40,66,22,18,16, SAND,"#e6dcc6","#d9cdb2")+ isoRoof(40,50,22,18,9, BRICK,"#b97f54")+
        isoPrism(74,72,20,16,20, "#fbf6ec","#e9e0cd","#dcd2bb")+ isoRoof(74,52,20,16,9, TEAL,"#0c5743")+
        isoPrism(100,70,16,14,13, SAND,"#e6dcc6","#d9cdb2")+ isoRoof(100,57,16,14,7, GOLD,"#caa24f")+
        '</svg>';
      case "gate": return ''+   // البوابة: عمودان أيزومتريان + قوس ذهبي
        '<svg width="104" height="74" viewBox="0 0 104 74">'+
        isoPrism(22,58,8,8,34, DTEAL,"#083b30","#062f26")+
        isoPrism(86,46,8,8,34, DTEAL,"#083b30","#062f26")+
        '<path d="M22 26 Q54 -2 86 14" fill="none" stroke="'+GOLD+'" stroke-width="5"/>'+
        '<circle cx="54" cy="8" r="3.4" fill="'+GOLD+'"/>'+
        '</svg>';
    }
    return "";
  }

  // ===== الحالة الداخلية =====
  var scene=null, vignette=null, hud=null, toast=null, splines=null;
  var avaEls={};       // id -> element
  var bubbleEls=[];    // فقاعات الجولة الحالية
  var timers=[];       // مؤقتات الجولة (للإلغاء)
  var mounted=false, focusedId=null;

  function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
  function later(fn,ms){ var t=setTimeout(fn,ms); timers.push(t); return t; }

  // ===== طبقة الأرض الأيزومترية (شبكة معيّنات + ساحة + شوارع + حدائق + ماء) =====
  function mapBaseSVG(){
    var land="#FAF5EB", land2="#F3EBD9", grid="#EAddc4", road="#E4D7BD", roadc="#FBF4E4",
        plaza="#F5EFE1", ring="#DFCFAE", park="#CFE0BE", park2="#C0D6AC", water="#BCDAD2";
    // شوارع من الساحة (80,55) لكل حيّ — بميل أيزومتري
    var spokes='<path d="M80 55 L80 12"/>'+
               '<path d="M80 55 L35 26"/>'+
               '<path d="M80 55 L129 24"/>'+
               '<path d="M80 55 L35 80"/>'+
               '<path d="M80 55 L125 80"/>';
    // شبكة معيّنات أيزومترية خفيفة (ميل ±0.5)
    var g="";
    for(var i=-8;i<=16;i++){ var o=i*16;
      g+='<line x1="'+(o)+'" y1="'+(0)+'" x2="'+(o+80)+'" y2="100"/>';
      g+='<line x1="'+(o)+'" y1="'+(0)+'" x2="'+(o-80)+'" y2="100"/>';
    }
    return ''+
    '<svg viewBox="0 0 160 100" preserveAspectRatio="none" width="100%" height="100%">'+
      '<rect width="160" height="100" fill="'+land+'"/>'+
      // تموّج لوني خفيف بالأرض
      '<ellipse cx="80" cy="55" rx="92" ry="60" fill="'+land2+'" opacity=".5"/>'+
      // شبكة المعيّنات
      '<g stroke="'+grid+'" stroke-width=".5" opacity=".5">'+g+'</g>'+
      // حدائق (معيّنات خضراء)
      poly([[30,16],[46,24],[30,32],[14,24]], park, ' opacity=".7"')+
      poly([[140,86],[154,93],[140,100],[126,93]], park, ' opacity=".6"')+
      poly([[126,40],[138,46],[126,52],[114,46]], park2, ' opacity=".55"')+
      // مسطّح مائي (ركن)
      '<path d="M0 100 Q24 86 12 70 Q5 62 0 64 Z" fill="'+water+'" opacity=".6"/>'+
      // الشوارع (طبقة سفلية عريضة + خطّ مركزي منقّط)
      '<g fill="none" stroke="'+road+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">'+spokes+'</g>'+
      '<g fill="none" stroke="'+roadc+'" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.1 5">'+spokes+'</g>'+
      // الساحة المركزية (معيّن أيزومتري + حلقة + قلب أخضر)
      poly([[80,40],[103,55],[80,70],[57,55]], plaza, ' stroke="'+ring+'" stroke-width="1.6"')+
      poly([[80,48],[92,55],[80,62],[68,55]], park, ' opacity=".6"')+
    '</svg>';
  }

  // ===== التركيب =====
  function mount(host){
    if(!host) return;
    scene = host; scene.className="fj-scene"; scene.innerHTML="";

    var basemap = el("div",{class:"fj-basemap"}); basemap.innerHTML = mapBaseSVG();
    scene.appendChild(basemap);

    // طبقة خطوط العدوى (SVG overlay بإحداثيات 0..100 تطابق نسب المواقع)
    splines = el("div",{class:"fj-splines"});
    splines.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"></svg>';
    scene.appendChild(splines);

    vignette = el("div",{class:"fj-vignette"}); scene.appendChild(vignette);

    // نقر الخلفية يلغي التركيز
    scene.addEventListener("click", function(ev){ if(ev.target===scene || ev.target===basemap) focusOff(); });

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
      inner.appendChild(el("div",{class:"fj-face"}));
      inner.appendChild(el("div",{class:"fj-tok"}, p.emoji||"💬"));
      inner.appendChild(el("div",{class:"fj-shadow"}));
      inner.appendChild(el("div",{class:"fj-name"}, p.name));
      a.appendChild(inner);
      (function(id){ a.addEventListener("click", function(ev){ ev.stopPropagation(); focusOn(id); }); })(p.id);
      scene.appendChild(a);
      avaEls[p.id]=a;
    });

    toast = el("div",{class:"fj-toast"},
      el("span",{},"ناقشنا يتشاورون"),
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

  // ===== المرحلة ٣+٤: نقاش حيّ + عدوى مزاجية ثم حكم متأثّر بالنقاش =====
  var ROUNDS = 4;

  function react(result, onComplete){
    if(!mounted){ if(onComplete) onComplete(result); return; }
    if(!result){ showToast(false); if(onComplete) onComplete(result); return; }

    // مدخل غير كافٍ: جاسم وحده يعلّق
    if(result.insufficient){
      showToast(false); homeAll();
      later(function(){ bubble("jasim", "اكتب محتوى أوضح عشان نقدر نحكم 😐", "neu"); }, 350);
      if(onComplete) onComplete(result);
      return;
    }

    var reactions = result.reactions || [];
    // طابق الأسماء بالـ id الحقيقي من النتيجة
    var ids=[], used={}, rxById={};
    reactions.forEach(function(rx){
      var nm = rx.persona && rx.persona.name;
      var p = nm && byName[nm];
      var id = p ? p.id : null;
      if(id && !used[id]){ used[id]=1; ids.push(id); rxById[id]=rx; }
    });
    if(!ids.length){ showToast(false); if(onComplete) onComplete(result); return; }

    // يتلاقون ثنائيات ويتواجهون
    gatherPairs(ids);
    showToast(true);

    var baseRisk = (result.risk!=null ? result.risk : 35);
    var darkSet={};
    ids.forEach(function(id){ if(rxById[id].persona && rxById[id].persona.dark) darkSet[id]=1; });

    // مزاج أوّلي لكل شخصية (الأغلب يبدأ مرتاح/محايد، الطيف السلبي معصّب)
    var seed = ids.map(function(id){ return seedMood(rxById[id], baseRisk); });

    // نحاكي كل الجولات مرّة وحدة ونسجّل «منو سحب منو» (provenance)
    var sim = simulate(ids, seed, darkSet);

    var START=650, ROUND_MS=1050;

    // إظهار الوجوه الأولية
    later(function(){
      showToast(false);
      ids.forEach(function(id,i){ applyMood(id, sim.frames[0][i], true); });
    }, START);

    // جولات النقاش — العدوى تنتشر (نعرض الإطارات المحسوبة مسبقاً)
    for(var rnd=1; rnd<=ROUNDS; rnd++){
      (function(fr){
        later(function(){
          ids.forEach(function(id,i){ applyMood(id, sim.frames[fr][i], true); });
        }, START + fr*ROUND_MS);
      })(rnd);
    }

    // الحكم + التحليل بعد ما يخلص النقاش
    var endAt = START + (ROUNDS+1)*ROUND_MS + 200;
    later(function(){
      var adjusted = computeAdjusted(result, sim.finalMoods);
      adjusted.analysis = buildAnalysis(ids, seed, sim, darkSet);
      showVerdict(adjusted);
      drawSplines(ids, sim);                         // خطوط «منو أثّر على منو»
      if(onComplete) onComplete(adjusted);
    }, endAt);
  }

  // ===== نموذج المزاج والعدوى =====
  function clampN(v,lo,hi){ return v<lo?lo:(v>hi?hi:v); }
  function mean(a){ var s=0; a.forEach(function(x){s+=x;}); return a.length?s/a.length:0; }

  // مزاج أوّلي: السلبي معصّب، الباقي يبدأ مرتاح/محايد حسب خطورة المحتوى
  function seedMood(rx, baseRisk){
    var dark = rx.persona && rx.persona.dark;
    if(dark) return clampN(-1.3 + (Math.random()*0.4-0.2), -2, 2);
    var base = baseRisk>=55 ? -0.2 : baseRisk>=25 ? 0.45 : 0.95;
    return clampN(base + (Math.random()*0.6-0.3), -2, 2);
  }

  // محاكاة كل الجولات + تتبّع منو أثّر على منو
  // العصب يعدّي أسرع، والطيف السلبي يصعّد جيرانه
  function simulate(ids, seed, darkSet){
    var n=ids.length, moods=seed.slice();
    var frames=[moods.slice()];
    var infl=ids.map(function(){ return {}; });   // i -> { influencerId: weight }
    for(var r=0;r<ROUNDS;r++){
      var avg=mean(moods), next=[];
      for(var i=0;i<n;i++){
        var li=(i-1+n)%n, ri=(i+1)%n;
        var a=moods[li], b=moods[ri], neigh=(a+b)/2, before=moods[i];
        var w = neigh<0 ? 0.55 : 0.38;
        var m = before*(1-w) + neigh*w;
        var darkN = darkSet[ids[li]] ? ids[li] : (darkSet[ids[ri]] ? ids[ri] : null);
        if(darkSet[ids[li]] || darkSet[ids[ri]]) m -= 0.40;
        m += (avg<0 ? avg*0.12 : avg*0.05);
        if(darkSet[ids[i]]) m = Math.min(m, -0.85) - 0.05;
        m = clampN(m, -2, 2);
        next.push(m);
        var delta = m - before;
        if(Math.abs(delta) > 0.05){
          var cand = (delta<0 && darkN) ? darkN
                   : (Math.abs(a-before) >= Math.abs(b-before) ? ids[li] : ids[ri]);
          infl[i][cand] = (infl[i][cand]||0) + Math.abs(delta);
        }
      }
      moods=next; frames.push(moods.slice());
    }
    return { frames:frames, infl:infl, finalMoods:moods };
  }

  // بناء تقرير التحليل: منو تواجه منو · وش صار لكل واحد · منو أثّر · استنتاجات
  function buildAnalysis(ids, seed, sim, darkSet){
    var nameOf=function(id){ return (byId[id]&&byId[id].name)||id; };
    var emojiOf=function(id){ return (byId[id]&&byId[id].emoji)||"💬"; };
    var fin=sim.finalMoods;
    var pairs=[];
    for(var k=0;k<ids.length;k+=2){
      var pr=ids.slice(k,k+2).map(nameOf); if(pr.length) pairs.push(pr);
    }
    var people=[], changedCount=0, angered=0, calmed=0, inflTally={};
    ids.forEach(function(id,i){
      var s=seed[i], f=fin[i], d=f-s;
      var changed = (s>0.2 && f<-0.2) || (s<-0.2 && f>0.2) || Math.abs(d)>=1.0;
      var dir = changed ? (d<0 ? "angered" : "calmed") : "steady";
      var inf=sim.infl[i], topId=null, topW=0;
      Object.keys(inf).forEach(function(cid){ if(inf[cid]>topW){ topW=inf[cid]; topId=cid; } });
      var infName = topId ? nameOf(topId) : null;
      var viaDark = topId ? !!darkSet[topId] : false;
      if(changed){ changedCount++; if(dir==="angered") angered++; else calmed++;
        if(topId) inflTally[topId]=(inflTally[topId]||0)+1; }
      var line;
      if(dir==="angered") line = "بدأ "+faceFor(s)+" ← انعصب "+faceFor(f)+(infName?("، أثّر عليه "+infName+(viaDark?" (متصيّد)":"")):"");
      else if(dir==="calmed") line = "بدأ "+faceFor(s)+" ← هدأ "+faceFor(f)+(infName?("، طمّنه "+infName):"");
      else line = "ثابت على موقفه "+faceFor(f);
      people.push({ id:id, name:nameOf(id), emoji:emojiOf(id), changed:changed,
        direction:dir, influencer:infName, viaDark:viaDark, line:line });
    });
    var topInf=null, tw=0;
    Object.keys(inflTally).forEach(function(cid){ if(inflTally[cid]>tw){ tw=inflTally[cid]; topInf=cid; } });
    var g=mean(fin);
    var mood = g<=-0.4 ? "اشتعل" : g>=0.4 ? "هدأ" : "بقي متوازن";
    var overall = "النقاش "+mood+": "+changedCount+" غيّروا رأيهم ("+angered+" انعصبوا، "+calmed+" هدّوا)"+
                  (topInf?("، وأكثر تأثير كان لـ"+nameOf(topInf)):"")+".";
    return { pairs:pairs, people:people,
      summary:{ changedCount:changedCount, angered:angered, calmed:calmed,
                topInfluencer: topInf?nameOf(topInf):null, overall:overall } };
  }

  // الحكم النهائي متأثّر بالنقاش (دراما عالية — يقدر يقلب الكفّة)
  function computeAdjusted(result, moods){
    var g = mean(moods);
    var base = (result.risk!=null ? result.risk : 35);
    var delta = Math.round(-g * 24);                 // حتى ±~48٪
    var after = Math.round(clampN(base + delta, 2, 98));
    var t = tier(after);
    var crit=0, sup=0;
    moods.forEach(function(m){ if(m<=-0.3) crit++; else if(m>=0.5) sup++; });
    var total=moods.length||1;
    var critP=Math.round(crit/total*100), supP=Math.round(sup/total*100);
    var neuP=Math.max(0, 100-critP-supP);
    var reason = delta>=5  ? ("🔥 العصب انتشر بالنقاش +"+delta+"٪") :
                 delta<=-5 ? ("🌿 هدّوا بعض "+delta+"٪") :
                             "النقاش ما غيّر الكفّة كثير";
    var adj={}; for(var k in result){ if(result.hasOwnProperty(k)) adj[k]=result[k]; }
    adj.risk=after; adj.verdict=t.verdict; adj.color=t.color;
    adj.split={crit:critP, neu:neuP, sup:supP};
    adj.debate={ before:base, after:after, delta:delta, reason:reason };
    return adj;
  }
  function tier(risk){
    if(risk>=55) return {verdict:"🔴 خطر — لا تنشر", color:DANGER};
    if(risk>=25) return {verdict:"🟡 عدّل قبل النشر", color:WARN};
    return {verdict:"🟢 انشر بثقة", color:SAFE};
  }

  // الوجوه
  function faceFor(m){ return m>=1.1?"😄":m>=0.4?"🙂":m>-0.4?"😐":m>-1.1?"😠":"😡"; }
  function moodClass(m){ return m<=-0.4?"m-angry":(m>=0.4?"m-happy":"m-neu"); }
  function applyMood(id, m, animate){
    var a=avaEls[id]; if(!a) return;
    var face=a.querySelector(".fj-face"); if(face) face.textContent=faceFor(m);
    a.classList.remove("m-angry","m-happy","m-neu"); a.classList.add(moodClass(m));
    if(animate){ a.classList.remove("fj-react"); void a.offsetWidth; a.classList.add("fj-react"); }
  }

  // يتلاقون ثنائيات تتواجه حول الديوانية
  function gatherPairs(ids){
    var pairs=[]; for(var i=0;i<ids.length;i+=2){ pairs.push(ids.slice(i,i+2)); }
    var np=pairs.length||1, rx=30, ry=20;
    pairs.forEach(function(pair,pi){
      var ang=(Math.PI*2)*(pi/np) - Math.PI/2;
      var cx=CENTER[0]+rx*Math.cos(ang), cy=CENTER[1]+ry*Math.sin(ang);
      pair.forEach(function(id,k){
        var dx = pair.length>1 ? (k===0?-6:6) : 0;
        moveTo(id, cx+dx, cy);
      });
    });
    PERSONAS.forEach(function(p){
      if(ids.indexOf(p.id)===-1){ var a=avaEls[p.id]; if(!a) return;
        a.classList.add("dimmed"); var h=HOME[p.id]||[50,50]; a.style.left=h[0]+"%"; a.style.top=h[1]+"%"; }
    });
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
    if(r.debate){
      meta.appendChild(el("div",{}, "بدأ ", el("b",{}, r.debate.before+"٪"),
        " ← بعد النقاش ", el("b",{}, r.debate.after+"٪"), " · ", r.debate.reason));
      meta.appendChild(el("div",{}, "فيرال ", el("b",{}, (r.viral!=null?r.viral:"—")+"/10"),
        " · أمان ", el("b",{}, (r.safety!=null?r.safety:"—")+"/10")));
    } else {
      meta.appendChild(el("div",{}, "احتمال الأزمة ", el("b",{}, (r.risk!=null?r.risk:"—")+"%"),
        " · فيرال ", el("b",{}, (r.viral!=null?r.viral:"—")+"/10"),
        " · أمان ", el("b",{}, (r.safety!=null?r.safety:"—")+"/10")));
    }
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

  // ===== التركيز بالنقر (تكبير ناعم نحو الشخصية + تعتيم الباقي) =====
  function pctNum(v){ return parseFloat(v)||50; }
  function focusOn(id){
    var a=avaEls[id]; if(!a||!scene) return;
    if(focusedId===id){ focusOff(); return; }
    focusedId=id;
    scene.style.transformOrigin = pctNum(a.style.left)+"% "+pctNum(a.style.top)+"%";
    scene.style.transform = "scale(1.5)";
    scene.classList.add("fj-zoom");
    PERSONAS.forEach(function(p){ var e=avaEls[p.id]; if(e) e.classList.toggle("fj-focus", p.id===id); });
  }
  function focusOff(){
    if(!scene) return;
    focusedId=null;
    scene.style.transform=""; scene.style.transformOrigin="";
    scene.classList.remove("fj-zoom");
    scene.querySelectorAll(".fj-ava.fj-focus").forEach(function(e){ e.classList.remove("fj-focus"); });
  }

  // ===== خطوط العدوى (منو أثّر على منو) =====
  function svgEl(name, attrs){
    var e=document.createElementNS("http://www.w3.org/2000/svg", name);
    if(attrs) Object.keys(attrs).forEach(function(k){ e.setAttribute(k, attrs[k]); });
    return e;
  }
  function clearSplines(){
    if(!splines) return; var svg=splines.querySelector("svg"); if(!svg) return;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
  }
  function drawSplines(ids, sim){
    if(!splines) return; var svg=splines.querySelector("svg"); if(!svg) return;
    clearSplines();
    ids.forEach(function(id,i){
      var inf=sim.infl[i], topId=null, tw=0;
      Object.keys(inf).forEach(function(cid){ if(inf[cid]>tw){ tw=inf[cid]; topId=cid; } });
      if(!topId) return;
      var a=avaEls[id], b=avaEls[topId]; if(!a||!b) return;
      var x1=pctNum(b.style.left), y1=pctNum(b.style.top);
      var x2=pctNum(a.style.left), y2=pctNum(a.style.top);
      var mx=(x1+x2)/2, my=(y1+y2)/2 - 9;
      var m=sim.finalMoods[i];
      var col = m<=-0.3?DANGER : (m>=0.5?SAFE:GOLD);
      svg.appendChild(svgEl("path",{ d:"M"+x1+" "+y1+" Q"+mx+" "+my+" "+x2+" "+y2,
        fill:"none", stroke:col, "stroke-width":"0.55", "stroke-dasharray":"0.6 1.9",
        "stroke-linecap":"round", opacity:"0.7", "class":"fj-spline" }));
      svg.appendChild(svgEl("circle",{ cx:x2, cy:y2, r:"0.9", fill:col, opacity:"0.85" }));
    });
    splines.classList.add("show");
  }

  // ===== إرجاع المشهد لوضع السكون =====
  function reset(soft){
    clearTimers();
    bubbleEls.forEach(function(b){ if(b.parentNode) b.parentNode.removeChild(b); });
    bubbleEls=[];
    clearSplines(); if(splines) splines.classList.remove("show");
    focusOff();
    if(hud){ hud.classList.remove("show"); }
    if(vignette){ vignette.style.boxShadow="inset 0 0 0 rgba(0,0,0,0)"; }
    unlightBuildings();
    showToast(false);
    PERSONAS.forEach(function(p){
      var a=avaEls[p.id]; if(!a) return;
      a.classList.remove("speaking","m-angry","m-happy","m-neu","fj-react");
      var f=a.querySelector(".fj-face"); if(f) f.textContent="";
    });
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
