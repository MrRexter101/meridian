/* MERIDIAN · i18n
   ────────────────────────────────────────────────────────────────────
   Interface chrome is translated. LESSON CONTENT IS NOT, and that is a
   deliberate call: this is technical credit-risk material where a
   mistranslation of "expected loss" or "significant increase in credit
   risk" would teach the wrong thing. The switcher carries a standing
   notice saying so, and each language is marked for native review.
   Replace a `reviewed:false` block once a speaker has checked it. */
(function(M){
'use strict';

M.LANGS = [
  { code:'en', name:'English',  native:'English',      reviewed:true  },
  { code:'dz', name:'Dzongkha', native:'རྫོང་ཁ',        reviewed:false },
  { code:'ne', name:'Nepali',   native:'नेपाली',         reviewed:false },
  { code:'hi', name:'Hindi',    native:'हिन्दी',          reviewed:false },
  { code:'bn', name:'Bengali',  native:'বাংলা',          reviewed:false },
  { code:'zh', name:'Mandarin', native:'中文',           reviewed:false },
  { code:'th', name:'Thai',     native:'ไทย',            reviewed:false }
];

var S = {
  en:{ dashboard:'Dashboard', tour:'The Tour', awards:'Awards', cohort:'Cohort',
       notes:'Field Notes', desk:'The desk', file:'The file', resources:'Resources', thanks:'Thank you', theme:'Theme', reset:'Reset my progress',
       signout:'Sign out', signin:'Begin', yourName:'Your full name', accessCode:'Access code',
       greeting:'Good to see you', checkin:'Daily check-in', checkedIn:'Checked in today',
       doneToday:'Done for today', checkInNow:'Check in', rank:'Rank', experience:'Experience',
       streak:'Streak', cities:'Cities', awardsN:'Awards', day:'day', days:'days', of:'of',
       cont:'Continue', begin:'Begin', complete:'Complete', available:'Available',
       quickCheck:'Quick check', submit:'Submit', backToTour:'Back to the tour',
       nextCity:'Next city', saveNote:'Save note', everyStop:'Every stop',
       watch:'Watch', read:'Read', download:'Download', minutes:'min',
       langNotice:'Interface translated. Lesson content stays in English — mistranslating technical credit terms would teach the wrong thing.' },
  dz:{ dashboard:'དཀར་ཆག', tour:'འགྲུལ་བསྐྱོད', awards:'གཟེངས་བསྟོད', cohort:'སློབ་ཚན',
       notes:'ཞིབ་འཇུག་ཡིག་ཆ', desk:'ལས་སྒྲིག', file:'ཡིག་ཆ', resources:'ཐབས་ལམ', thanks:'ཐུགས་རྗེ་ཆེ', theme:'ཁ་དོག', reset:'སླར་འགོ་བཙུགས',
       signout:'ཕྱིར་ཐོན', signin:'འགོ་བཙུགས', yourName:'ཁྱོད་ཀྱི་མིང', accessCode:'ཨང་གྲངས',
       greeting:'མཇལ་བར་དགའ', checkin:'ཉིན་བསྟར་ཐོ་འགོད', checkedIn:'ད་རིང་ཐོ་བཀོད་ཟིན',
       doneToday:'ད་རིང་ཚར', checkInNow:'ཐོ་འགོད', rank:'གོ་གནས', experience:'ཉམས་མྱོང',
       streak:'མུ་མཐུད', cities:'གྲོང་ཁྱེར', awardsN:'གཟེངས་བསྟོད', day:'ཉིན', days:'ཉིན', of:'ནང',
       cont:'མུ་མཐུད', begin:'འགོ་བཙུགས', complete:'ཚར', available:'ཡོད',
       quickCheck:'མྱུར་བརྟག', submit:'ཕུལ', backToTour:'འགྲུལ་བསྐྱོད་ལོག',
       nextCity:'གྲོང་ཁྱེར་རྗེས་མ', saveNote:'ཉར་ཚགས', everyStop:'འགྲུལ་ས་ཡོངས',
       watch:'ལྟ', read:'ཀློག', download:'ཕབ་ལེན', minutes:'སྐར་མ' },
  ne:{ dashboard:'ड्यासबोर्ड', tour:'यात्रा', awards:'पुरस्कार', cohort:'समूह',
       notes:'फिल्ड नोट', desk:'डेस्क', file:'फाइल', resources:'स्रोत', thanks:'धन्यवाद', theme:'थिम', reset:'प्रगति रिसेट गर्नुहोस्',
       signout:'साइन आउट', signin:'सुरु गर्नुहोस्', yourName:'तपाईंको पूरा नाम', accessCode:'पहुँच कोड',
       greeting:'भेटेर खुसी लाग्यो', checkin:'दैनिक चेक-इन', checkedIn:'आज चेक-इन भयो',
       doneToday:'आजको लागि सकियो', checkInNow:'चेक-इन', rank:'श्रेणी', experience:'अनुभव',
       streak:'लगातार', cities:'सहरहरू', awardsN:'पुरस्कार', day:'दिन', days:'दिन', of:'मध्ये',
       cont:'जारी राख्नुहोस्', begin:'सुरु', complete:'सम्पन्न', available:'उपलब्ध',
       quickCheck:'छिटो जाँच', submit:'पेस गर्नुहोस्', backToTour:'यात्रामा फर्कनुहोस्',
       nextCity:'अर्को सहर', saveNote:'नोट सुरक्षित', everyStop:'हरेक पडाव',
       watch:'हेर्नुहोस्', read:'पढ्नुहोस्', download:'डाउनलोड', minutes:'मिनेट' },
  hi:{ dashboard:'डैशबोर्ड', tour:'यात्रा', awards:'पुरस्कार', cohort:'समूह',
       notes:'फ़ील्ड नोट्स', desk:'डेस्क', file:'फ़ाइल', resources:'संसाधन', thanks:'धन्यवाद', theme:'थीम', reset:'प्रगति रीसेट करें',
       signout:'साइन आउट', signin:'शुरू करें', yourName:'आपका पूरा नाम', accessCode:'एक्सेस कोड',
       greeting:'आपसे मिलकर अच्छा लगा', checkin:'दैनिक चेक-इन', checkedIn:'आज चेक-इन हो गया',
       doneToday:'आज के लिए पूरा', checkInNow:'चेक-इन करें', rank:'रैंक', experience:'अनुभव',
       streak:'लगातार', cities:'शहर', awardsN:'पुरस्कार', day:'दिन', days:'दिन', of:'में से',
       cont:'जारी रखें', begin:'शुरू', complete:'पूर्ण', available:'उपलब्ध',
       quickCheck:'त्वरित जाँच', submit:'जमा करें', backToTour:'यात्रा पर लौटें',
       nextCity:'अगला शहर', saveNote:'नोट सहेजें', everyStop:'हर पड़ाव',
       watch:'देखें', read:'पढ़ें', download:'डाउनलोड', minutes:'मिनट' },
  bn:{ dashboard:'ড্যাশবোর্ড', tour:'যাত্রা', awards:'পুরস্কার', cohort:'দল',
       notes:'ফিল্ড নোট', desk:'ডেস্ক', file:'ফাইল', resources:'সম্পদ', thanks:'ধন্যবাদ', theme:'থিম', reset:'অগ্রগতি রিসেট',
       signout:'সাইন আউট', signin:'শুরু করুন', yourName:'আপনার পুরো নাম', accessCode:'অ্যাক্সেস কোড',
       greeting:'আপনাকে দেখে ভালো লাগল', checkin:'দৈনিক চেক-ইন', checkedIn:'আজ চেক-ইন হয়েছে',
       doneToday:'আজকের জন্য শেষ', checkInNow:'চেক-ইন', rank:'পদমর্যাদা', experience:'অভিজ্ঞতা',
       streak:'ধারাবাহিক', cities:'শহর', awardsN:'পুরস্কার', day:'দিন', days:'দিন', of:'এর মধ্যে',
       cont:'চালিয়ে যান', begin:'শুরু', complete:'সম্পূর্ণ', available:'উপলব্ধ',
       quickCheck:'দ্রুত পরীক্ষা', submit:'জমা দিন', backToTour:'যাত্রায় ফিরুন',
       nextCity:'পরবর্তী শহর', saveNote:'নোট সংরক্ষণ', everyStop:'প্রতিটি স্টপ',
       watch:'দেখুন', read:'পড়ুন', download:'ডাউনলোড', minutes:'মিনিট' },
  zh:{ dashboard:'仪表板', tour:'旅程', awards:'成就', cohort:'学员',
       notes:'实地笔记', desk:'工作台', file:'档案', resources:'资源', thanks:'鸣谢', theme:'主题', reset:'重置进度',
       signout:'退出', signin:'开始', yourName:'您的全名', accessCode:'访问码',
       greeting:'很高兴见到你', checkin:'每日签到', checkedIn:'今日已签到',
       doneToday:'今日已完成', checkInNow:'签到', rank:'等级', experience:'经验',
       streak:'连续', cities:'城市', awardsN:'成就', day:'天', days:'天', of:'共',
       cont:'继续', begin:'开始', complete:'完成', available:'可进入',
       quickCheck:'快速测验', submit:'提交', backToTour:'返回旅程',
       nextCity:'下一座城市', saveNote:'保存笔记', everyStop:'所有站点',
       watch:'观看', read:'阅读', download:'下载', minutes:'分钟' },
  th:{ dashboard:'แดชบอร์ด', tour:'การเดินทาง', awards:'รางวัล', cohort:'กลุ่มผู้เรียน',
       notes:'บันทึกภาคสนาม', desk:'โต๊ะทำงาน', file:'แฟ้ม', resources:'แหล่งข้อมูล', thanks:'ขอบคุณ', theme:'ธีม', reset:'รีเซ็ตความคืบหน้า',
       signout:'ออกจากระบบ', signin:'เริ่ม', yourName:'ชื่อเต็มของคุณ', accessCode:'รหัสเข้าใช้',
       greeting:'ยินดีที่ได้พบคุณ', checkin:'เช็คอินประจำวัน', checkedIn:'เช็คอินแล้ววันนี้',
       doneToday:'เสร็จสิ้นสำหรับวันนี้', checkInNow:'เช็คอิน', rank:'ระดับ', experience:'ประสบการณ์',
       streak:'ต่อเนื่อง', cities:'เมือง', awardsN:'รางวัล', day:'วัน', days:'วัน', of:'จาก',
       cont:'ดำเนินการต่อ', begin:'เริ่ม', complete:'เสร็จสมบูรณ์', available:'พร้อมใช้งาน',
       quickCheck:'แบบทดสอบสั้น', submit:'ส่ง', backToTour:'กลับไปที่การเดินทาง',
       nextCity:'เมืองถัดไป', saveNote:'บันทึกโน้ต', everyStop:'ทุกจุดแวะ',
       watch:'ดู', read:'อ่าน', download:'ดาวน์โหลด', minutes:'นาที' }
};

M.lang = function(){ return M.get('m.lang','en'); };
M.setLang = function(code){ M.put('m.lang', code); document.documentElement.setAttribute('lang', code); };
M.t = function(key){
  var l = M.lang();
  return (S[l] && S[l][key]) || S.en[key] || key;
};
M.langMeta = function(code){
  code = code || M.lang();
  for(var i=0;i<M.LANGS.length;i++) if(M.LANGS[i].code===code) return M.LANGS[i];
  return M.LANGS[0];
};

})(window.M = window.M || {});
