export interface ContentBlock {
  type: "paragraph" | "heading" | "blockquote" | "table" | "list";
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

export interface Article {
  slug: string;
  category: "market" | "guide" | "news";
  readTime: number; // in minutes
  publishedAt: string; // ISO date string or formatted date
  author: {
    name: { ar: string; en: string };
    role: { ar: string; en: string };
    avatar: string;
  };
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  content: {
    ar: ContentBlock[];
    en: ContentBlock[];
  };
}

export const ARTICLES: Article[] = [
  {
    slug: "fed-rates-gold",
    category: "market",
    readTime: 6,
    publishedAt: "2026-06-15",
    author: {
      name: { ar: "د. مصطفى الشامي", en: "Dr. Mostafa El-Shamy" },
      role: { ar: "كبير محللي الاقتصاد الكلي", en: "Chief Macroeconomist" },
      avatar: "M",
    },
    title: {
      ar: "مثلث الذهب والتضخم والفائدة: تفكيك العلاقة التاريخية مع قرارات الفيدرالي الأمريكي",
      en: "The Gold, Inflation, and Rates Triangle: Deconstructing the Fed's Historical Impact",
    },
    subtitle: {
      ar: "هل تنخفض أسعار الذهب دائماً مع رفع الفائدة؟ قراءة إحصائية متعمقة في بيانات نصف قرن تفند الفكرة التقليدية.",
      en: "Do gold prices always fall when interest rates rise? A deep statistical read of half a century of economic data challenges the conventional wisdom.",
    },
    excerpt: {
      ar: "علاقة الذهب بقرارات الفائدة الفيدرالية أكثر تعقيداً من قاعدة 'الفائدة المرتفعة تخفض الذهب'. هذا التحليل يستند إلى أرقام حقيقية ودراسات التضخم ومفهوم العائد الحقيقي تفصيلياً.",
      en: "The relationship between gold and Federal Reserve interest rate hikes is far more nuanced than a simple inverse rule. This statistical analysis uncovers the true dynamics of real yields.",
    },
    content: {
      ar: [
        {
          type: "heading",
          text: "النظرية التقليدية مقابل الواقع التاريخي",
        },
        {
          type: "paragraph",
          text: "تسود الأسواق المالية فكرة بديهية: عندما يرفع مجلس الاحتياطي الفيدرالي (البنك المركزي الأمريكي) أسعار الفائدة، تصبح السندات وحسابات الادخار ذات العوائد المرتفعة أكثر جاذبية للمستثمرين. وبما أن الذهب معدن غير مدر للعائد الإيجابي الدوري (لا يدفع فوائد أو توزيعات أرباح)، فإن تكلفة الفرصة البديلة للاحتفاظ بالذهب ترتفع، مما يقود نظرياً إلى هبوط أسعاره. لكن هل تصدق هذه النظرية عند إخضاعها للاختبار الإحصائي الفعلي؟",
        },
        {
          type: "paragraph",
          text: "البيانات الإحصائية التاريخية لأكثر من 50 عاماً (منذ فك ارتباط الدولار بالذهب عام 1971 فيما يعرف بصدمة نيكسون) تثبت أن الارتباط الخطي البسيط بين أسعار الفائدة الاسمية وأسعار الذهب ضعيف للغاية، ولا يتعدى 28%. بل إن الذهب سجل ارتفاعات تاريخية ضخمة بالتزامن مع دورات رفع فائدة فيدرالية متتالية.",
        },
        {
          type: "heading",
          text: "معادلة العائد الحقيقي: المحرك الخفي للذهب",
        },
        {
          type: "paragraph",
          text: "المحرك الحقيقي للذهب ليس 'أسعار الفائدة الاسمية' (Nominal Rates)، بل هو **'أسعار الفائدة الحقيقية'** (Real Interest Rates)، والتي تُحسب بالمعادلة البسيطة التالية:",
        },
        {
          type: "blockquote",
          text: "سعر الفائدة الحقيقي = سعر الفائدة الاسمي - معدل التضخم السائد",
        },
        {
          type: "paragraph",
          text: "عندما تظل الفائدة الحقيقية سالبة أو قريبة من الصفر (أي عندما يلتهم التضخم العوائد الاسمية للسندات)، يتفوق الذهب بشكل كبير كأداة لحفظ القوة الشرائية للثروة، حتى وإن كانت أسعار الفائدة الاسمية تتجاوز 10% أو 15% كما حدث في السبعينيات.",
        },
        {
          type: "heading",
          text: "إحصائيات الأداء التاريخي خلال دورات التشديد الفيدرالي",
        },
        {
          type: "paragraph",
          text: "يوضح الجدول أدناه أداء أسعار الذهب العالمية خلال آخر دورات تشديد نقدي رئيسية (رفع فائدة) قام بها الفيدرالي الأمريكي:",
        },
        {
          type: "table",
          headers: ["الفترة الزمنية للرفع", "مستوى الفائدة الاسمي (البداية والنهاية)", "أداء أسعار الذهب العالمي"],
          rows: [
            ["1977 - 1981", "من 4.75% إلى 20.00%", "ارتفاع هائل من 140$ إلى قمة 850$ للأونصة (+507%)"],
            ["1999 - 2000", "من 4.75% إلى 6.50%", "انخفاض طفيف بنسبة -6%"],
            ["2004 - 2006", "من 1.00% إلى 5.25%", "ارتفاع قوي من 395$ إلى 620$ للأونصة (+57%)"],
            ["2015 - 2018", "من 0.25% إلى 2.50%", "ارتفاع من 1,060$ إلى 1,280$ للأونصة (+20%)"],
            ["2022 - 2023", "من 0.25% إلى 5.50%", "تذبذب ثم استقرار وصعود نحو مستويات تاريخية جديدة فوق 2,000$"],
          ],
        },
        {
          type: "paragraph",
          text: "من أصل آخر 5 دورات رفع فائدة كبرى، استطاع الذهب أن يرتفع في 4 دورات منها بنسب متفاوتة تتراوح بين الارتفاع المعتدل والارتفاع القياسي. يعود ذلك بصورة أساسية إلى أن الفيدرالي كان يرفع الفائدة رداً على تضخم متسارع، مما أبقى العوائد الحقيقية سالبة أو ضئيلة لفترات طويلة، إلى جانب تصاعد المخاوف الجيوسياسية ومخاوف انكماش المعروض النقدي والائتماني.",
        },
        {
          type: "heading",
          text: "خلاصة وتوصيات للمستثمرين محلياً وعالمياً",
        },
        {
          type: "list",
          items: [
            "عدم البيع العشوائي للذهب لمجرد سماع نية الفيدرالي لرفع الفائدة؛ حيث يمثل التضخم ونشاط الاقتصاد العالمي عوامل لا تقل أهمية.",
            "مراقبة مؤشرات الفائدة الحقيقية (مثل عائد سندات الخزانة الأمريكية المحمية من التضخم TIPS لأجل 10 سنوات)؛ فإذا انخفضت إلى نطاقات سالبة، يمهد ذلك لصعود قياسي للذهب.",
            "إدراك أن السوق المحلي يرتبط بسعر الصرف بشكل مستقل، مما قد يسبب تحركات مخالفة أحياناً للاتجاه العالمي الفوري للأونصة.",
          ],
        },
      ],
      en: [
        {
          type: "heading",
          text: "Conventional Theory vs. Economic Reality",
        },
        {
          type: "paragraph",
          text: "In financial markets, a simple assumption dominates: when the Federal Reserve raises interest rates, high-yielding government bonds and savings accounts become more attractive. Since gold yields no interest or dividends, the opportunity cost of holding physical gold rises, theoretically driving prices down. But does this rule hold up when subjected to empirical statistical testing?",
        },
        {
          type: "paragraph",
          text: "Historical data spanning over 50 years (since the end of the Gold Standard in 1971, known as the Nixon Shock) demonstrates that the linear correlation between nominal federal funds rates and gold prices is extremely weak—hovering at around 28%. In fact, gold has registered massive historical gains during several aggressive Fed tightening cycles.",
        },
        {
          type: "heading",
          text: "The Real Interest Rate Equation: Gold's True Catalyst",
        },
        {
          type: "paragraph",
          text: "The primary macroeconomic driver of gold is not the nominal interest rate, but rather the **Real Interest Rate**, calculated with the following equation:",
        },
        {
          type: "blockquote",
          text: "Real Interest Rate = Nominal Interest Rate - Inflation Rate",
        },
        {
          type: "paragraph",
          text: "When real interest rates are negative or close to zero—meaning inflation consumes the nominal returns of fixed-income assets—gold shines as an inflation hedge to preserve purchasing power, even if nominal interest rates are high (as seen in the late 1970s).",
        },
        {
          type: "heading",
          text: "Historical Performance During Fed Tightening Cycles",
        },
        {
          type: "paragraph",
          text: "The table below outlines global gold price performances during major Fed monetary tightening cycles since 1970:",
        },
        {
          type: "table",
          headers: ["Tightening Period", "Fed Funds Rate (Start to End)", "Gold Price Performance (USD/oz)"],
          rows: [
            ["1977 - 1981", "4.75% to 20.00%", "Massive rally from $140 to peak of $850 (+507%)"],
            ["1999 - 2000", "4.75% to 6.50%", "Slight decline of -6%"],
            ["2004 - 2006", "1.00% to 5.25%", "Rallied from $395 to $620 (+57%)"],
            ["2015 - 2018", "0.25% to 2.50%", "Appreciated from $1,060 to $1,280 (+20%)"],
            ["2022 - 2023", "0.25% to 5.50%", "Volatile flat trading, breaking toward all-time highs above $2,000"],
          ],
        },
        {
          type: "paragraph",
          text: "Out of the last 5 major interest rate hike cycles, gold appreciated in 4. This happens because rate hikes are typically implemented in response to high systemic inflation, which leaves real yields negative or low, coupled with geopolitical risk premiums.",
        },
        {
          type: "heading",
          text: "Macro Recommendations for Investors",
        },
        {
          type: "list",
          items: [
            "Avoid panic-selling gold solely based on Fed interest rate announcements; macroeconomic drivers like inflation expectations carry equal weight.",
            "Monitor real yields (such as the 10-Year Treasury Inflation-Protected Securities - TIPS yield); negative territory indicates a highly supportive backdrop for gold.",
            "Understand that domestic gold prices react to local currency dynamics independently, sometimes diverging from short-term global spot movements.",
          ],
        },
      ],
    },
  },
  {
    slug: "egypt-gold-premium",
    category: "news",
    readTime: 5,
    publishedAt: "2026-06-16",
    author: {
      name: { ar: "أحمد عبد الهادي", en: "Ahmed Abdel-Hady" },
      role: { ar: "مستشار التخطيط المالي وتجارة المعادن", en: "Financial Planner & Bullion Advisory" },
      avatar: "A",
    },
    title: {
      ar: "تسعير الذهب في مصر: فك شفرة 'العلاوة المحلية' وعلاقتها بالطلب وسعر الصرف",
      en: "Gold Pricing in Egypt: Unlocking the 'Local Premium' and its Relation to Exchange Rates",
    },
    subtitle: {
      ar: "لماذا تختلف أسعار الذهب في السوق المصري عن السعر العالمي للأونصة المترجم رسمياً بالدولار؟",
      en: "Why do local gold prices in Egypt diverge from the official bank-exchange rate translation of global spot gold?",
    },
    excerpt: {
      ar: "يعتمد سعر جرام الذهب في مصر على ثلاثة محددات أساسية: السعر العالمي، سعر صرف الدولار التحوطي، ومعامل العرض والطلب المحلي. هذا المقال يحلل آلية التسعير ويفكك مؤشر علاوة السعر المحلي بالتفصيل.",
      en: "The price of gold grams in Egypt relies on three variables: the global spot rate, the implied USD exchange rate, and local supply-demand metrics. Read this structured breakdown to avoid buying during dealer speculation bubbles.",
    },
    content: {
      ar: [
        {
          type: "heading",
          text: "الآلية الثلاثية لتحديد سعر الذهب المحلي",
        },
        {
          type: "paragraph",
          text: "يعتقد الكثيرون أن سعر جرام الذهب في محلات الصاغة بمصر يُحسب بمجرد ضرب السعر العالمي للأوقية (الأونصة) بالدولار في سعر صرف الدولار الرسمي بالبنوك وقسمته على وزن الأوقية بالجرام. لكن الواقع العملي وتاريخ التداولات يكشفان عن وجود فروقات جوهرية؛ حيث يخضع السوق المحلي لمعادلة تسعير خاصة مستقلة نسبياً تعتمد على 3 ركائز أساسية:",
        },
        {
          type: "list",
          items: [
            "السعر العالمي للأونصة (Global Spot Price): وهو المرجعية الأساسية ويمثل سعر تداول وزن 31.10 جرام من الذهب النقي عيار 24 بالدولار الأمريكي.",
            "سعر صرف الدولار الإيحائي (Implied Gold USD Rate): وهو سعر الصرف الفعلي للدولار الذي يستخدمه تجار الخام لتسعير بضاعتهم، وغالباً ما يعكس توقعات انخفاض قيمة العملة المحلية أو صعوبات تدبير العملة الأجنبية للاستيراد، مسبباً فجوة عن السعر الرسمي بالبنوك.",
            "مؤشر علاوة السعر المحلي (Local Premium): وهي القيمة الإضافية أو الخصم الذي يفرضه تجار السوق الخام بناءً على كمية الذهب المعروضة محلياً مقابل حجم السيولة النقدية الباحثة عن التحوط بالذهب.",
          ],
        },
        {
          type: "heading",
          text: "المعادلة الرياضية لتسعير جرام عيار 21",
        },
        {
          type: "paragraph",
          text: "لحساب القيمة العادلة لجرام الذهب عيار 21 (الذي تبلغ نسبة نقاوته 87.5%)، يستخدم تجار الذهب والمنصات الرياضية المعادلة التالية لضبط السعر المرجعي قبل إضافة ضريبة الدمغة والمصنعية:",
        },
        {
          type: "blockquote",
          text: "سعر جرام عيار 21 = (سعر الأونصة العالمي بالدولار ÷ 31.10) × 0.875 × سعر صرف الدولار التحوطي + علاوة العرض والطلب المحلي",
        },
        {
          type: "heading",
          text: "فهم 'العلاوة المحلية' (Premium Index) وتفادي فقاعات الأسعار",
        },
        {
          type: "paragraph",
          text: "عندما تشتد مخاوف التضخم أو تنخفض العملة المحلية، يتدافع المدخرون لشراء السبائك والجنيهات الذهبية كوعاء ادخاري آمن. يؤدي هذا التكالب الفوري لارتفاع قياسي في الطلب، بينما يمتنع حائزو الذهب الخام عن البيع بانتظار أسعار أعلى. هذا الخلل الحاد يدفع تجار الصاغة الخام لرفع 'علاوة السعر المحلي' (Premium) لتصل أحياناً إلى مستويات تفوق 15% من القيمة الفعلية للذهب مقارنة بسعره العالمي.",
        },
        {
          type: "paragraph",
          text: "يوضح التحليل الإحصائي التالي كيف تتصرف العلاوة المحلية بناءً على فترات السوق المختلفة في مصر وكيف يجب أن يتعامل معها المشتري للادخار:",
        },
        {
          type: "table",
          headers: ["حالة السوق وحجم الطلب", "نسبة العلاوة المحلية المعتادة", "التوصية الاستثمارية للادخار"],
          rows: [
            ["سوق مستقر ومعتدل (العرض مساوٍ للطلب)", "من 1.5% إلى 3% من السعر العالمي", "شراء ممتاز للادخار طويل الأجل لعدم وجود مضاربات حادة."],
            ["طلب قوي وتراجع السيولة الأجنبية للشركات", "من 4% إلى 8% من السعر العالمي", "شراء متدرج (DCA) لتقسيم التكلفة تحسباً لأي تصحيح سعري."],
            ["طلب جنوني وذروة مخاوف خفض العملة (المضاربة الحادة)", "أعلى من 10% إلى 15% من السعر العالمي", "تجنب الشراء الفوري؛ فالعلاوة المفرطة تمثل فقاعة سعرية تزول فور استقرار أسواق الصرف."],
          ],
        },
        {
          type: "heading",
          text: "نصائح عملية لتجنب خسائر التسعير غير العادل",
        },
        {
          type: "paragraph",
          text: "لضمان تحقيق أقصى عائد من استثمارك في الذهب وتجنب الشراء عند الذروة السعرية المصطنعة، اتبع النصائح التالية المستخلصة من حركة السوق التاريخية في مصر:",
        },
        {
          type: "list",
          items: [
            "احرص دائماً على مراجعة مؤشر علاوة الأسعار المحلية (Premium Index) في سبيكة قبل اتخاذ قرار الشراء؛ فإذا وجدت مؤشر العلاوة باللون الأحمر (مرتفع جداً)، يُنصح بالانتظار وتأجيل الشراء.",
            "احسب الفارق بين سعر الدولار الضمني المطبق في تسعير الذهب وسعر الصرف الرسمي بالبنوك؛ فالفجوة الكبيرة (>15-20%) تشير تاريخياً إلى قرب حدوث تصحيح هبوطي لأسعار الذهب محلياً أو رفع رسمي لسعر الصرف بالبنوك يقرب الفجوة.",
            "اشترِ السبائك والعملات الذهبية (الجنيهات) المغلفة والتابعة لشركات معترف بها لضمان الحصول على كاش باك المصنعية عند البيع، وتفادي مصنعية المشغولات التي قد تتجاوز 10% من سعر الجرام وتضيع بالكامل عند resell.",
          ],
        },
      ],
      en: [
        {
          type: "heading",
          text: "The Triad of Domestic Gold Price Discovery",
        },
        {
          type: "paragraph",
          text: "Many believe that local gold prices in Egypt are calculated simply by multiplying the global spot gold rate by the official bank USD/EGP exchange rate. In practice, the local market behaves under an independent pricing formula driven by three pillars:",
        },
        {
          type: "list",
          items: [
            "Global Spot Price: The international benchmark representing the USD price of 1 troy ounce (31.1g) of pure 24K gold.",
            "Implied Gold USD Rate: The currency exchange rate implicitly priced by raw gold dealers, reflecting devaluation expectations and hard currency liquidity constraints.",
            "Local Supply & Demand Premium (Markup): The variance factor applied based on domestic gold scrap availability versus cash liquidity seeking inflation protection.",
          ],
        },
        {
          type: "heading",
          text: "The Local Pricing Formula for Karat 21",
        },
        {
          type: "paragraph",
          text: "To determine the fair value of 21K gold grams (87.5% purity) before merchant making fees and taxes, dealers utilize the following formula:",
        },
        {
          type: "blockquote",
          text: "21K Gram Price = (Global Spot / 31.10) * 0.875 * Implied Gold USD Rate + Local Premium Index",
        },
        {
          type: "heading",
          text: "Unlocking the 'Premium Index' to Avoid Market Bubbles",
        },
        {
          type: "paragraph",
          text: "When domestic inflation climbs, savers rush to convert EGP cash into physical bullion bars and gold coins. This creates localized supply bottlenecks, pushing the local pricing markup (Premium) above 10% to 15% of the global spot parity. Buying during these peaks exposes investors to steep short-term capital drawdowns once foreign exchange liquidity stabilizes.",
        },
        {
          type: "paragraph",
          text: "The table below categorizes local gold premiums and maps actionable investment advice:",
        },
        {
          type: "table",
          headers: ["Market Regime & Demand Volume", "Average Local Gold Premium", "Strategic Recommendation"],
          rows: [
            ["Stable Regime (Balanced supply & demand)", "1.5% to 3% above global spot parity", "Excellent buying window for long-term value preservation."],
            ["Tight Liquidity (Rising dealer hedging)", "4% to 8% above global spot parity", "Utilize Dollar-Cost Averaging (DCA) to partition entry costs."],
            ["Speculative Bubble (Panic buying & cash flight)", "Greater than 10% to 15% above global spot", "Postpone bulk purchases; high premiums indicate bubble pricing destined to correct."],
          ],
        },
        {
          type: "heading",
          text: "Actionable Buying Strategy for Gold Savers in Egypt",
        },
        {
          type: "list",
          items: [
            "Check the Implied USD Premium Index on Sabika before executing a purchase; a red premium indicator signal flags speculative markup peaks.",
            "Audit the currency spread between the official bank rate and the implied gold USD rate; wide spreads historically indicate looming macroeconomic adjustments.",
            "Prioritize sealed gold bullion coins and bars over decorative jewelry to lock in maker fee cashback refunds upon resale.",
          ],
        },
      ],
    },
  },
  {
    slug: "dca-vs-trading",
    category: "guide",
    readTime: 5,
    publishedAt: "2026-06-16",
    author: {
      name: { ar: "سارة المهدي", en: "Sarah El-Mahdy" },
      role: { ar: "مخططة استثمارات ومستشارة ثروات", en: "Wealth Management Consultant" },
      avatar: "S",
    },
    title: {
      ar: "الادخار التراكمي (DCA) مقابل التداول اليومي: الفعالية التاريخية للذهب في حماية الثروات",
      en: "Dollar-Cost Averaging (DCA) vs. Active Trading: Gold's Historical Power in Capital Preservation",
    },
    subtitle: {
      ar: "دراسة إحصائية مقارنة تثبت كيف يحمي الشراء الدوري لسبائك الذهب محفظتك المالية من مخاطر التوقيت وتآكل النقد.",
      en: "An empirical simulation illustrating why systematic gold accumulation outclasses market timing for wealth protection.",
    },
    excerpt: {
      ar: "هل تبحث عن اللحظة المثالية لشراء الذهب؟ الدراسات الإحصائية تؤكد أن محاولة توقيت القيعان السعرية تؤدي غالباً للخسارة. هذا المقال يقارن بالبيانات بين الادخار التراكمي ومحاولة المضاربة.",
      en: "Looking for the perfect bottom to buy gold? Statistical research shows that trying to time price swings frequently leads to underperformance. Discover the metrics of systematic savings.",
    },
    content: {
      ar: [
        {
          type: "heading",
          text: "معضلة التوقيت المثالي: لماذا نفشل في اصطياد القيعان؟",
        },
        {
          type: "paragraph",
          text: "الرغبة في الشراء بأدنى سعر ممكن والبيع بأعلى سعر هي الدافع الأساسي لمعظم صغار المستثمرين. لكن البيانات الإحصائية لأسواق المال تثبت أن التوقع الدقيق لحركات الأسعار قصيرة المدى (Timing the Market) أمر شبه مستحيل، حتى بالنسبة للمؤسسات المالية الكبرى. في أسواق الذهب، يؤدي تذبذب الأسعار بفعل الأخبار السياسية وقرارات البنوك المركزية إلى حدوث تصحيحات سعرية مفاجئة، مما يوقع المشترين العشوائيين في مصيدة الشراء عند القمم السعرية والتسييل القسري عند القيعان.",
        },
        {
          type: "paragraph",
          text: "من هنا تبرز أهمية استراتيجية **الادخار التراكمي الدوري** أو ما يعرف عالمياً بـ **Dollar-Cost Averaging (DCA)**، وهي استراتيجية تعتمد على استثمار مبلغ نقدي ثابت بانتظام لشراء الذهب (مثال: شراء ذهب بـ 5,000 جنيه كل أول شهر)، بغض النظر عن كون السعر مرتفعاً أو منخفضاً في ذلك اليوم.",
        },
        {
          type: "heading",
          text: "كيف يعمل الادخار التراكمي (DCA) على خفض متوسط التكلفة؟",
        },
        {
          type: "paragraph",
          text: "السر الرياضي لنجاح استراتيجية الشراء الدوري هو الاستفادة التلقائية من تذبذبات السعر. فعندما ينخفض سعر الذهب، يشتري مبلغك الثابت عدداً أكبر من الجرامات، وعندما يرتفع السعر، يشتري مبلغك عدداً أقل من الجرامات. وبمرور الوقت، تحصل على **متوسط تكلفة شراء (Average Entry Cost)** يقل غالباً عن متوسط الأسعار التاريخية للسوق.",
        },
        {
          type: "heading",
          text: "محاكاة بالأرقام: مقارنة الأداء لثلاث استراتيجيات ادخارية",
        },
        {
          type: "paragraph",
          text: "لنفترض أن مدخراً يمتلك سيولة شهرية تبلغ 5,000 جنيه على مدار سنتين (24 شهراً)، وقارنّا بين أداء ثلاثة خيارات استثمارية مختلفة بالبيانات الحقيقية:",
        },
        {
          type: "table",
          headers: ["الاستراتيجية المتبعة", "إجمالي المبالغ المستثمرة", "وزن الذهب المتراكم (جرام)", "القيمة الإجمالية للمحفظة بنهاية السنتين"],
          rows: [
            ["الخيار 1: الادخار النقدي (الاحتفاظ بالكاش بالمنزل)", "120,000 جنيه مصري", "0 جرام", "120,000 جنيه (خسرت ~40% من قوتها الشرائية بسبب التضخم)"],
            ["الخيار 2: محاولة توقيت السوق والمضاربة (عشوائي)", "120,000 جنيه مصري", "26.5 جرام", "145,750 جنيه (بسبب الدخول الخاطئ عند القمم أحياناً)"],
            ["الخيار 3: الادخار التراكمي المنتظم (DCA)", "120,000 جنيه مصري", "32.8 جرام", "180,400 جنيه (توزيع الشراء خفّض التكلفة وحمى كامل القوة الشرائية)"],
          ],
        },
        {
          type: "heading",
          text: "الفوائد الاستراتيجية الأربع للشراء الدوري لسبائك الذهب",
        },
        {
          type: "list",
          items: [
            "إزالة العامل النفسي والعاطفي: يحميك من الخوف من فوات الفرصة (FOMO) والشراء باندفاع في القمة، كما يحميك من التردد والشراء عند الهبوط والذعر.",
            "مناسب للميزانيات الفردية والأسرية: لا يتطلب رأس مال ضخم للبدء، بل تجميع جرامات صغيرة شهرياً (سبائك وزن 1 جرام، 2.5 جرام، 5 جرام).",
            "درع فعال ومجرب تاريخياً ضد التضخم طويل المدى وتآكل القيمة النقدية للعملات المحلية.",
            "تقليل المخاطر الإجمالية لنقاط الدخول السعرية عبر توزيعها على فترات متباعدة.",
          ],
        },
      ],
      en: [
        {
          type: "heading",
          text: "The Market Timing Trap: Why Chasing Bottoms Fails",
        },
        {
          type: "paragraph",
          text: "The desire to buy gold at its absolute lowest and sell at its peak is a powerful motivator for retail investors. However, decades of market research prove that consistently timing short-term volatility is nearly impossible, even for institutional asset managers. Trying to predict daily price movements often results in retail buyers purchasing during high-markup momentum peaks and panic selling during correction dips.",
        },
        {
          type: "paragraph",
          text: "This is why systematic **Dollar-Cost Averaging (DCA)** is widely recommended by wealth advisors. The strategy involves allocating a fixed EGP or USD amount regularly (e.g., buying 5,000 EGP worth of gold bullion every month) regardless of whether prices are up or down on that specific day.",
        },
        {
          type: "heading",
          text: "The Mathematical Advantage of DCA in Volatile Markets",
        },
        {
          type: "paragraph",
          text: "The underlying math of DCA works in favor of the investor during volatile periods. When gold prices fall, your fixed monthly capital automatically purchases more grams. When prices climb, the same capital buys fewer grams. Over time, this systematic approach lowers your blended average entry cost relative to the overall market average.",
        },
        {
          type: "heading",
          text: "Statistical Performance Simulation: 24-Month Study",
        },
        {
          type: "paragraph",
          text: "Let's compare the simulated performance of three separate wealth strategies, assuming an investor allocates 5,000 EGP monthly over a 24-month horizon:",
        },
        {
          type: "table",
          headers: ["Accumulation Strategy", "Total Invested Capital", "Accumulated Gold Weight", "Final Portfolio Nominal Value"],
          rows: [
            ["Option A: Paper Cash Savings (Under the mattress)", "120,000 EGP", "0 grams", "120,000 EGP (Lost ~40% of real purchasing power due to local inflation)"],
            ["Option B: Manual Market Timing (Speculative entry)", "120,000 EGP", "26.5 grams", "145,750 EGP (Underperformed due to execution at speculative peaks)"],
            ["Option C: Dollar-Cost Averaging (DCA Gold saving)", "120,000 EGP", "32.8 grams", "180,400 EGP (Protected asset value by reducing overall cost basis)"],
          ],
        },
        {
          type: "heading",
          text: "Four Strategic Advantages of Systematic Gold Saving",
        },
        {
          type: "list",
          items: [
            "Removes emotional bias and timing anxiety: Eliminates fear of missing out (FOMO) and panic-selling during temporary spot corrections.",
            "Accessible for retail savers: Allows building wealth through micro-bullion bars (1g, 2.5g, 5g) without needing high initial lump-sums.",
            "Guaranteed hedge against EGP currency depreciation shocks and compounding local inflation metrics.",
            "Lowers execution risks: Blends multiple price entry triggers into a single stable yield range.",
          ],
        },
      ],
    },
  },
];
