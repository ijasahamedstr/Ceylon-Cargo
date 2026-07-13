import React, { createContext, useContext, useState } from "react";

// ── Translation dictionary ────────────────────────────────────────────────────
const translations = {
  en: {
    // CTA Section
    readyToShip: "Ready to Ship?",
    shipToday: "Ship Your Cargo Today",
    shipTodayDesc: "Experience seamless door-to-door cargo services from Saudi Arabia to Sri Lanka. Fast, reliable, and fully insured.",
    trackShipment: "Track Your Shipment",
    whatsapp: "WhatsApp Us",
    trustFully: "Fully Insured",
    trustDoor: "Door-to-Door",
    trustFast: "Fast Delivery",
    trustGlobal: "Global Network",

    // Services Section
    whatWeOffer: "What We Offer",
    ourServices: "Our Services",
    servicesSubtitle: "End-to-end logistics solutions tailored for the Saudi Arabia to Sri Lanka corridor.",
    seaCargo: "Sea Cargo",
    seaCargoDesc: "Cost-effective FCL & LCL sea freight from Dammam Port to Colombo with door-to-door delivery.",
    airCargo: "Air Cargo",
    airCargoDesc: "Express air freight with guaranteed delivery timelines and real-time tracking for urgent shipments.",
    delivery: "Last-Mile Delivery",
    deliveryDesc: "Island-wide delivery across all 25 districts in Sri Lanka with our dedicated transport fleet.",
    warehousing: "Warehousing",
    warehousingDesc: "Secure climate-controlled warehousing facilities in Dammam and Colombo with inventory management.",
    customs: "Customs Clearance",
    customsDesc: "Hassle-free customs clearance handled by our licensed brokers in both Saudi Arabia and Sri Lanka.",
    support247: "24/7 Support",
    supportDesc: "Round-the-clock customer support in Arabic, Sinhala, and English for all your cargo inquiries.",

    // Stats Section
    byNumbers: "Ceylon Cargo by the Numbers",
    provenTrack: "Proven Track Record",
    yearsExp: "Years Experience",
    yearsExpDesc: "Serving the SA–LK corridor",
    shipped: "Packages Shipped",
    shippedDesc: "Delivered safely island-wide",
    countries: "Countries Served",
    countriesDesc: "International network",
    onTime: "On-Time Delivery",
    onTimeDesc: "Consistent & reliable",

    // Why Us Section
    whyUs: "Why Choose Us",
    whyUsTitle: "The Ceylon Cargo Advantage",
    whyUsDesc: "We combine decades of logistics expertise with cutting-edge technology to deliver your cargo safely, on time, every time — from the heart of Saudi Arabia to every corner of Sri Lanka.",
    mainRoute: "Our Main Route",
    r1Title: "Licensed & Certified",
    r1Desc: "Fully licensed freight forwarder with IATA accreditation and customs brokerage certification in both countries.",
    r2Title: "Real-Time Tracking",
    r2Desc: "Track your shipment at every milestone with our live QR-based tracking system and instant SMS/WhatsApp updates.",
    r3Title: "Transparent Pricing",
    r3Desc: "No hidden fees. Get an instant quote with clear pricing based on weight, volume, and service type.",
    r4Title: "Cargo Insurance",
    r4Desc: "Comprehensive cargo insurance coverage available for all shipments against loss, damage, and theft.",
    r5Title: "Express Delivery",
    r5Desc: "Air cargo delivered within 3–5 business days. Sea cargo in 21–28 days with priority unloading options.",
    r6Title: "Dedicated Team",
    r6Desc: "A bilingual team of logistics professionals available around the clock to assist you in Arabic and Sinhala.",
  },
  ar: {
    // CTA Section
    readyToShip: "هل أنت مستعد للشحن؟",
    shipToday: "اشحن بضاعتك اليوم",
    shipTodayDesc: "استمتع بخدمات الشحن من الباب إلى الباب من المملكة العربية السعودية إلى سريلانكا. سريع وموثوق ومؤمن بالكامل.",
    trackShipment: "تتبع شحنتك",
    whatsapp: "تواصل عبر واتساب",
    trustFully: "مؤمن بالكامل",
    trustDoor: "من الباب للباب",
    trustFast: "توصيل سريع",
    trustGlobal: "شبكة عالمية",

    // Services Section
    whatWeOffer: "ما نقدمه",
    ourServices: "خدماتنا",
    servicesSubtitle: "حلول لوجستية متكاملة مصممة لممر المملكة العربية السعودية إلى سريلانكا.",
    seaCargo: "الشحن البحري",
    seaCargoDesc: "شحن بحري اقتصادي بالحاوية الكاملة والمشتركة من ميناء الدمام إلى كولومبو مع التوصيل من الباب إلى الباب.",
    airCargo: "الشحن الجوي",
    airCargoDesc: "شحن جوي سريع مع ضمان مواعيد التسليم وتتبع فوري للشحنات العاجلة.",
    delivery: "التوصيل الأخير",
    deliveryDesc: "توصيل على مستوى الجزيرة في جميع المقاطعات الـ 25 في سريلانكا مع أسطول نقلنا المخصص.",
    warehousing: "التخزين",
    warehousingDesc: "مرافق تخزين آمنة ومكيفة في الدمام وكولومبو مع إدارة المخزون.",
    customs: "التخليص الجمركي",
    customsDesc: "تخليص جمركي سهل يديره وسطاؤنا المرخصون في المملكة العربية السعودية وسريلانكا.",
    support247: "دعم على مدار الساعة",
    supportDesc: "دعم عملاء على مدار الساعة باللغات العربية والسنهالية والإنجليزية.",

    // Stats Section
    byNumbers: "سيلون كارغو بالأرقام",
    provenTrack: "سجل حافل بالإنجازات",
    yearsExp: "سنوات الخبرة",
    yearsExpDesc: "نخدم ممر SA–LK",
    shipped: "طرود مشحونة",
    shippedDesc: "تسليم آمن على مستوى الجزيرة",
    countries: "دول خدمناها",
    countriesDesc: "شبكة دولية",
    onTime: "التسليم في الوقت المحدد",
    onTimeDesc: "ثابت وموثوق",

    // Why Us Section
    whyUs: "لماذا تختارنا",
    whyUsTitle: "ميزة سيلون كارغو",
    whyUsDesc: "نجمع عقوداً من الخبرة اللوجستية مع أحدث التقنيات لتوصيل بضاعتك بأمان وفي الوقت المحدد في كل مرة.",
    mainRoute: "مسارنا الرئيسي",
    r1Title: "مرخص ومعتمد",
    r1Desc: "وكيل شحن مرخص بالكامل مع اعتماد IATA وشهادة الوساطة الجمركية في كلا البلدين.",
    r2Title: "تتبع فوري",
    r2Desc: "تتبع شحنتك في كل مرحلة مع نظام التتبع القائم على QR وتحديثات SMS/واتساب الفورية.",
    r3Title: "أسعار شفافة",
    r3Desc: "لا رسوم خفية. احصل على عرض أسعار فوري بتسعير واضح بناءً على الوزن والحجم ونوع الخدمة.",
    r4Title: "تأمين الشحن",
    r4Desc: "تغطية تأمينية شاملة متاحة لجميع الشحنات ضد الفقدان والتلف والسرقة.",
    r5Title: "توصيل سريع",
    r5Desc: "يتم تسليم الشحن الجوي خلال 3–5 أيام عمل. الشحن البحري في 21–28 يوماً مع خيارات تفريغ ذات أولوية.",
    r6Title: "فريق مخصص",
    r6Desc: "فريق من متخصصي اللوجستيات ثنائي اللغة متاح على مدار الساعة لمساعدتك بالعربية والسنهالية.",
  },
};

type Lang = "en" | "ar";
type Translations = typeof translations.en;

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
  isRTL: boolean;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  isRTL: false,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const isRTL = lang === "ar";

  return (
    <LangContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
