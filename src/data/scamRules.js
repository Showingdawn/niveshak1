export const scamRules = [
  {
    id: "guaranteed_returns",
    nameEn: "Guaranteed / Fixed Returns Promise",
    nameHi: "गारंटीड / निश्चित रिटर्न का वादा",
    descriptionEn: "Legitimate equity/market investments can never guarantee a fixed percentage return (e.g., 5% daily, 100% double). Markets fluctuate; any guarantee is a massive warning sign for Ponzi schemes.",
    descriptionHi: "वैध इक्विटी/बाजार निवेश कभी भी निश्चित प्रतिशत रिटर्न की गारंटी नहीं दे सकते। बाजार में उतार-चढ़ाव होता है; कोई भी गारंटी पोंजी योजनाओं के लिए एक बड़ा रेड फ्लैग है।",
    severity: "high",
    patterns: [
      /guaranteed\s+(?:profit|return|gain|monthly|daily|weekly)/i,
      /fixed\s+(?:profit|return|gain|monthly|daily)/i,
      /double\s+(?:your\s+)?money/i,
      /100%\s+(?:guaranteed|profit|safe|return|sure)/i,
      /zero\s+risk/i,
      /no\s+risk/i,
      /risk\s*-\s*free/i,
      /मुनाफ़ा\s+गारंटी/i,
      /पैसा\s+दोगुना/i,
      /बिना\s+जोखिम/i,
      /पक्का\s+रिटर्न/i,
      /daily\s+\d+%/i,
      /weekly\s+\d+%/i,
      /monthly\s+(?:return\s+)?of\s+\d+%/i,
      /return\s+of\s+\d+%\s+monthly/i,
      /dono\s+paisa\s+double/i,
      /double\s+investment/i,
      /100%\s+sure\s+shot/i
    ]
  },
  {
    id: "urgency_pressure",
    nameEn: "Artificial Urgency & Scarcity",
    nameHi: "कृत्रिम तात्कालिकता और कमी",
    descriptionEn: "Scammers create false scarcity (e.g., 'limited seats', 'closing in 10 minutes') to force you to invest quickly before you have time to research, verify, or think critically.",
    descriptionHi: "घोटालेबाज कृत्रिम कमी (जैसे, 'सीमित सीटें', '10 मिनट में बंद') पैदा करते हैं ताकि आप शोध करने या गंभीरता से सोचने से पहले जल्दी से निवेश करने के लिए मजबूर हो जाएं।",
    severity: "high",
    patterns: [
      /limited\s+(?:seats|slots|offers?|window)/i,
      /only\s+\d+\s+(?:seats|slots|spots)\s+left/i,
      /hurry\s+up/i,
      /act\s+fast/i,
      /closing\s+(?:soon|today|in\s+\d+)/i,
      /last\s+chance/i,
      /don't\s+miss\s+out/i,
      /opportunity\s+ends/i,
      /valid\s+only\s+(?:for|till)/i,
      /जल्दी\s+करें/i,
      /सीमित\s+सीटें/i,
      /आखिरी\s+मौका/i,
      /सिर्फ\s+आज\s+के\s+लिए/i
    ]
  },
  {
    id: "unregistered_solicitation",
    nameEn: "Unsolicited Private Group Invitation",
    nameHi: "अवांछित निजी समूह आमंत्रण",
    descriptionEn: "Soliciting investments through VIP Telegram groups, private WhatsApp links, or direct messaging is illegal in India for unregistered entities. Authentic advisors never solicit through private chat forwards.",
    descriptionHi: "पंजीकृत नहीं होने वाली संस्थाओं के लिए भारत में वीआईपी टेलीग्राम समूहों, निजी व्हाट्सएप संपर्कों या सीधे संदेशों के माध्यम से निवेश की याचना करना गैरकानूनी है। वास्तविक सलाहकार कभी भी निजी चैट फॉरवर्ड के माध्यम से संपर्क नहीं करते हैं।",
    severity: "high",
    patterns: [
      /join\s+(?:our\s+)?telegram\s+(?:channel|group|vip)/i,
      /telegram\s*:\s*https?:\/\//i,
      /whatsapp\s+(?:group|link|chat)/i,
      /whatsapp\s*:\s*https?:\/\//i,
      /link\s+in\s+bio/i,
      /dm\s+me/i,
      /direct\s+message/i,
      /vip\s+group/i,
      /vip\s+channel/i,
      /premium\s+group/i,
      /telegram\s+चैनल/i,
      /व्हाट्सएप\s+ग्रुप/i,
      /इनबॉक्स\s+में\s+मैसेज\s+करें/i,
      /t\.me\//i,
      /chat\.whatsapp\.com/i
    ]
  },
  {
    id: "pump_dump",
    nameEn: "Pump & Dump / Target Price Shouting",
    nameHi: "पंप एंड डंप / लक्ष्य चिल्लाना",
    descriptionEn: "Calls to aggressively buy a specific small stock to inflate its price (so the promoter/scammer can dump their shares at a peak) are illegal. Legitimate research advisors do not shout buy targets with high pressure.",
    descriptionHi: "किसी विशिष्ट छोटे शेयर को उसका मूल्य बढ़ाने के लिए आक्रामक रूप से खरीदने का आह्वान (ताकि घोटालेबाज चरम पर अपने शेयर बेच सकें) अत्यधिक अवैध है। वैध अनुसंधान सलाहकार उच्च दबाव वाले खरीद लक्ष्य चिल्लाकर नहीं बताते।",
    severity: "high",
    patterns: [
      /jackpot\s+stock/i,
      /multibagger\s+tip/i,
      /insider\s+(?:tip|info|news)/i,
      /target\s+price\s*:\s*\d+/i,
      /target\s*:\s*\d+/i,
      /buy\s+heavy/i,
      /bulk\s+buy/i,
      /tomorrow\s+target/i,
      /upper\s+circuit/i,
      /1000%\s+return\s+stock/i,
      /जैकपॉट\s+शेयर/i,
      /मल्टीबैगर/i,
      /अपर\s+सर्किट/i,
      /टारगेट\s*:\s*\d+/i
    ]
  },
  {
    id: "fake_sebi_advisor",
    nameEn: "Suspicious SEBI Registration Claims",
    nameHi: "संदिग्ध SEBI पंजीकरण दावे",
    descriptionEn: "Fake advisors often claim they are 'SEBI approved' or list invalid/fake registration numbers. Real registered advisors will share their actual number (e.g., INA0000xxxxx), which can be verified on SEBI's official database.",
    descriptionHi: "फर्जी सलाहकार अक्सर दावा करते हैं कि वे 'SEBI द्वारा स्वीकृत' हैं या असली दिखने के लिए फर्जी पंजीकरण संख्या सूचीबद्ध करते हैं। वास्तविक पंजीकृत सलाहकार अपना वास्तविक नंबर (जैसे, INA0000xxxxx) साझा करेंगे, जिसे SEBI के आधिकारिक डेटाबेस पर सत्यापित किया जा सकता है।",
    severity: "medium",
    patterns: [
      /sebi\s+(?:approved|certified|registered)\s+advisor/i,
      /sebi\s+reg\s+(?:no|number)/i,
      /sebi-approved/i,
      /government\s+approved/i,
      /सेबी\s+रजिस्टर्ड/i,
      /सेबी\s+द्वारा\s+मान्यता/i
    ]
  },
  {
    id: "invalid_sebi_format",
    nameEn: "Invalid SEBI License Number Format",
    nameHi: "अवैध SEBI लाइसेंस संख्या प्रारूप",
    descriptionEn: "SEBI registration numbers follow standard formats: INA for advisers, INH for research analysts, INZ for brokers, followed by 9 digits (e.g. INA000012345). Formats like 'SEBI/REG/...' or raw numbers are fake.",
    descriptionHi: "SEBI पंजीकरण संख्याएं मानक प्रारूप का पालन करती हैं: सलाहकारों के लिए INA, अनुसंधान विश्लेषकों के लिए INH, ब्रोकरों के लिए INZ, जिसके बाद 9 अंक होते हैं। 'SEBI/REG/...' या सामान्य संख्याएँ नकली हैं।",
    severity: "high",
    patterns: [
      /sebi\/reg\/\d+/i,
      /registration\s+no\s*:\s*(?!IN[AHZ]\d{9})\w+/i,
      /reg\s+no\s*:\s*(?!IN[AHZ]\d{9})\w+/i,
      /licence\s*:\s*(?!IN[AHZ]\d{9})\w+/i,
      /पंजीकरण\s+संख्या\s*:\s*(?!IN[AHZ]\d{9})\w+/i
    ]
  },
  {
    id: "celebrity_endorsement",
    nameEn: "Stolen Celebrity / Influencer Credibility",
    nameHi: "प्रसिद्ध व्यक्तियों की विश्वसनीयता का दुरुपयोग",
    descriptionEn: "Scammers drop names of famous corporate figures (Jhunjhunwala, Nikhil Kamath, Ambani) to trick you into believing they are backing the scheme. Real corporate figures never endorse chat-group stock tips.",
    descriptionHi: "घोटालेबाज प्रसिद्ध कॉर्पोरेट हस्तियों (झुनझुनवाला, निखिल कामत, अंबानी) के नामों का दुरुपयोग करते हैं ताकि आपको विश्वास हो सके कि वे इस योजना का समर्थन कर रहे हैं। वे कभी भी चैट-समूहों में स्टॉक टिप्स का समर्थन नहीं करते हैं।",
    severity: "high",
    patterns: [
      /rakesh\s+jhunjhunwala/i,
      /nikhil\s+kamath/i,
      /nithin\s+kamath/i,
      /kamath\s+recommendation/i,
      /ambani\s+(?:trust|fund|family)/i,
      /anant\s+ambani/i,
      /adani\s+(?:secret|group)/i,
      /निखिल\s+कामत/i,
      /राकेश\s+झुनझुनवाला/i,
      /अंबानी/i
    ]
  },
  {
    id: "operator_info",
    nameEn: "Operator Leak / Insider Tip Framing",
    nameHi: "ऑपरेटर लीक / इनसाइडर जानकारी का दावा",
    descriptionEn: "Promising 'insider info' or 'operator leaks' is a classic trap used to make you feel you have a secret advantage. Insider trading is illegal, and in chat groups, these are fabricated to inflate microcap stock volumes.",
    descriptionHi: "'इनसाइडर जानकारी' या 'ऑपरेटर लीक' का वादा एक पुराना जाल है जो आपको यह महसूस कराने के लिए उपयोग किया जाता है कि आपके पास कोई गुप्त लाभ है। इनसाइडर ट्रेडिंग अवैध है और यह स्टॉक की मात्रा बढ़ाने के लिए निर्मित की जाती है।",
    severity: "high",
    patterns: [
      /insider\s+(?:tip|info|news|source)/i,
      /operator\s+(?:leak|group|info|pump|call)/i,
      /leak\s+from\s+operator/i,
      /secret\s+operator/i,
      /इनसाइडर\s+टिप/i,
      /ऑपरेटर\s+लीक/i
    ]
  },
  {
    id: "advance_payment",
    nameEn: "Upfront Verification / Processing Fee Request",
    nameHi: "अग्रिम शुल्क / प्रोसेसिंग फीस का अनुरोध",
    descriptionEn: "Asking for advance security deposits, GST clearances, or activation fees before unlocking stock recommendations is a direct fraud indicator. Legitimate advisors never request payments in this manner.",
    descriptionHi: "स्टॉक सिफारिशें अनलॉक करने से पहले अग्रिम सुरक्षा जमा, जीएसटी निकासी या एक्टिवेशन शुल्क मांगना सीधे तौर पर धोखाधड़ी का संकेत है। वैध सलाहकार कभी भी इस तरह से भुगतान का अनुरोध नहीं करते हैं।",
    severity: "high",
    patterns: [
      /refundable\s+(?:fee|security|deposit)/i,
      /processing\s+(?:fee|charge)/i,
      /advance\s+payment/i,
      /pay\s+first/i,
      /deposit\s+rs\.\s*\d+/i,
      /pay\s+rs\.\s*\d+/i,
      /registration\s+charges/i,
      /अग्रिम\s+भुगतान/i,
      /प्रोसेसिंग\s+फीस/i,
      /सिक्योरिटी\s+डिपॉजिट/i
    ]
  },
  {
    id: "profit_sharing",
    nameEn: "Unregulated Profit-Sharing Proposals",
    nameHi: "अनधिकृत लाभ-साझेदारी प्रस्ताव",
    descriptionEn: "Proposing '50-50 profit splitting' or asking for commission shares after profits are made is explicitly banned by SEBI guidelines to prevent conflict of interest. Authentic advisors charge flat fees.",
    descriptionHi: "'50-50 लाभ विभाजन' का प्रस्ताव देना या लाभ कमाने के बाद कमीशन शेयर मांगना SEBI के दिशानिर्देशों द्वारा स्पष्ट रूप से प्रतिबंधित है। प्रामाणिक सलाहकार फ्लैट शुल्क लेते हैं।",
    severity: "high",
    patterns: [
      /profit\s+sharing\s+agreement/i,
      /profit\s+split/i,
      /share\s+your\s+profit/i,
      /commission\s+after\s+profit/i,
      /split\s+the\s+profits/i,
      /मुनाफे\s+का\s+हिस्सा/i,
      /प्रॉफिट\s+शेयरिंग/i
    ]
  },
  {
    id: "screenshot_proof",
    nameEn: "Screenshot / Profit Proof Baiting",
    nameHi: "स्क्रीनशॉट / मुनाफे के झूठे सबूत",
    descriptionEn: "Chat forwards referencing profit alert screenshots are meant to trigger fear-of-missing-out (FOMO). Scammers easily manufacture fake transaction alerts using editing tools or inspect-element hacks.",
    descriptionHi: "मुनाफे के अलर्ट स्क्रीनशॉट का हवाला देने वाले चैट फॉरवर्ड का उद्देश्य आपकी लालच को जगाना है। घोटालेबाज आसानी से संपादन टूल का उपयोग करके नकली लेनदेन अलर्ट तैयार करते हैं।",
    severity: "medium",
    patterns: [
      /check\s+(?:my|our\s+)?profit\s+screenshot/i,
      /profit\s+proof/i,
      /look\s+at\s+(?:the\s+)?screenshot/i,
      /proof\s+attached/i,
      /bank\s+alert\s+screenshot/i,
      /screenshot\s+देखे/i,
      /मुनाफे\s+का\s+सबूत/i
    ]
  },
  {
    id: "broker_impersonation",
    nameEn: "Broker Stolen Identity / Impersonation",
    nameHi: "ब्रोकर की नकली पहचान",
    descriptionEn: "Claiming to represent major brokers (Zerodha support team, official Groww executives, Angel One alerts) inside unofficial social chats is a flag. Genuine support never contacts users via forwards to pitch stocks.",
    descriptionHi: "अनौपचारिक सोशल चैट के अंदर प्रमुख ब्रोकरों (Zerodha सपोर्ट टीम, आधिकारिक Groww एक्जीक्यूटिव) का प्रतिनिधित्व करने का दावा करना संदिग्ध है। वे कभी भी स्टॉक बेचने के लिए फॉरवर्ड के माध्यम से उपयोगकर्ताओं से संपर्क नहीं करते हैं।",
    severity: "high",
    patterns: [
      /zerodha\s+support/i,
      /groww\s+support/i,
      /angel\s+one\s+executive/i,
      /official\s+groww\s+channel/i,
      /official\s+zerodha/i,
      /official\s+angel\s+one/i,
      /जेरोधा\s+सपोर्ट/i,
      /ग्रो\s+सपोर्ट/i
    ]
  },
  {
    id: "loss_recovery",
    nameEn: "Guaranteed Past Loss Recovery Promise",
    nameHi: "पिछले नुकसान की वसूली का पक्का वादा",
    descriptionEn: "Promising to 'recover all your past stock market losses' is a common target trick for frustrated investors who have lost capital. No one can guarantee market recovery.",
    descriptionHi: "निवेशकों को 'आपके पिछले सभी शेयर बाजार के नुकसान की वसूली' का वादा करना एक सामान्य जाल है। कोई भी बाजार की वसूली की गारंटी नहीं दे सकता है।",
    severity: "high",
    patterns: [
      /recover\s+(?:your\s+)?loss/i,
      /loss\s+recovery/i,
      /recover\s+all\s+losses/i,
      /नुकसान\s+की\s+भरपाई/i,
      /लॉस\s+रिकवरी/i
    ]
  },
  {
    id: "offshore_arbitrage",
    nameEn: "Offshore Arbitrage / Unregulated Yield Bots",
    nameHi: "विदेशी मध्यस्थता / अवैध ट्रेडिंग बॉट",
    descriptionEn: "Claims of earning yields through foreign currency arbitrage, crypto trading bots, or international platform spreads are highly risky and fall outside Indian regulatory safety nets.",
    descriptionHi: "विदेशी मुद्रा मध्यस्थता, क्रिप्टो ट्रेडिंग बॉट या अंतर्राष्ट्रीय स्प्रेड के माध्यम से रिटर्न कमाने के दावे अत्यधिक जोखिम भरे हैं और भारतीय नियामक सुरक्षा के दायरे से बाहर हैं।",
    severity: "high",
    patterns: [
      /arbitrage\s+(?:between|yield|bot)/i,
      /crypto\s+(?:trading\s+)?bot/i,
      /global\s+exchange\s+spread/i,
      /binary\s+options\s+yield/i,
      /क्रिप्टो\s+ट्रेडिंग\s+बॉट/i
    ]
  },
  {
    id: "gift_shares",
    nameEn: "Gift / pre-IPO Bonus Stock Unlocking",
    nameHi: "गिफ्ट / प्री-IPO बोनस शेयर अनलॉक जाल",
    descriptionEn: "Claiming you have been gifted bonus pre-IPO shares but requiring an activation/verification fee to release them is a common advance-fee fraud model.",
    descriptionHi: "दावा करना कि आपको प्री-IPO शेयर उपहार में दिए गए हैं, लेकिन उन्हें जारी करने के लिए एक्टिवेशन/सत्यापन शुल्क की आवश्यकता है, यह धोखाधड़ी का एक सामान्य रूप है।",
    severity: "high",
    patterns: [
      /gifted\s+shares/i,
      /pre-ipo\s+bonus/i,
      /unlock\s+(?:your\s+)?bonus\s+stocks/i,
      /activation\s+fee\s+for\s+shares/i,
      /बोनस\s+शेयर\s+अनलॉक/i
    ]
  }
];

export const runScamAnalysis = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      verdict: "LOW",
      findings: [],
      ranges: []
    };
  }

  let totalScore = 0;
  const findings = [];
  const matchedRanges = [];

  scamRules.forEach((rule) => {
    let ruleMatched = false;
    let occurrences = 0;

    rule.patterns.forEach((pattern) => {
      let match;
      const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      
      while ((match = globalPattern.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        
        // Ensure this match does not overlap an already matched range
        const isOverlap = matchedRanges.some(r => (start >= r.start && start < r.end) || (end > r.start && end <= r.end));
        
        if (!isOverlap) {
          matchedRanges.push({ 
            start, 
            end, 
            severity: rule.severity, 
            ruleNameEn: rule.nameEn, 
            ruleNameHi: rule.nameHi 
          });
          ruleMatched = true;
          occurrences++;
        }
      }
    });

    if (ruleMatched) {
      const weight = rule.severity === "high" ? 25 : 12;
      totalScore += weight * Math.min(occurrences, 2); // Cap duplicate rule penalty
      findings.push({
        ruleId: rule.id,
        nameEn: rule.nameEn,
        nameHi: rule.nameHi,
        descriptionEn: rule.descriptionEn,
        descriptionHi: rule.descriptionHi,
        severity: rule.severity
      });
    }
  });

  let verdict = "LOW";
  let score = Math.min(totalScore, 100);

  if (score >= 50) {
    verdict = "HIGH";
  } else if (score >= 15) {
    verdict = "MEDIUM";
  }

  return {
    score,
    verdict,
    findings,
    ranges: matchedRanges
  };
};

// 4 Official Test templates for verifying the analysis accuracy
export const officialTestTemplates = [
  {
    id: "scam_1",
    labelEn: "Test Case 1: Ponzi Guarantee & Telegram VIP",
    labelHi: "परीक्षण १: पोंजी गारंटी और टेलीग्राम आमंत्रण",
    text: "GET 100% GUARANTEED MONTHLY PROFIT! Double your investment in 20 days with zero risk. Recommended by Nikhil Kamath of Zerodha. Join our VIP Telegram channel t.me/profitmax now before seats close. Only 4 slots left!"
  },
  {
    id: "scam_2",
    labelEn: "Test Case 2: Pump & Dump & Profit Sharing",
    labelHi: "परीक्षण २: पंप एंड डंप और लाभ-साझेदारी",
    text: "JACKPOT STOCK ALERT! Buy bulk shares of SHIVAM COTTON tomorrow at market open. Target price is 400. Upper circuit guaranteed by operators. Official Groww support channel leak. Look at our users' profit screenshots showing Rs. 5 Lakhs gain daily! Profit sharing agreement of 30% after earnings."
  },
  {
    id: "scam_3",
    labelEn: "Test Case 3: Fake SEBI Format & Upfront Fee",
    labelHi: "परीक्षण ३: नकली SEBI संख्या और अग्रिम शुल्क",
    text: "We are SEBI approved advisors. Registration No: SEBI/REG/100523 (suspicious format). Pay refundable processing fee of Rs. 4,999 to start getting direct jackpot calls. Guaranteed monthly returns of 40%."
  },
  {
    id: "clean_1",
    labelEn: "Test Case 4: Legitimate Corporate Financial News",
    labelHi: "परीक्षण ४: प्रामाणिक कॉर्पोरेट समाचार (सुरक्षित)",
    text: "State Bank of India (SBI) reported a net profit of Rs. 14,205 crore for the fourth quarter, up 83% year-on-year, driven by strong growth in net interest income and lower provisions. Net Interest Margin (NIM) expanded to 3.84%, while gross non-performing assets (NPA) declined to 2.78% from 3.53% in the previous quarter."
  }
];
