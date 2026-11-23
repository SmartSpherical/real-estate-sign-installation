/* ============================================================================
   SITE CONFIG  —  edit this file to update the website.
   网站设置 —— 修改这个文件即可更新网站内容。
   ----------------------------------------------------------------------------
   Everything a customer sees (business name, phone, WeChat, prices, services,
   FAQ, reviews) lives here. You never need to touch the other files.

   • Text written as  { en: "...", zh: "..." }  has an English and a Chinese
     version. Update both when you change the wording.
   • Keep the quotes "like this" around text, and the comma after each line.
   • Prices are plain numbers (no $ sign): 65, not "$65".
   • After editing on GitHub, press "Commit changes" — the live site updates
     within about a minute.
   ========================================================================== */

window.SITE = {

  /* ---------- 1. BUSINESS BASICS ---------------------------------------- */
  business: {
    name: { en: "Northline Sign Posts", zh: "北线地产招牌" },   // logo, footer & browser tab
    shortName: "NORTHLINE",          // giant word in the footer
    tagline: {
      en: "Real estate sign installation for agents who'd rather be selling.",
      zh: "专业地产招牌安装，让经纪人专心卖房。",
    },
    currency: "$",
    founded: 2014,
    defaultLanguage: "en",           // "en" or "zh" — used when the visitor's browser language isn't Chinese
  },

  /* ---------- 2. HERO (first screen) ------------------------------------ */
  hero: {
    line1: { en: "Every listing", zh: "每一个房源，" },
    line2: { en: "deserves a post.", zh: "都值得一块好招牌。" },
    sub: {
      en: "Post & panel installs, riders, open house signs and pickups for realtors across the GTA. Booked online, installed plumb, removed when it sells.",
      zh: "为大多伦多地区地产经纪提供立柱招牌安装、挂牌更换、开放日指示牌及回收服务。在线预约，安装端正，售出即撤。",
    },
    panelText: "FOR SALE",           // words on the 3D sign panel
  },

  /* ---------- 3. CONTACT INFO ------------------------------------------- */
  contact: {
    person: "Gary Lam",                    // contact name shown in the contact section
    phone: "(416) 200-8386",               // how it is displayed
    phoneLink: "+14162008386",             // digits only, used for tap-to-call / text
    wechat: "GaryLamRealty",               // WeChat ID, or "" to hide
    email: "garylamrealty@outlook.com",    // shown on the site; "" to hide
    address: { en: "Serving the Greater Toronto Area", zh: "服务大多伦多地区" },
    serviceArea: {
      en: "Toronto · Markham · Richmond Hill · Vaughan · Mississauga · Scarborough",
      zh: "多伦多 · 万锦 · 列治文山 · 旺市 · 密西沙加 · 士嘉堡",
    },
    hours: [
      [{ en: "Mon – Fri", zh: "周一至周五" }, { en: "7:00 am – 7:00 pm", zh: "上午7:00 – 晚上7:00" }],
      [{ en: "Sat – Sun", zh: "周六至周日" }, { en: "8:00 am – 4:00 pm", zh: "上午8:00 – 下午4:00" }],
      [{ en: "Cut-off", zh: "截单时间" },     { en: "Book by noon for same-day", zh: "中午前预约，当天安装" }],
    ],
    responseTime: { en: "Replies within 1 hour", zh: "1小时内回复" },
    instagram: "",                         // full URL, or "" to hide
    facebook: "",                          // full URL, or "" to hide

    /* Quote form delivery — requests are emailed to the address at the end
       of this link (free service by formsubmit.co, no account needed).
       To send them somewhere else, change the email address at the end.
       Set to "" to fall back to opening the visitor's email app instead.    */
    formEndpoint: "https://formsubmit.co/ajax/garylamrealty@outlook.com",
  },

  /* ---------- 4. HEADLINE NUMBERS (glass cards near the top) ------------ */
  stats: [
    { value: 9500, suffix: "+", label: { en: "listing signs installed", zh: "块房源招牌已安装" } },
    { value: 350,  suffix: "+", label: { en: "agents & brokerages served", zh: "位经纪及地产公司客户" } },
    { value: 24,   suffix: "h", label: { en: "install guarantee, or it's free", zh: "小时内安装，超时免费" } },
    { value: 4.9,  suffix: "★", decimals: 1, label: { en: "average rating from realtors", zh: "经纪人平均评分" } },
  ],

  /* ---------- 5. SERVICES & PRICES -------------------------------------
     price  = price for one (shown on the card and in the price list)
     unit   = what the price covers
     icon   = post, stake, rider, openhouse, removal, brochure, repair,
              storage, board                                               */
  services: [
    {
      id: "post", icon: "post", price: 75, popular: true,
      name:  { en: "Post & Panel Install", zh: "立柱招牌安装" },
      blurb: { en: "Classic white colonial post set plumb, your panel hung level on hooks, and removal included when it sells.",
               zh: "经典白色立柱，垂直安装，挂牌水平端正，售出后免费拆除回收。" },
      unit:  { en: "per listing, removal included", zh: "每个房源，含拆除" },
      includes: [
        { en: "Utility locate check", zh: "地下管线确认" },
        { en: "Post, arm & hooks supplied", zh: "提供立柱、横臂及挂钩" },
        { en: "Photo confirmation by text / WeChat", zh: "短信 / 微信发送安装照片" },
      ],
    },
    {
      id: "stake", icon: "stake", price: 35, popular: false,
      name:  { en: "Lawn & Stake Signs", zh: "草坪插牌" },
      blurb: { en: "H-frame and stake signs for townhomes, rentals and condos where a full post isn't allowed.",
               zh: "H型插牌及地桩牌，适用于不允许立柱的联排别墅、出租房及公寓。" },
      unit:  { en: "per sign", zh: "每块" },
      includes: [
        { en: "H-frame or double stake", zh: "H型架或双地桩" },
        { en: "Placed for street visibility", zh: "摆放于最佳视线位置" },
        { en: "Pickup included", zh: "含回收" },
      ],
    },
    {
      id: "rider", icon: "rider", price: 20, popular: false,
      name:  { en: "Rider Swaps", zh: "挂牌更换" },
      blurb: { en: "SOLD, Coming Soon, Open House, Price Reduced: swapped the same day you message us.",
               zh: "已售、即将上市、开放日、降价等挂牌，发消息当天即可更换。" },
      unit:  { en: "per rider", zh: "每块挂牌" },
      includes: [
        { en: "Same-day when booked by noon", zh: "中午前预约当天完成" },
        { en: "Hang, swap or remove", zh: "挂上、更换或取下" },
        { en: "SOLD slash stickers available", zh: "可贴“已售”斜条" },
      ],
    },
    {
      id: "openhouse", icon: "openhouse", price: 60, popular: false,
      name:  { en: "Open House Directionals", zh: "开放日指示牌" },
      blurb: { en: "Up to 6 arrow signs placed on the main approaches before your open house and collected after.",
               zh: "开放日前在主要路口摆放最多6块方向指示牌，结束后统一回收。" },
      unit:  { en: "per open house, up to 6 signs", zh: "每次开放日，最多6块" },
      includes: [
        { en: "Route planned from main roads", zh: "从主干道规划指引路线" },
        { en: "Set-out & pickup same day", zh: "当天摆放及回收" },
        { en: "Balloons on request", zh: "可按需加挂气球" },
      ],
    },
    {
      id: "removal", icon: "removal", price: 30, popular: false,
      name:  { en: "Removal & Pickup", zh: "招牌拆除回收" },
      blurb: { en: "Signs installed by someone else? We pull the post, fill the hole and return or store your panel.",
               zh: "别家安装的招牌？我们负责拔桩、回填坑洞，并归还或保管您的招牌。" },
      unit:  { en: "per sign", zh: "每块" },
      includes: [
        { en: "Hole backfilled & tamped", zh: "坑洞回填压实" },
        { en: "Panel returned or stored", zh: "招牌归还或代为保管" },
        { en: "Lawn left tidy", zh: "草坪清理整洁" },
      ],
    },
    {
      id: "brochure", icon: "brochure", price: 25, popular: false,
      name:  { en: "Brochure Box", zh: "宣传册盒" },
      blurb: { en: "Weatherproof feature-sheet box mounted on the post, with refills on any visit.",
               zh: "防水宣传册盒安装于立柱上，每次上门均可补充资料。" },
      unit:  { en: "per listing", zh: "每个房源" },
      includes: [
        { en: "Box supplied", zh: "提供盒子" },
        { en: "Free refills on visits", zh: "上门时免费补充" },
        { en: "Removed with the post", zh: "随立柱一同拆除" },
      ],
    },
    {
      id: "repair", icon: "repair", price: 35, popular: false,
      name:  { en: "Straighten & Repair", zh: "扶正及维修" },
      blurb: { en: "Knocked over by a plow or a storm? Reset, re-hung and photo-confirmed, usually within hours.",
               zh: "被扫雪车或大风刮倒？数小时内重新扶正、挂好并拍照确认。" },
      unit:  { en: "per visit", zh: "每次上门" },
      includes: [
        { en: "Post reset plumb", zh: "立柱重新扶正" },
        { en: "Hooks & hardware replaced", zh: "更换挂钩及五金" },
        { en: "Priority dispatch", zh: "优先派单" },
      ],
    },
    {
      id: "storage", icon: "storage", price: 10, popular: false,
      name:  { en: "Panel Storage", zh: "招牌保管" },
      blurb: { en: "We keep your panels and riders dry and organised, ready for your next listing.",
               zh: "干燥整齐地保管您的招牌及挂牌，随时用于下一个房源。" },
      unit:  { en: "per month, per agent", zh: "每位经纪，每月" },
      includes: [
        { en: "Indoor, dry storage", zh: "室内干燥存放" },
        { en: "Inventory list on request", zh: "可提供库存清单" },
        { en: "First 60 days free", zh: "首60天免费" },
      ],
    },
    {
      id: "board", icon: "board", price: 195, popular: false,
      name:  { en: "Commercial & Land Boards", zh: "商业及土地大牌" },
      blurb: { en: "4×8 ft boards on double 4×4 posts for land, commercial and pre-construction sites.",
               zh: "4×8英尺大牌配双4×4立柱，适用于土地、商业及楼花项目。" },
      unit:  { en: "per board, removal included", zh: "每块，含拆除" },
      includes: [
        { en: "Post holes augered", zh: "螺旋钻打孔" },
        { en: "Wind-rated bracing", zh: "抗风加固" },
        { en: "Removal included", zh: "含拆除" },
      ],
    },
  ],

  /* ---------- 6. PACKAGES (bundled pricing cards) ------------------------
     price: null shows "Custom quote".  per: small text after the price.     */
  packages: [
    {
      price: 95, featured: false,
      per: { en: "/ listing", zh: "/ 房源" },
      name: { en: "Single Listing", zh: "单个房源" },
      note: { en: "Pay as you go", zh: "按次付费" },
      features: [
        { en: "Post & panel install", zh: "立柱招牌安装" },
        { en: "1 rider swap (e.g. SOLD)", zh: "1次挂牌更换（如“已售”）" },
        { en: "Removal when sold", zh: "售出后拆除" },
        { en: "Photo confirmation", zh: "安装照片确认" },
      ],
      cta: { en: "Book a listing", zh: "预约安装" },
    },
    {
      price: 349, featured: true,
      per: { en: "/ month", zh: "/ 月" },
      name: { en: "Agent Monthly", zh: "经纪月度套餐" },
      note: { en: "For agents with 3+ listings a month", zh: "适合每月3个以上房源的经纪" },
      features: [
        { en: "Up to 6 post installs & removals", zh: "最多6次立柱安装及拆除" },
        { en: "Unlimited rider swaps", zh: "无限次挂牌更换" },
        { en: "2 open house directional sets", zh: "2次开放日指示牌服务" },
        { en: "Free panel storage", zh: "免费招牌保管" },
        { en: "Priority same-day installs", zh: "优先当天安装" },
      ],
      cta: { en: "Start monthly", zh: "开始月度套餐" },
    },
    {
      price: null, featured: false,
      per: { en: "", zh: "" },
      name: { en: "Brokerage", zh: "地产公司" },
      note: { en: "Teams & whole offices", zh: "团队及整个分行" },
      features: [
        { en: "Volume pricing for every agent", zh: "所有经纪享受批量价格" },
        { en: "One monthly invoice", zh: "每月统一发票" },
        { en: "Branded post & panel stock", zh: "品牌立柱及招牌库存" },
        { en: "Online order portal", zh: "在线下单系统" },
      ],
      cta: { en: "Talk to us", zh: "联系洽谈" },
    },
  ],

  /* ---------- 7. PRICE CALCULATOR --------------------------------------
     Total = (service price × how many) + zone fee + extras.
     perSign: true means the add-on is charged once per sign.               */
  estimator: {
    maxQty: 30,
    zones: [
      { add: 0,  label: { en: "Core: Toronto, Markham, Richmond Hill", zh: "核心区：多伦多、万锦、列治文山" } },
      { add: 15, label: { en: "Extended: Vaughan, Scarborough, Mississauga", zh: "扩展区：旺市、士嘉堡、密西沙加" } },
      { add: 35, label: { en: "Outer GTA: Durham, Halton, Newmarket", zh: "外围：杜兰、霍顿、纽马克特" } },
    ],
    grounds: [
      { add: 0,  perSign: true, label: { en: "Regular lawn", zh: "普通草坪" } },
      { add: 15, perSign: true, label: { en: "Frozen ground (winter)", zh: "冻土（冬季）" } },
      { add: 20, perSign: true, label: { en: "Hardscape, needs weighted base", zh: "硬地面，需配重底座" } },
    ],
    extras: [
      { add: 20, perSign: true,  label: { en: "Rider (SOLD, Open House…)", zh: "挂牌（已售、开放日等）" } },
      { add: 25, perSign: true,  label: { en: "Brochure box", zh: "宣传册盒" } },
      { add: 35, perSign: true,  label: { en: "Solar spotlight", zh: "太阳能射灯" } },
      { add: 40, perSign: false, label: { en: "Same-day rush", zh: "当天加急" } },
    ],
    volumeDiscount: { minQty: 10, percent: 10 },   // 10% off when ordering 10 or more
    disclaimer: {
      en: "Prices before HST. Removal is included wherever noted. Final price confirmed by text or WeChat before we install.",
      zh: "价格未含HST税。注明“含拆除”的项目均包含拆除。安装前将通过短信或微信确认最终价格。",
    },
  },

  /* ---------- 8. PROCESS STEPS (the scroll animation follows these 5) --- */
  process: [
    { title: { en: "Book", zh: "预约" },
      text:  { en: "Text, WeChat or use the form: address, panel, any riders. Booked by noon means installed today.",
               zh: "通过短信、微信或表格发送地址、招牌及挂牌要求。中午前预约，当天安装。" } },
    { title: { en: "Locate", zh: "定位" },
      text:  { en: "We check for buried gas, hydro and cable lines before a single hole is dug. Safe for the homeowner, safe for you.",
               zh: "挖坑前先确认地下燃气、电力及网线位置，保障业主和您的安全。" } },
    { title: { en: "Install", zh: "安装" },
      text:  { en: "Post set 24 inches deep and dead plumb. Panel hung level, facing traffic. Photo sent to your phone.",
               zh: "立柱埋深24英寸，绝对垂直。招牌水平悬挂，正对来车方向。安装照片即时发送到您的手机。" } },
    { title: { en: "Open house", zh: "开放日" },
      text:  { en: "Rider hung and directional arrows placed on the main approaches, then collected when you lock up.",
               zh: "挂上开放日挂牌，在主要路口摆放指示箭头，结束后统一回收。" } },
    { title: { en: "Sold", zh: "售出" },
      text:  { en: "SOLD rider up the same day. When you're ready, we pull the post, fill the hole and store your panel for the next one.",
               zh: "当天挂上“已售”牌。您需要时，我们拔桩回填，并保管招牌留待下一个房源。" } },
  ],

  /* ---------- 9. WHY US ------------------------------------------------- */
  reasons: [
    { title: { en: "24-hour guarantee", zh: "24小时保证" },
      text:  { en: "Installed within 24 hours of booking, or the install is free.", zh: "预约后24小时内安装，否则免费。" } },
    { title: { en: "Photo proof, every time", zh: "每次拍照确认" },
      text:  { en: "A photo of every install, swap and pickup, sent by text or WeChat.", zh: "每次安装、更换及回收都通过短信或微信发送照片。" } },
    { title: { en: "Locates before digging", zh: "先定位再挖坑" },
      text:  { en: "We confirm utility lines first. No surprises for you or the homeowner.", zh: "先确认地下管线，不给您和业主添麻烦。" } },
    { title: { en: "English & 中文", zh: "中英双语服务" },
      text:  { en: "Book in English or Chinese, by phone, text or WeChat.", zh: "可用中文或英文，通过电话、短信或微信预约。" } },
  ],

  /* ---------- 10. REVIEWS — replace with your real customer reviews ----- */
  testimonials: [
    { name: "Priya S.", role: { en: "Realtor, Markham", zh: "地产经纪，万锦" },
      quote: { en: "Booked at 10, sign was up by 2 with a photo in my WeChat. My sellers were impressed before we even had a showing.",
               zh: "上午10点预约，下午2点招牌就装好了，照片直接发到我微信。还没开始带看，卖家就已经很满意了。" } },
    { name: "Marcus L.", role: { en: "Broker of record", zh: "地产公司负责人" },
      quote: { en: "One invoice for the whole office and the posts are always straight. Our agents stopped doing installs themselves.",
               zh: "整个分行一张发票，立柱永远是直的。我们的经纪再也不用自己装牌了。" } },
    { name: "Dana K.", role: { en: "Realtor, Richmond Hill", zh: "地产经纪，列治文山" },
      quote: { en: "A plow knocked my sign down on a Sunday morning. It was back up before lunch. That's the whole review.",
               zh: "周日早上招牌被扫雪车撞倒，午饭前就重新装好了。就这么靠谱。" } },
  ],

  /* ---------- 11. FAQ --------------------------------------------------- */
  faq: [
    { q: { en: "How fast can you install?", zh: "多快可以安装？" },
      a: { en: "Book by noon and we install the same day in most of the GTA. Everything else is done within 24 hours, guaranteed.",
           zh: "中午前预约，大多伦多大部分地区当天即可安装。其他订单保证24小时内完成。" } },
    { q: { en: "Do I need to supply the post?", zh: "需要我自己提供立柱吗？" },
      a: { en: "No. We supply the white post, arm and hooks. You supply your panel and riders, or we can store them for you between listings.",
           zh: "不需要。我们提供白色立柱、横臂及挂钩。您只需提供招牌及挂牌，我们也可以在房源之间代为保管。" } },
    { q: { en: "Is removal included?", zh: "包含拆除吗？" },
      a: { en: "Yes, for post & panel installs and commercial boards. Just message us when it sells or the listing expires.",
           zh: "立柱招牌及商业大牌均包含拆除。房子售出或挂牌到期时发消息给我们即可。" } },
    { q: { en: "What about frozen ground in winter?", zh: "冬天冻土怎么办？" },
      a: { en: "We install year-round. Frozen ground takes special equipment, so there's a small surcharge from about December to March.",
           zh: "我们全年都可以安装。冻土需要专门设备，约12月至3月会收取少量附加费。" } },
    { q: { en: "Can I book in Chinese?", zh: "可以用中文预约吗？" },
      a: { en: "Of course. Message us on WeChat or call. We're happy to help in English or Chinese.",
           zh: "当然可以。欢迎微信或电话联系我们，中英文均可。" } },
    { q: { en: "How do I pay?", zh: "如何付款？" },
      a: { en: "E-transfer or credit card after the install. Monthly and brokerage accounts get one invoice per month.",
           zh: "安装完成后通过电子转账或信用卡付款。月度及地产公司客户每月统一开票。" } },
  ],

  /* ---------- 12. SEARCH ENGINES ---------------------------------------- */
  seo: {
    title: { en: "Northline Sign Posts | Real Estate Sign Installation in the GTA", zh: "北线地产招牌 | 大多伦多地产招牌安装" },
    description: {
      en: "Real estate post & panel sign installation, rider swaps, open house signs and removal for realtors in Toronto and the GTA. Same-day installs.",
      zh: "为多伦多及大多伦多地区地产经纪提供立柱招牌安装、挂牌更换、开放日指示牌及拆除服务。当天安装。",
    },
  },
};
