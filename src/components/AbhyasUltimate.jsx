import React, { useState, useEffect, useRef } from 'react';

// TradingView Pro Technical Chart Component
function TradingViewWidget({ symbol }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tvSymbol = (() => {
      if (!symbol) return 'NSE:RELIANCE';
      let s = String(symbol).toUpperCase().trim();
      if (s.includes(':')) return s;
      if (s.endsWith('.NS')) return `NSE:${s.replace('.NS', '')}`;
      if (s.endsWith('.BS')) return `BSE:${s.replace('.BS', '')}`;
      if (s === 'NIFTY' || s === 'NIFTY50' || s === 'NIFTY_50') return 'NSE:NIFTY';
      if (s === 'SENSEX') return 'BSE:SENSEX';
      return `NSE:${s}`;
    })();

    const container = containerRef.current;
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = `tv_${Math.random().toString(36).substring(2, 9)}`;
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = "100%";
    widgetDiv.style.minHeight = "360px";
    container.appendChild(widgetDiv);

    const init = () => {
      if (!window.TradingView || !document.getElementById(widgetDiv.id)) return;
      try {
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#070E1A',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          hide_legend: false,
          save_image: true,
          container_id: widgetDiv.id,
          hide_volume: false,
          studies: [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies"
          ],
          overrides: {
            "paneProperties.background": "#070E1A",
            "paneProperties.backgroundType": "solid",
            "scalesProperties.textColor": "#8FA0B5"
          }
        });
      } catch (err) {
        console.warn("TradingView widget init error:", err);
      }
    };

    let script = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => setTimeout(init, 150);
      document.head.appendChild(script);
    } else if (window.TradingView) {
      setTimeout(init, 100);
    } else {
      script.addEventListener('load', () => setTimeout(init, 150));
    }

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '360px', borderRadius: '6px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '360px' }} />
    </div>
  );
}

// Candlestick Pattern Recognition Helper Function
function detectCandlestickPatterns(candles) {
  if (!candles || candles.length < 2) return [];
  
  const patterns = [];
  const len = candles.length;
  
  const current = candles[len - 1];
  const prev = candles[len - 2];
  
  const body = Math.abs(current.close - current.open);
  const range = current.high - current.low || 0.01;
  const upperWick = current.high - Math.max(current.open, current.close);
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const isGreen = current.close >= current.open;
  
  // Trend detection looking back up to 5 candles
  let trend = "SIDEWAYS";
  if (len >= 4) {
    const oldestClose = candles[Math.max(0, len - 5)].close;
    const previousClose = candles[len - 2].close;
    if (previousClose < oldestClose * 0.98) {
      trend = "DOWN";
    } else if (previousClose > oldestClose * 1.02) {
      trend = "UP";
    }
  }

  // A. EXTENDED SINGLE CANDLESTICK PATTERNS

  // Doji Family: body size <= 5% of total range
  if (body <= range * 0.05) {
    const midPoint = current.low + range * 0.5;
    const openCloseAvg = (current.open + current.close) / 2;
    
    // Dragonfly Doji: Open/Close near High (upper shadow <= 10% of range)
    if (current.high - Math.max(current.open, current.close) <= range * 0.10) {
      patterns.push({
        nameEn: "Dragonfly Doji (Bullish Reversal)",
        nameHi: "ड्रैगनफ्लाई दोजी (तेजी का संकेत)",
        descEn: "Open and Close are near the High. Strong rejection of lower prices. Possible bullish turn.",
        descHi: "ओपन और क्लोज हाई के पास हैं। निचले स्तरों का मजबूत रिजेक्शन, तेजी की संभावना।",
        type: "BULLISH",
        icon: "⚖️"
      });
    }
    // Gravestone Doji: Open/Close near Low (lower shadow <= 10% of range)
    else if (Math.min(current.open, current.close) - current.low <= range * 0.10) {
      patterns.push({
        nameEn: "Gravestone Doji (Bearish Reversal)",
        nameHi: "ग्रेवस्टोन दोजी (मंदी का संकेत)",
        descEn: "Open and Close are near the Low. Rally was completely sold into. Possible bearish reversal.",
        descHi: "ओपन और क्लोज लो के पास हैं। तेजी के बाद मजबूत बिकवाली, मंदी की संभावना।",
        type: "BEARISH",
        icon: "⚖️"
      });
    }
    // Long-Legged Doji: Midpoint open/close with long shadows
    else if (upperWick > range * 0.35 && lowerWick > range * 0.35 && Math.abs(openCloseAvg - midPoint) < range * 0.15) {
      patterns.push({
        nameEn: "Long-Legged Doji (Volatility Alert)",
        nameHi: "लॉन्ग-लेग्ड दोजी (अस्थिरता चेतावनी)",
        descEn: "Long upper and lower shadows, open/close near middle. High market indecision and volatility.",
        descHi: "लंबे ऊपरी और निचले शैडो, बीच में ओपन/क्लोज। बाजार में गहरी दुविधा और बड़ी हलचल का संकेत।",
        type: "NEUTRAL",
        icon: "⚖️"
      });
    }
    else {
      patterns.push({
        nameEn: "Standard Doji (Indecision)",
        nameHi: "मानक दोजी (अनिर्णय)",
        descEn: "Indicates market indecision. Keep watch for support/resistance breakouts.",
        descHi: "बाजार में अनिर्णय की स्थिति। सपोर्ट और रेजिस्टेंस टूटने का इंतजार करें।",
        type: "NEUTRAL",
        icon: "⚖️"
      });
    }
  }

  // Hammer / Hanging Man: Body in upper 30% of range, lower shadow >= 2x body, upper shadow <= 10% of range
  if (Math.min(current.open, current.close) - current.low >= body * 2.0 && upperWick <= range * 0.10 && body > 0) {
    if (trend === "DOWN" || trend === "SIDEWAYS") {
      patterns.push({
        nameEn: "Hammer (Bullish Reversal)",
        nameHi: "हैमर पैटर्न (तेजी का रिवर्सल)",
        descEn: "Hammer found in a downtrend. Indicates buyers entered strongly at the lows.",
        descHi: "गिरावट के बाद बना हैमर। दर्शाता है कि खरीदारों ने निचले स्तरों से मजबूत वापसी की है।",
        type: "BULLISH",
        icon: "🔨"
      });
    } else if (trend === "UP") {
      patterns.push({
        nameEn: "Hanging Man (Bearish Reversal)",
        nameHi: "हैंगिंग मैन (मंदी का रिवर्सल)",
        descEn: "Hanging Man found in an uptrend. Suggests selling pressure is starting to mount.",
        descHi: "तेजी के बाद बना हैंगिंग मैन। संकेत देता है कि बिकवाली का दबाव बढ़ना शुरू हो गया है।",
        type: "BEARISH",
        icon: "🔨"
      });
    }
  }

  // Inverted Hammer / Shooting Star: Body in lower 30% of range, upper shadow >= 2x body, lower shadow <= 10% of range
  if (current.high - Math.max(current.open, current.close) >= body * 2.0 && lowerWick <= range * 0.10 && body > 0) {
    if (trend === "DOWN" || trend === "SIDEWAYS") {
      patterns.push({
        nameEn: "Inverted Hammer (Bullish Signal)",
        nameHi: "उल्टा हैमर (तेजी का संकेत)",
        descEn: "Inverted Hammer in a downtrend. Shows buyers tried to push up, indicating potential reversal.",
        descHi: "गिरावट के बाद उल्टा हैमर। दर्शाता है कि खरीदारों ने जोर आजमाइश शुरू की है, तेजी आ सकती है।",
        type: "BULLISH",
        icon: "📐"
      });
    } else if (trend === "UP") {
      patterns.push({
        nameEn: "Shooting Star (Bearish Reversal)",
        nameHi: "शूटिंग स्टार (मंदी का संकेत)",
        descEn: "Shooting Star in an uptrend. Rejection of highs, sellers took control.",
        descHi: "तेजी के बाद बना शूटिंग स्टार। उच्च स्तरों से बिकवाली, विक्रेताओं ने बाजार पर नियंत्रण लिया।",
        type: "BEARISH",
        icon: "☄️"
      });
    }
  }

  // Marubozu: solid body, shadows <= 5% of range
  if (body >= range * 0.95) {
    if (isGreen) {
      patterns.push({
        nameEn: "Bullish Marubozu (Aggressive Buy)",
        nameHi: "बुलिश मारूबोज़ू (आक्रामक खरीद)",
        descEn: "Long green body with almost no wicks. Extremely strong buying momentum.",
        descHi: "बिना किसी पूंछ वाली मजबूत हरी कैंडल। बाजार में अत्यंत मजबूत खरीद का दबाव है।",
        type: "BULLISH",
        icon: "⚡"
      });
    } else {
      patterns.push({
        nameEn: "Bearish Marubozu (Aggressive Sell)",
        nameHi: "बेरिश मारूबोज़ू (आक्रामक बिक्री)",
        descEn: "Long red body with almost no wicks. Extremely strong selling momentum.",
        descHi: "बिना किसी पूंछ वाली मजबूत लाल कैंडल। बाजार में अत्यंत मजबूत बिकवाली का दबाव है।",
        type: "BEARISH",
        icon: "⚡"
      });
    }
  }

  // B. EXTENDED DOUBLE CANDLESTICK PATTERNS (Requires at least 2 candles)
  if (len >= 2) {
    const prevBody = Math.abs(prev.close - prev.open);
    const prevIsGreen = prev.close >= prev.open;

    // Engulfing
    if (!prevIsGreen && isGreen && current.close > prev.open && current.open < prev.close && body > prevBody) {
      patterns.push({
        nameEn: "Bullish Engulfing (Strong Buyers)",
        nameHi: "बुलिश एंगल्फिंग (मजबूत खरीदार)",
        descEn: "Green candle body fully engulfs the previous red candle body. Significant buying pressure.",
        descHi: "हरी कैंडल की बॉडी पिछली लाल कैंडल को पूरी तरह ढक लेती है। मजबूत खरीद का संकेत।",
        type: "BULLISH",
        icon: "🟢"
      });
    }
    else if (prevIsGreen && !isGreen && current.close < prev.open && current.open > prev.close && body > prevBody) {
      patterns.push({
        nameEn: "Bearish Engulfing (Strong Sellers)",
        nameHi: "बेरिश एंगल्फिंग (मजबूत बिकवाल)",
        descEn: "Red candle body fully engulfs the previous green candle body. Strong selling signal.",
        descHi: "लाल कैंडल की बॉडी पिछली हरी कैंडल को पूरी तरह ढक लेती है। मजबूत मंदी का संकेत।",
        type: "BEARISH",
        icon: "🔴"
      });
    }

    // Piercing Line / Dark Cloud Cover
    if (!prevIsGreen && isGreen && current.open < prev.low) {
      // Piercing: closes > 50% into body of prev
      const prevMid = prev.close + (prev.open - prev.close) * 0.5;
      if (current.close > prevMid && current.close < prev.open) {
        patterns.push({
          nameEn: "Piercing Line (Bullish Reversal)",
          nameHi: "पियर्सिंग लाइन (तेजी का संकेत)",
          descEn: "Bullish candle opened below previous low but closed more than 50% deep into its bearish body.",
          descHi: "हरी कैंडल पिछले लो से नीचे खुली लेकिन पिछली लाल बॉडी के 50% से अधिक ऊपर जाकर बंद हुई।",
          type: "BULLISH",
          icon: "🌅"
        });
      }
    }
    else if (prevIsGreen && !isGreen && current.open > prev.high) {
      // Dark Cloud: closes > 50% deep into body of prev
      const prevMid = prev.open + (prev.close - prev.open) * 0.5;
      if (current.close < prevMid && current.close > prev.open) {
        patterns.push({
          nameEn: "Dark Cloud Cover (Bearish Reversal)",
          nameHi: "डार्क क्लाउड कवर (मंदी का संकेत)",
          descEn: "Bearish candle opened above previous high but closed more than 50% deep into its bullish body.",
          descHi: "लाल कैंडल पिछले हाई से ऊपर खुली लेकिन पिछली हरी बॉडी के 50% से अधिक नीचे जाकर बंद हुई।",
          type: "BEARISH",
          icon: "⛈️"
        });
      }
    }

    // Tweezer Bottoms & Tops (diff <= 0.05% of price)
    const priceLimit = current.close * 0.0005;
    if (trend === "DOWN" && Math.abs(current.low - prev.low) <= priceLimit) {
      patterns.push({
        nameEn: "Tweezer Bottom (Support Double Touch)",
        nameHi: "ट्वीज़र बॉटम (मजबूत सपोर्ट संकेत)",
        descEn: "Two consecutive candles sharing the exact same low. Strong support holds, reversal likely.",
        descHi: "लगातार दो कैंडल समान निचला स्तर साझा करती हैं। मजबूत सपोर्ट, तेजी की प्रबल संभावना।",
        type: "BULLISH",
        icon: "⚖️"
      });
    }
    else if (trend === "UP" && Math.abs(current.high - prev.high) <= priceLimit) {
      patterns.push({
        nameEn: "Tweezer Top (Resistance Rejection)",
        nameHi: "ट्वीज़र टॉप (मजबूत रेजिस्टेंस संकेत)",
        descEn: "Two consecutive candles sharing the exact same high. Strong resistance holds, reversal likely.",
        descHi: "लगातार दो कैंडल समान उच्च स्तर साझा करती हैं। मजबूत रेजिस्टेंस, मंदी की प्रबल संभावना।",
        type: "BEARISH",
        icon: "⚖️"
      });
    }

    // Harami Structures
    if (!prevIsGreen && isGreen && current.open > prev.close && current.close < prev.open && body < prevBody * 0.6) {
      patterns.push({
        nameEn: "Bullish Harami (Reversal Alert)",
        nameHi: "बुलिश हरामी (तेजी की चेतावनी)",
        descEn: "Small green candle body contained completely within the previous large red candle body.",
        descHi: "छोटी हरी कैंडल पिछले सत्र की बड़ी लाल कैंडल की बॉडी के भीतर सिमट गई है। मंदी रुकने का संकेत।",
        type: "BULLISH",
        icon: "🤰"
      });
    }
    else if (prevIsGreen && !isGreen && current.open < prev.close && current.close > prev.open && body < prevBody * 0.6) {
      patterns.push({
        nameEn: "Bearish Harami (Reversal Alert)",
        nameHi: "बेरिश हरामी (मंदी की चेतावनी)",
        descEn: "Small red candle body contained completely within the previous large green candle body.",
        descHi: "छोटी लाल कैंडल पिछली हरी कैंडल की बड़ी बॉडी के भीतर सिमट गई है। तेजी रुकने का संकेत।",
        type: "BEARISH",
        icon: "🤰"
      });
    }
  }

  // C. EXTENDED TRIPLE & MULTI-BAR HARMONIC PATTERNS
  if (len >= 3) {
    const c3 = candles[len - 3];
    const c2 = candles[len - 2];
    const c1 = candles[len - 1];

    const c3IsGreen = c3.close >= c3.open;
    const c2IsGreen = c2.close >= c2.open;
    const c1IsGreen = c1.close >= c1.open;

    const c3Body = Math.abs(c3.close - c3.open);
    const c2Body = Math.abs(c2.close - c2.open);
    const c1Body = Math.abs(c1.close - c1.open);

    // Morning Star
    if (!c3IsGreen && c3Body > c3.close * 0.015 && c2Body < c3Body * 0.3 && c1IsGreen && c1.close > c3.close - c3Body * 0.5 && c2.close < c3.close) {
      patterns.push({
        nameEn: "Morning Star (Major Bullish Reversal)",
        nameHi: "मॉर्निंग स्टार (बड़ा बुलिश संकेत)",
        descEn: "A large red candle, a small star gapping down, and a large green candle closing deep in the first.",
        descHi: "बड़ी लाल कैंडल, नीचे गैप के साथ छोटी कैंडल, और बड़ी हरी कैंडल जो पहले के मध्य से ऊपर बंद हो।",
        type: "BULLISH",
        icon: "⭐"
      });
    }
    // Evening Star
    else if (c3IsGreen && c3Body > c3.close * 0.015 && c2Body < c3Body * 0.3 && !c1IsGreen && c1.close < c3.close + c3Body * 0.5 && c2.close > c3.close) {
      patterns.push({
        nameEn: "Evening Star (Major Bearish Reversal)",
        nameHi: "इवनिंग स्टार (बड़ा बेरिश संकेत)",
        descEn: "A large green candle, a small star gapping up, and a large red candle closing deep in the first.",
        descHi: "बड़ी हरी कैंडल, ऊपर गैप के साथ छोटी कैंडल, और बड़ी लाल कैंडल जो पहले के मध्य से नीचे बंद हो।",
        type: "BEARISH",
        icon: "⭐"
      });
    }

    // Three White Soldiers & Three Black Crows
    if (c3IsGreen && c2IsGreen && c1IsGreen && c1.close > c2.close && c2.close > c3.close && c1.volume > c2.volume * 0.9 && c2.volume > c3.volume * 0.9) {
      patterns.push({
        nameEn: "Three White Soldiers (Strong Continuation)",
        nameHi: "थ्री व्हाइट सोल्जर्स (मजबूत तेजी)",
        descEn: "Three consecutive progressive long green candles with steady/expanding volume. High momentum.",
        descHi: "बढ़ती हुई वॉल्यूम के साथ लगातार तीन बड़ी हरी कैंडल। बेहद मजबूत खरीद रुझान जारी रहने का संकेत।",
        type: "BULLISH",
        icon: "💂"
      });
    }
    else if (!c3IsGreen && !c2IsGreen && !c1IsGreen && c1.close < c2.close && c2.close < c3.close && c1.volume > c2.volume * 0.9 && c2.volume > c3.volume * 0.9) {
      patterns.push({
        nameEn: "Three Black Crows (Strong Continuation)",
        nameHi: "थ्री ब्लैक क्रोज़ (मजबूत मंदी)",
        descEn: "Three consecutive progressive long red candles with steady/expanding volume. High selling pressure.",
        descHi: "बढ़ती हुई वॉल्यूम के साथ लगातार तीन बड़ी लाल कैंडल। बेहद मजबूत बिकवाली रुझान जारी रहने का संकेत।",
        type: "BEARISH",
        icon: "🐦"
      });
    }
  }

  // 4 or 5 candle structures
  if (len >= 4) {
    const c4 = candles[len - 4];
    const c3 = candles[len - 3];
    const c2 = candles[len - 2];
    const c1 = candles[len - 1];

    const c4IsGreen = c4.close >= c4.open;
    const c3IsGreen = c3.close >= c3.open;
    const c2IsGreen = c2.close >= c2.open;
    const c1IsGreen = c1.close >= c1.open;

    // Three Line Strike
    if (!c4IsGreen && !c3IsGreen && !c2IsGreen && c1IsGreen && c3.close < c4.close && c2.close < c3.close && c1.open <= c2.close && c1.close >= c4.open) {
      patterns.push({
        nameEn: "Three Line Strike (Hyper Bullish Reversal)",
        nameHi: "थ्री लाइन स्ट्राइक (अति तीव्र तेजी)",
        descEn: "Three consecutive bearish candles fully recovered by a single massive outer bullish candle. Extreme squeeze.",
        descHi: "तीन लगातार गिरावट वाली कैंडल एक ही विशाल हरी कैंडल द्वारा निगल ली गईं। आक्रामक तेजी का संकेत।",
        type: "BULLISH",
        icon: "⚡"
      });
    }
    else if (c4IsGreen && c3IsGreen && c2IsGreen && !c1IsGreen && c3.close > c4.close && c2.close > c3.close && c1.open >= c2.close && c1.close <= c4.open) {
      patterns.push({
        nameEn: "Three Line Strike (Hyper Bearish Reversal)",
        nameHi: "थ्री लाइन स्ट्राइक (अति तीव्र मंदी)",
        descEn: "Three consecutive bullish candles fully wiped out by a single massive outer bearish candle. Extreme dump.",
        descHi: "तीन लगातार बढ़त वाली कैंडल एक ही विशाल लाल कैंडल द्वारा निगल ली गईं। आक्रामक मंदी का संकेत।",
        type: "BEARISH",
        icon: "⚡"
      });
    }
  }

  if (len >= 5) {
    const c5 = candles[len - 5];
    const c4 = candles[len - 4];
    const c3 = candles[len - 3];
    const c2 = candles[len - 2];
    const c1 = candles[len - 1];

    const c5IsGreen = c5.close >= c5.open;
    const c4IsGreen = c4.close >= c4.open;
    const c3IsGreen = c3.close >= c3.open;
    const c2IsGreen = c2.close >= c2.open;
    const c1IsGreen = c1.close >= c1.open;

    // Rising Three Methods
    if (c5IsGreen && !c4IsGreen && !c3IsGreen && !c2IsGreen && c1IsGreen &&
        c4.high < c5.high && c4.low > c5.low &&
        c3.high < c5.high && c3.low > c5.low &&
        c2.high < c5.high && c2.low > c5.low &&
        c1.close > c5.high) {
      patterns.push({
        nameEn: "Rising Three Methods (Bullish Continuation)",
        nameHi: "राइजिंग थ्री मेथड्स (तेजी का सिलसिला)",
        descEn: "A long green candle, followed by three small red candles staying inside its range, concluding with a bullish breakout.",
        descHi: "एक बड़ी हरी कैंडल, उसके अंदर सिमटती तीन छोटी लाल कैंडल, और फिर ऊपर की तरफ ब्रेकआउट देने वाली हरी कैंडल।",
        type: "BULLISH",
        icon: "📈"
      });
    }
    // Falling Three Methods
    else if (!c5IsGreen && c4IsGreen && c3IsGreen && c2IsGreen && !c1IsGreen &&
        c4.high < c5.high && c4.low > c5.low &&
        c3.high < c5.high && c3.low > c5.low &&
        c2.high < c5.high && c2.low > c5.low &&
        c1.close < c5.low) {
      patterns.push({
        nameEn: "Falling Three Methods (Bearish Continuation)",
        nameHi: "फॉलिंग थ्री मेथड्स (मंदी का सिलसिला)",
        descEn: "A long red candle, followed by three small green candles staying inside its range, concluding with a bearish breakout.",
        descHi: "एक बड़ी लाल कैंडल, उसके अंदर सिमटती तीन छोटी हरी कैंडल, और फिर नीचे की तरफ ब्रेकआउट देने वाली लाल कैंडल।",
        type: "BEARISH",
        icon: "📉"
      });
    }
  }

  return patterns;
}

export default function AbhyasUltimate({ lang, theme }) {
  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  // ---- State ----
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  const [portfolio, setPortfolio] = useState({
    balance: 100000.0,
    total_invested: 0,
    total_current_value: 0,
    total_absolute_return: 0,
    total_absolute_return_pct: 0,
    portfolio_xirr: 0,
    holdings: [],
    mandates: [],
    transactions: []
  });

  const [searchQ, setSearchQ] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'STOCK' | 'ETF' | 'MUTUAL_FUND'
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'mandates' | 'ledger'
  const [backtestActive, setBacktestActive] = useState(false);
  const [chartType, setChartType] = useState('TRADINGVIEW'); // 'TRADINGVIEW' | 'SVG_MICRO'
  const [backtestStrategy, setBacktestStrategy] = useState('SMA_CROSSOVER'); // 'BUY_HOLD' | 'SMA_CROSSOVER'
  const [backtestResults, setBacktestResults] = useState(null);
  
  // Order entry states
  const [tradeType, setTradeType] = useState('BUY_LONG'); // 'BUY_LONG' | 'SELL_LONG' | 'SHORT_SELL' | 'COVER_SHORT'
  const [orderMode, setOrderMode] = useState('DELIVERY'); // 'DELIVERY' | 'INTRADAY' | 'SIP'
  const [inputQty, setInputQty] = useState('10');
  const [inputAmt, setInputAmt] = useState('5000');
  const [sipInterval, setSipInterval] = useState('30'); // 30 days
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text }

  // ---- Hackathon States ----
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [whaleAlert, setWhaleAlert] = useState(null);
  const [whaleFlash, setWhaleFlash] = useState(false);
  const [trailingSL, setTrailingSL] = useState({}); // { assetId: stopPrice }
  
  const [cognitiveIndex, setCognitiveIndex] = useState(100);
  const [psychFlags, setPsychFlags] = useState([]);
  const [tradeTimestamps, setTradeTimestamps] = useState([]);
  const [lastTradeTime, setLastTradeTime] = useState(0);

  const [badges, setBadges] = useState([]);
  const [sebiFrozen, setSebiFrozen] = useState(false);
  const [audioNarrator, setAudioNarrator] = useState(true);

  const [chaosMode, setChaosMode] = useState(false);
  const [chaosError, setChaosError] = useState(null);
  const [chaosLatencyOffset, setChaosLatencyOffset] = useState(0);
  const [telemetry, setTelemetry] = useState({ loopMs: 0.12, dbReadMs: 1.15, memory: "26.4 MB" });

  // Accessible Audio Narrator Voice Synthesizer
  const speakNarrator = (text) => {
    if (!('speechSynthesis' in window) || !audioNarrator) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => lang === 'hi' ? v.lang.includes('hi') : v.lang.includes('en'));
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Gamified progression badges loader
  const fetchBadges = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/abhyas/badges/sandbox_user");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.map(b => b.badge_id));
      }
    } catch (err) {}
  };

  const unlockBadge = async (badgeId) => {
    if (badges.includes(badgeId)) return;
    try {
      const res = await fetch("http://localhost:5000/api/abhyas/badges/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "sandbox_user", badgeId })
      });
      if (res.ok) {
        showToast("success", `🏆 BADGE UNLOCKED: ${badgeId}!`);
        fetchBadges();
        speakNarrator(`Congratulations! You unlocked the badge: ${badgeId.replaceAll('_', ' ')}`);
      }
    } catch (err) {}
  };

  // Strategy Backtesting Engine
  const handleRunBacktest = () => {
    if (!selectedAsset || !selectedAsset.history || selectedAsset.history.length === 0) {
      showToast('error', getTxt('No candle data available for backtesting.', 'बैकटेस्टिंग के लिए कैंडल डेटा उपलब्ध नहीं है।'));
      return;
    }

    const history = selectedAsset.history;
    const initialVal = 100000;
    let cash = initialVal;
    let holdingQty = 0;
    const trades = [];
    const equityCurve = [initialVal];

    if (backtestStrategy === 'BUY_HOLD') {
      const buyPrice = history[0].close;
      holdingQty = Math.floor(cash / buyPrice);
      cash -= holdingQty * buyPrice;
      trades.push({ type: 'BUY', price: buyPrice, qty: holdingQty, date: 'Candle 1' });

      for (let i = 0; i < history.length; i++) {
        const currentVal = cash + (holdingQty * history[i].close);
        equityCurve.push(currentVal);
      }
    } else {
      // 5/15 SMA Crossover Strategy
      const getSMA = (data, period, endIdx) => {
        if (endIdx < period - 1) return null;
        let sum = 0;
        for (let i = endIdx - period + 1; i <= endIdx; i++) {
          sum += data[i].close;
        }
        return sum / period;
      };

      for (let i = 0; i < history.length; i++) {
        const sma5 = getSMA(history, 5, i);
        const sma15 = getSMA(history, 15, i);
        const prevSma5 = getSMA(history, 5, i - 1);
        const prevSma15 = getSMA(history, 15, i - 1);

        if (sma5 && sma15 && prevSma5 && prevSma15) {
          if (prevSma5 <= prevSma15 && sma5 > sma15 && holdingQty === 0) {
            const price = history[i].close;
            holdingQty = Math.floor(cash / price);
            if (holdingQty > 0) {
              cash -= holdingQty * price;
              trades.push({ type: 'BUY', price: price, qty: holdingQty, date: `Candle ${i + 1}` });
            }
          } else if (prevSma5 >= prevSma15 && sma5 < sma15 && holdingQty > 0) {
            const price = history[i].close;
            cash += holdingQty * price;
            trades.push({ type: 'SELL', price: price, qty: holdingQty, date: `Candle ${i + 1}` });
            holdingQty = 0;
          }
        }
        const currentVal = cash + (holdingQty * history[i].close);
        equityCurve.push(currentVal);
      }
    }

    const finalVal = cash + (holdingQty * history[history.length - 1].close);
    const returnPct = ((finalVal - initialVal) / initialVal) * 100;

    setBacktestResults({
      initialVal,
      finalVal,
      returnPct,
      trades,
      equityCurve
    });

    showToast('success', getTxt('Backtest simulation completed!', 'बैकटेस्ट सिमुलेशन पूरा हुआ!'));
  };

  // Psychological cognitive tracking algorithm
  const trackCognitiveStats = (isNewTrade) => {
    const now = Date.now();
    let newTimestamps = [...tradeTimestamps];
    if (isNewTrade) {
      newTimestamps.push(now);
      setLastTradeTime(now);
    }
    
    newTimestamps = newTimestamps.filter(t => now - t < 60000);
    setTradeTimestamps(newTimestamps);

    let score = 100;
    const flags = [];

    if (isNewTrade && lastTradeTime > 0 && now - lastTradeTime < 8000) {
      flags.push(getTxt("🚨 Revenge Trading Tendency", "🚨 प्रतिशोध ट्रेडिंग प्रवृत्ति (Revenge Trading)"));
      score -= 25;
    }

    if (newTimestamps.length > 4) {
      flags.push(getTxt("⚠️ Overtrading Fatigue Detected", "⚠️ अत्यधिक ट्रेडिंग (Overtrading)"));
      score -= 30;
    }

    const tradeSize = parseFloat(inputQty) * (selectedAsset?.current_price || 0);
    if (tradeSize > 40000) {
      flags.push(getTxt("⚡ High Speculative Leverage Warning", "⚡ उच्च सट्टा जोखिम (Speculative Leverage)"));
      score -= 20;
    }

    score = Math.max(10, score);
    setCognitiveIndex(score);
    setPsychFlags(flags);
    
    if (score < 50) {
      speakNarrator("Warning: High cognitive fatigue and emotional overtrading pattern detected. Stability index critical.");
    }
  };

  // Trailing Stop Loss execution
  const executeTrailingStop = async (holding, stopPrice) => {
    showToast("error", `🚨 TRAILING STOP TRIGGERED for ${holding.symbol} at ₹${stopPrice}!`);
    speakNarrator(`Trailing stop loss triggered for ${holding.symbol} at ${stopPrice}. Position liquidated.`);
    
    try {
      await fetch("http://localhost:5000/api/market/execute-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "sandbox_user",
          assetId: holding.asset_id,
          tradeType: holding.total_quantity > 0 ? "SELL_LONG" : "COVER_SHORT",
          orderMode: "DELIVERY",
          quantity: Math.abs(holding.total_quantity),
          patternOriginTag: "TrailingStopLoss",
          slippageChargesDeducted: 0,
          realizedNetPnl: holding.absolute_return,
          psychologyFlags: "TrailingSLTriggered",
          executionSpeedMs: 12
        })
      });
      fetchPortfolioSummary();
    } catch (err) {}
  };

  // Order Book depth level generator
  useEffect(() => {
    if (!selectedAsset) return;
    const price = selectedAsset.current_price;
    const spread = price * 0.0008; 
    const bids = [];
    const asks = [];
    for (let i = 0; i < 5; i++) {
      const offset = (i + 1) * price * 0.0005;
      bids.push({
        price: parseFloat((price - spread - offset).toFixed(2)),
        qty: Math.floor(150 + Math.random() * 850)
      });
      asks.push({
        price: parseFloat((price + spread + offset).toFixed(2)),
        qty: Math.floor(150 + Math.random() * 850)
      });
    }
    setOrderBook({ bids, asks });

    if (Math.random() < 0.12) {
      const isWhaleSell = Math.random() < 0.5;
      const whaleQty = Math.floor(5000 + Math.random() * 15000);
      const whalePrice = isWhaleSell ? price * 0.985 : price * 1.015;
      
      setWhaleAlert({
        type: isWhaleSell ? "SELL" : "BUY",
        qty: whaleQty,
        price: parseFloat(whalePrice.toFixed(2)),
        timestamp: new Date().toLocaleTimeString()
      });
      setWhaleFlash(true);
      setTimeout(() => setWhaleFlash(false), 2000);
      
      speakWhaleAlert(whaleQty, isWhaleSell);
    }
  }, [selectedAsset?.current_price]);

  const speakWhaleAlert = (whaleQty, isWhaleSell) => {
    if (audioNarrator) {
      speakNarrator(isWhaleSell ? 
        `Whale Alert: Institutional sell order of ${whaleQty} shares detected!` :
        `Whale Alert: Institutional buy order of ${whaleQty} shares detected!`
      );
    }
  };

  // Vocalize candlestick patterns when they change
  const prevPatternRef = useRef("");
  useEffect(() => {
    if (!selectedAsset || !selectedAsset.history || selectedAsset.history.length === 0) return;
    const detected = detectCandlestickPatterns(selectedAsset.history);
    if (detected.length > 0) {
      const patName = detected[0].nameEn;
      if (patName !== prevPatternRef.current) {
        prevPatternRef.current = patName;
        const textToSpeak = lang === 'en' ? 
          `Alert: ${selectedAsset.symbol} shows a new ${detected[0].nameEn} pattern!` :
          `चेतावनी: ${selectedAsset.symbol} में नया ${detected[0].nameHi} पैटर्न मिला है!`;
        speakNarrator(textToSpeak);
        
        // Trigger Progression Badge Unlocks!
        if (patName.includes("Hammer") || patName.includes("Doji")) {
          unlockBadge("Pattern_Padawan");
        } else if (patName.includes("Star") || patName.includes("Strike")) {
          unlockBadge("Breakout_Brahmachari");
        }
      }
    } else {
      prevPatternRef.current = "";
    }
  }, [selectedAsset?.symbol, selectedAsset?.current_price]);

  // Trailing Stop Loss surveillance
  useEffect(() => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) return;
    
    let updatedSL = { ...trailingSL };
    let triggeredStop = false;

    portfolio.holdings.forEach(h => {
      const isLong = h.total_quantity > 0;
      const price = h.current_price;
      const entry = h.average_buy_price;
      
      if (isLong) {
        const profitPct = (price - entry) / entry;
        if (profitPct > 0.01) {
          const currentSL = updatedSL[h.asset_id] || entry;
          const peak = Math.max(price, entry * 1.01);
          const calculatedSL = parseFloat((peak * 0.995).toFixed(2));
          const newSL = Math.max(currentSL, calculatedSL, entry);
          
          if (!updatedSL[h.asset_id] || newSL > updatedSL[h.asset_id]) {
            updatedSL[h.asset_id] = newSL;
          }

          if (price < updatedSL[h.asset_id]) {
            triggeredStop = true;
            executeTrailingStop(h, updatedSL[h.asset_id]);
            delete updatedSL[h.asset_id];
          }
        }
      }
    });

    if (triggeredStop) {
      unlockBadge("SEBI_Ready_Shaktimaan");
    }

    setTrailingSL(updatedSL);
  }, [portfolio?.holdings?.map(h => h.current_price).join(',')]);

  // ---- Fetch Data ----
  const fetchMarketQuotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/market/quotes");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
        if (data.length > 0) {
          setSelectedAsset(prev => {
            const found = data.find(a => prev && a.id === prev.id);
            return found || data[0];
          });
        }
      }
    } catch (err) {
      showToast('error', 'Market API server offline.');
    }
  };

  const fetchPortfolioSummary = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/market/portfolio-summary/sandbox_user");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (err) {
      showToast('error', 'Portfolio API server offline.');
    }
  };

  // Poll market quotes every 10 seconds to simulate ticks
  useEffect(() => {
    fetchMarketQuotes();
    fetchPortfolioSummary();
    fetchBadges();
    const interval = setInterval(fetchMarketQuotes, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync portfolio whenever selected asset price ticks, or after trades
  useEffect(() => {
    fetchPortfolioSummary();
  }, [selectedAsset?.current_price]);

  // ---- Keyboard Shortcuts Hook ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'b') {
        e.preventDefault();
        setTradeType('BUY_LONG');
        showToast('success', getTxt('Shortcuts: Selected BUY direction', 'शॉर्टकट: BUY दिशा चुनी गई'));
        speakNarrator('Buy order mode selected.');
      } else if (key === 's') {
        e.preventDefault();
        setTradeType('SELL_LONG');
        showToast('success', getTxt('Shortcuts: Selected SELL direction', 'शॉर्टकट: SELL दिशा चुनी गई'));
        speakNarrator('Sell order mode selected.');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setInputQty('10');
        setInputAmt('5000');
        setOrderMode('DELIVERY');
        showToast('success', getTxt('Shortcuts: Order parameters reset', 'शॉर्टकट: ऑर्डर सेटिंग्स रीसेट'));
        speakNarrator('Order parameters reset.');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!assets || assets.length === 0) return;
        e.preventDefault();
        
        const currentIdx = assets.findIndex(a => selectedAsset && a.id === selectedAsset.id);
        let nextIdx = 0;
        
        if (e.key === 'ArrowUp') {
          nextIdx = currentIdx <= 0 ? assets.length - 1 : currentIdx - 1;
        } else {
          nextIdx = currentIdx === -1 || currentIdx === assets.length - 1 ? 0 : currentIdx + 1;
        }
        
        const targetAsset = assets[nextIdx];
        if (targetAsset) {
          setSelectedAsset(targetAsset);
          speakNarrator(targetAsset.symbol);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [assets, selectedAsset]);

  // ---- Helper UI functions ----
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Place Order Action ----
  const handleExecuteOrder = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const isMF = selectedAsset.asset_type === 'MUTUAL_FUND';
    
    // Systematic mandate scheduling
    if (orderMode === 'SIP') {
      const recurringVal = isMF ? parseFloat(inputAmt) : parseFloat(inputQty);
      if (isNaN(recurringVal) || recurringVal <= 0) {
        showToast('error', getTxt('Invalid systematic value', 'अमान्य व्यवस्थित आवर्ती मान'));
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/market/systematic-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "sandbox_user",
            assetId: selectedAsset.id,
            mandateType: isMF ? "SIP" : "STOCK_SIP",
            recurringValue: recurringVal,
            intervalDays: parseInt(sipInterval)
          })
        });

        const data = await res.json();
        if (res.ok) {
          showToast('success', getTxt('Systematic mandate scheduled successfully!', 'व्यवस्थित निवेश निर्देश सफलतापूर्वक पंजीकृत!'));
          fetchPortfolioSummary();
        } else {
          showToast('error', data.error || 'Mandate scheduling failed');
        }
      } catch (err) {
        showToast('error', 'Could not schedule SIP mandate');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Standard orders execution
    const orderValue = isMF ? parseFloat(inputAmt) : (parseFloat(inputQty) * selectedAsset.current_price);
    
    // E. SEBI Sandbox Guardrail Freeze
    if (completedLessonsCount === 0 && orderValue > 50000) {
      setSebiFrozen(true);
      showToast('error', getTxt('SPECULATION BLOCKED: Complete educational lessons first!', 'सट्टा व्यापार अवरुद्ध: पहले सीखो पाठ पूरा करें!'));
      speakNarrator("Speculation Blocked! Simulated SEBI sandbox freeze activated. You must complete basic educational lessons before placing trades over fifty thousand rupees.");
      return;
    }

    // 3. Indian Market Friction Simulator (Slippage/Fees)
    const brokerage = orderValue * 0.0003; // 0.03%
    const stt = orderValue * 0.001; // 0.1%
    const gst = brokerage * 0.18; // 18% GST on Brokerage
    const sebiTurnover = orderValue * 0.0000032; // 0.00032%
    const totalFriction = parseFloat((brokerage + stt + gst + sebiTurnover).toFixed(2));

    // Volume Confirmation Filter
    let volumeWarning = false;
    if (!isMF && selectedAsset.history && selectedAsset.history.length > 5) {
      const vHistory = selectedAsset.history.map(c => c.volume);
      const avgVol = vHistory.reduce((sum, v) => sum + v, 0) / vHistory.length;
      const currentVol = vHistory[vHistory.length - 1] || 1;
      if (currentVol < avgVol * 1.5) {
        volumeWarning = true;
        showToast('error', getTxt('⚠️ Fakeout Warning: Low volume confirmation breakout!', '⚠️ नकली ब्रेकआउट चेतावनी: कम वॉल्यूम की पुष्टि!'));
      }
    }

    // A. Cognitive stability overtrading update
    trackCognitiveStats(true);

    const payload = {
      userId: "sandbox_user",
      assetId: selectedAsset.id,
      tradeType,
      orderMode,
      patternOriginTag: detectCandlestickPatterns(selectedAsset.history)[0]?.nameEn || "ManualTrade",
      slippageChargesDeducted: totalFriction,
      realizedNetPnl: 0,
      psychologyFlags: `${volumeWarning ? 'LowVolumeFakeout' : ''}${cognitiveIndex < 70 ? 'RevengeTradeRisk' : ''}`,
      executionSpeedMs: 0
    };

    if (isMF) {
      payload.amount = parseFloat(inputAmt);
      if (isNaN(payload.amount) || payload.amount <= 0) {
        showToast('error', getTxt('Please enter a valid investment amount', 'सही निवेश राशि दर्ज करें'));
        return;
      }
    } else {
      payload.quantity = parseFloat(inputQty);
      if (isNaN(payload.quantity) || payload.quantity <= 0) {
        showToast('error', getTxt('Please enter a valid quantity', 'सही संख्या दर्ज करें'));
        return;
      }
    }

    setLoading(true);
    const tStart = performance.now();
    try {
      // Simulate lag offset if chaos spike is active
      if (chaosLatencyOffset > 0) {
        await new Promise(r => setTimeout(r, chaosLatencyOffset));
      }

      const res = await fetch("http://localhost:5000/api/market/execute-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          executionSpeedMs: Math.round(performance.now() - tStart)
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', getTxt('Order executed successfully!', 'ऑर्डर सफलतापूर्वक पूरा हुआ!'));
        fetchPortfolioSummary();
        
        // Progress unlock achievements
        if (tradeType === 'SHORT_SELL') {
          unlockBadge("SEBI_Ready_Shaktimaan");
        }
      } else {
        showToast('error', data.error || 'Execution failed');
      }
    } catch (err) {
      showToast('error', 'Server error executing trade');
    } finally {
      setLoading(false);
    }
  };

  const handleExportLedger = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/market/export-ledger?userId=sandbox_user");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.packet], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("success", getTxt("Passbook ledger exported cryptographically!", "लेनदेन पासबुक सुरक्षित रूप से निर्यात की गई!"));
        speakNarrator("Transaction ledger exported successfully as cryptographically secure local file.");
      } else {
        showToast("error", "Export failed.");
      }
    } catch (err) {
      showToast("error", "API Server offline during export.");
    }
  };

  // ---- Simulate Systematic Mandate cycle ----
  const handleTriggerMandate = async (mandateId) => {
    showToast('success', getTxt('Processing systematic cycle fast-forward...', 'एसआईपी भुगतान चक्र को आगे बढ़ाया जा रहा है...'));
    try {
      const res = await fetch("http://localhost:5000/api/market/systematic-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "sandbox_user", mandateId })
      });
      if (res.ok) {
        showToast('success', getTxt('Systematic mandate cycle executed!', 'आवर्ती निर्देश चक्र सफलतापूर्वक पूरा!'));
        fetchPortfolioSummary();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Fast-forward execution failed');
      }
    } catch (err) {
      showToast('error', 'Could not run mandate cycle.');
    }
  };

  // ---- Clear/Reset Sandbox ----
  const handleResetSandbox = async () => {
    if (!window.confirm(getTxt('Reset portfolio balance to ₹1,00,000 and clear all holdings?', 'क्या आप पोर्टफोलियो को रीसेट करना चाहते हैं?'))) return;
    try {
      const res = await fetch("http://localhost:5000/api/abhyas/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "sandbox_user" })
      });
      if (res.ok) {
        showToast('success', getTxt('Sandbox reset successfully!', 'पोर्टफोलियो रीसेट सफल!'));
        fetchPortfolioSummary();
      }
    } catch (err) {
      showToast('error', 'Could not reset sandbox.');
    }
  };

  // ---- Filter and Search logic ----
  const filteredAssets = assets.filter(a => {
    const q = searchQ.toLowerCase().trim();
    const matchesSearch = a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.sector.toLowerCase().includes(q);
    const matchesFilter = filterType === 'ALL' || a.asset_type === filterType;
    return matchesSearch && matchesFilter;
  });

  // ---- Custom SVG Candlestick & FVG Chart ----
  const renderInteractiveChart = (history, fvg) => {
    if (!history || history.length === 0) {
      return (
        <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA0B5' }}>
          Loading historical candlestick metrics...
        </div>
      );
    }

    const margin = { top: 20, right: 70, bottom: 25, left: 10 };
    const chartWidth = 620;
    const chartHeight = 320;
    const plotWidth = chartWidth - margin.left - margin.right;
    const plotHeight = chartHeight - margin.top - margin.bottom;

    const prices = history.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const getX = (index) => margin.left + (index / (history.length - 1)) * plotWidth;
    const getY = (price) => margin.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;

    const candleWidth = Math.max(2, Math.floor(plotWidth / history.length) - 2);

    // Pivot Point & Fibonacci calculations
    const lastClose = history[history.length - 1]?.close || minPrice;
    const hMax = maxPrice;
    const lMin = minPrice;
    
    const pivot = (hMax + lMin + lastClose) / 3;
    const r1 = 2 * pivot - lMin;
    const s1 = 2 * pivot - hMax;
    const fibDiff = hMax - lMin;
    const fib50 = hMax - fibDiff * 0.5;
    const fib618 = hMax - fibDiff * 0.618;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {/* Y Axis Gridlines & Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const priceVal = minPrice + ratio * priceRange;
          const y = getY(priceVal);
          return (
            <g key={idx}>
              <line x1={margin.left} y1={y} x2={chartWidth - margin.right} y2={y} stroke="#13233c" strokeDasharray="3,3" />
              <text x={chartWidth - margin.right + 8} y={y + 4} fill="#8FA0B5" fontSize="9px" fontFamily="monospace" textAnchor="start">
                ₹{priceVal.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Support/Resistance & Fibonacci Gridlines Overlay */}
        {[
          { label: "Pivot", val: pivot, col: "#e67e22" },
          { label: "Resist 1", val: r1, col: "#e74c3c" },
          { label: "Support 1", val: s1, col: "#2ecc71" },
          { label: "Fib 50%", val: fib50, col: "#9b59b6" },
          { label: "Fib 61.8%", val: fib618, col: "#3498db" }
        ].map((level, lidx) => {
          const y = getY(level.val);
          if (y < margin.top || y > margin.top + plotHeight) return null;
          return (
            <g key={`lvl-${lidx}`}>
              <line x1={margin.left} y1={y} x2={chartWidth - margin.right} y2={y} stroke={level.col} strokeWidth="0.85" strokeDasharray="4,4" opacity="0.65" />
              <text x={margin.left + 5} y={y - 3} fill={level.col} fontSize="7px" fontFamily="monospace" fontWeight="bold" opacity="0.8">
                {level.label}: ₹{level.val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* FVG Highlight Box Overlay */}
        {fvg && (
          (() => {
            const fvgYTop = getY(fvg.top);
            const fvgYBottom = getY(fvg.bottom);
            const fvgBoxHeight = Math.abs(fvgYBottom - fvgYTop);
            const isBullish = fvg.type === 'BULLISH';
            const fvgFill = isBullish ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)';
            const fvgStroke = isBullish ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
            return (
              <g>
                <rect
                  x={margin.left}
                  y={Math.min(fvgYTop, fvgYBottom)}
                  width={plotWidth}
                  height={fvgBoxHeight}
                  fill={fvgFill}
                  stroke={fvgStroke}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <rect
                  x={margin.left + 6}
                  y={Math.min(fvgYTop, fvgYBottom) + 4}
                  rx="2"
                  ry="2"
                  width="135"
                  height="16"
                  fill="#070E1A"
                  stroke={isBullish ? '#22c55e' : '#ef4444'}
                  strokeWidth="1"
                />
                <text
                  x={margin.left + 12}
                  y={Math.min(fvgYTop, fvgYBottom) + 15}
                  fill={isBullish ? '#22c55e' : '#ef4444'}
                  fontSize="8px"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {isBullish ? '🟩 BULLISH FVG: ' : '🟥 BEARISH FVG: '}{fvg.size}%
                </text>
              </g>
            );
          })()
        )}

        {/* Candlesticks loop */}
        {history.map((candle, idx) => {
          const x = getX(idx);
          const yOpen = getY(candle.open);
          const yClose = getY(candle.close);
          const yHigh = getY(candle.high);
          const yLow = getY(candle.low);
          
          const isGreen = candle.close >= candle.open;
          const strokeColor = isGreen ? '#22c55e' : '#ef4444';
          const fillColor = isGreen ? '#22c55e' : '#ef4444';

          return (
            <g key={idx}>
              {/* Wick */}
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={strokeColor} strokeWidth="1.2" />
              {/* Body */}
              <rect
                x={x - candleWidth / 2}
                y={Math.min(yOpen, yClose)}
                width={candleWidth}
                height={Math.max(1, Math.abs(yOpen - yClose))}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Pattern overlay marker on latest candle */}
        {(() => {
          const detected = detectCandlestickPatterns(history);
          if (detected.length > 0) {
            const lastIdx = history.length - 1;
            const x = getX(lastIdx);
            const latestCandle = history[lastIdx];
            const isGreen = latestCandle.close >= latestCandle.open;
            const y = isGreen ? getY(latestCandle.high) - 10 : getY(latestCandle.low) + 16;
            const color = detected[0].type === 'BULLISH' ? '#22c55e' : (detected[0].type === 'BEARISH' ? '#ef4444' : '#8FA0B5');
            return (
              <g>
                <circle cx={x} cy={isGreen ? y + 4 : y - 10} r="2.5" fill={color} />
                <text
                  x={x}
                  y={y}
                  fill={color}
                  fontSize="7px"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {detected[0].icon} {getTxt(detected[0].nameEn.split(' ')[0], detected[0].nameHi.split(' ')[0])}
                </text>
              </g>
            );
          }
          return null;
        })()}
      </svg>
    );
  };

  return (
    <div style={{
      backgroundColor: '#070E1A',
      color: '#E8E4DA',
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      padding: '20px',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* HEADER HUD BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A1628', border: '1px solid #1a2840', borderRadius: '8px', padding: '12px 20px' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#D98E04', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚔️ Abhyas Ultimate Trading & SIP Simulator
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setAudioNarrator(!audioNarrator)}
            style={{
              backgroundColor: audioNarrator ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1.5px solid ${audioNarrator ? '#22c55e' : '#ef4444'}`,
              borderRadius: '4px',
              color: audioNarrator ? '#22c55e' : '#ef4444',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔊 {audioNarrator ? getTxt("Voice HUD: Active", "ऑडियो गाइड: चालू") : getTxt("Voice HUD: Muted", "ऑडियो गाइड: मौन")}
          </button>
        </div>
      </div>

      {/* 1. TOP METRICS PORTAL CARD */}
      <div className="holographic-glass glow-breathe" style={{
        padding: '24px 20px',
        margin: '10px 0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
              💰 {getTxt("VIRTUAL WALLET BALANCE", "वर्चुअल कैश बैलेंस")}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#22c55e', marginTop: '6px', fontFamily: 'monospace', textShadow: '0 0 8px rgba(34,197,94,0.3)' }}>
              ₹{portfolio.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '2px' }}>
              {getTxt("Consolidated margin allocation", "संयुक्त कुल वर्चुअल पूंजी")}
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
              📊 {getTxt("TOTAL INVESTED CAPITAL", "कुल निवेशित राशि")}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', marginTop: '6px', fontFamily: 'monospace' }}>
              ₹{portfolio.total_invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '2px' }}>
              {getTxt("Base initial margin", "प्रारंभिक आधार राशि")}
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
              📈 {getTxt("CURRENT MARGIN PORTFOLIO", "पोर्टफोलियो का वर्तमान मूल्य")}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fb923c', marginTop: '6px', fontFamily: 'monospace', textShadow: '0 0 8px rgba(251,146,60,0.3)' }}>
              ₹{portfolio.total_current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '2px' }}>
              {getTxt("Live value of holdings", "होल्डिंग्स का लाइव मूल्य")}
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
              🛡️ {getTxt("FLOATING RETURN P&L", "अवास्तविक लाभ/हानि")}
            </span>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: '900',
              color: portfolio.total_absolute_return >= 0 ? '#22c55e' : '#ef4444',
              marginTop: '6px',
              fontFamily: 'monospace',
              textShadow: portfolio.total_absolute_return >= 0 ? '0 0 8px rgba(34,197,94,0.3)' : '0 0 8px rgba(239,68,68,0.3)'
            }}>
              {portfolio.total_absolute_return >= 0 ? '+' : ''}₹{portfolio.total_absolute_return.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <span style={{ fontSize: '0.82rem', marginLeft: '6px', fontWeight: '900' }}>
                ({portfolio.total_absolute_return_pct >= 0 ? '+' : ''}{portfolio.total_absolute_return_pct}%)
              </span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
              🏆 {getTxt("CONSOLIDATED XIRR", "कुल संचित XIRR")}
            </span>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: '900',
              color: Number(portfolio.portfolio_xirr) >= 0 ? '#22c55e' : '#ef4444',
              marginTop: '6px',
              fontFamily: 'monospace',
              textShadow: Number(portfolio.portfolio_xirr) >= 0 ? '0 0 8px rgba(34,197,94,0.3)' : '0 0 8px rgba(239,68,68,0.3)'
            }}>
              {(() => {
                const val = Number(portfolio.portfolio_xirr);
                if (isNaN(val) || !isFinite(val) || Math.abs(val) > 9999) return "+0.00%";
                return (val >= 0 ? '+' : '') + val.toFixed(2) + '%';
              })()}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '2px' }}>
              {getTxt("Newton-Raphson calculated", "न्यूटन-रैप्सन द्वारा विश्लेषित")}
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Diagnostics HUD */}
      <div style={{
        backgroundColor: '#050b14',
        border: '1px solid #1a2840',
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.68rem',
        color: '#8FA0B5',
        fontFamily: 'monospace',
        marginTop: '-10px'
      }}>
        <div>
          <span style={{ color: '#22c55e' }}>●</span> SYSTEM ONLINE • COMPUTE LOGS
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>SCAN LOOP: <strong style={{ color: '#E8E4DA' }}>{telemetry.loopMs}ms</strong></span>
          <span>DB latency: <strong style={{ color: '#E8E4DA' }}>{telemetry.dbReadMs}ms</strong></span>
          <span>heap: <strong style={{ color: '#E8E4DA' }}>{telemetry.memory}</strong></span>
        </div>
      </div>

      {/* 2. DUAL COLUMN WORKSPACE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: WATCHLIST SIDEBAR */}
        <div className="ledger-card" style={{ padding: '16px', backgroundColor: '#0A1628', borderColor: '#1a2840', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Filters & Search */}
          <div>
            <h3 style={{ fontSize: '1rem', color: '#E8E4DA', marginBottom: '12px', fontWeight: '800' }}>
              🔍 {getTxt("Search Watchlist", "असेट वॉचलिस्ट")}
            </h3>
            <input
              type="text"
              placeholder={getTxt("Search symbol, name...", "असेट का नाम खोजें...")}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#070E1A',
                border: '1px solid #2a3f5f',
                borderRadius: '6px',
                color: '#E8E4DA',
                padding: '8px 12px',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '10px'
              }}
            />
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { key: 'ALL', label: getTxt('All', 'सभी') },
                { key: 'STOCK', label: getTxt('Stocks', 'स्टॉक') },
                { key: 'ETF', label: getTxt('ETFs', 'ईटीएफ') },
                { key: 'MUTUAL_FUND', label: getTxt('Mutual Funds', 'म्यूचुअल फंड') },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilterType(t.key)}
                  style={{
                    backgroundColor: filterType === t.key ? '#D98E04' : '#070E1A',
                    border: '1px solid #2a3f5f',
                    borderRadius: '4px',
                    color: filterType === t.key ? '#000' : '#8FA0B5',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Watchlist list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
            {filteredAssets.map(asset => {
              const isSelected = selectedAsset && selectedAsset.id === asset.id;
              const hasFVG = asset.fvg !== null;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid var(--color-amber)' : '1px solid #1a2840',
                    backgroundColor: isSelected ? 'rgba(217, 142, 4, 0.05)' : '#070E1A',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.backgroundColor = '#102138')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.backgroundColor = '#070E1A')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#E8E4DA' }}>{asset.symbol}</strong>
                      <span style={{ fontSize: '0.65rem', color: '#8FA0B5', display: 'block', marginTop: '2px' }}>{asset.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#E8E4DA', fontFamily: 'monospace' }}>
                        ₹{asset.current_price.toFixed(2)}
                      </strong>
                      {hasFVG && (
                        <span style={{
                          display: 'block',
                          fontSize: '0.58rem',
                          backgroundColor: asset.fvg.type === 'BULLISH' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: asset.fvg.type === 'BULLISH' ? '#22c55e' : '#ef4444',
                          border: `1px solid ${asset.fvg.type === 'BULLISH' ? '#22c55e' : '#ef4444'}`,
                          borderRadius: '3px',
                          padding: '1px 4px',
                          marginTop: '3px',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          FVG {asset.fvg.size}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyboard Shortcuts Hint Panel */}
          <div style={{
            backgroundColor: '#070E1A',
            border: '1px solid #1a2840',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '0.72rem',
            color: '#8FA0B5'
          }}>
            <strong style={{ color: '#D98E04', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              ⌨️ {getTxt("Keyboard HUD Shortcuts", "कीबोर्ड शॉर्टकट निर्देश")}
            </strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontFamily: 'monospace' }}>
              <div><kbd style={{ backgroundColor: '#13233c', padding: '2px 5px', borderRadius: '3px', color: '#fff' }}>B</kbd> : {getTxt("Buy Mode", "बाय मोड")}</div>
              <div><kbd style={{ backgroundColor: '#13233c', padding: '2px 5px', borderRadius: '3px', color: '#fff' }}>S</kbd> : {getTxt("Sell Mode", "सेल मोड")}</div>
              <div><kbd style={{ backgroundColor: '#13233c', padding: '2px 5px', borderRadius: '3px', color: '#fff' }}>Esc</kbd> : {getTxt("Reset", "रीसेट")}</div>
              <div><kbd style={{ backgroundColor: '#13233c', padding: '2px 5px', borderRadius: '3px', color: '#fff' }}>▲/▼</kbd> : {getTxt("Watchlist", "वॉचलिस्ट")}</div>
            </div>
          </div>

          {/* Cognitive Stability Widget */}
          <div style={{
            backgroundColor: '#070E1A',
            border: '1px solid #1a2840',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                🧠 {getTxt("Cognitive Stability Index", "मानसिक स्थिरता इंडेक्स")}
              </span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '900',
                color: cognitiveIndex >= 70 ? '#22c55e' : (cognitiveIndex >= 40 ? '#D98E04' : '#ef4444')
              }}>
                {cognitiveIndex}%
              </span>
            </div>
            <div style={{
              width: '100%',
              backgroundColor: '#13233c',
              height: '6px',
              borderRadius: '3px',
              marginTop: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${cognitiveIndex}%`,
                backgroundColor: cognitiveIndex >= 70 ? '#22c55e' : (cognitiveIndex >= 40 ? '#D98E04' : '#ef4444'),
                height: '100%',
                transition: 'width 0.3s ease'
              }} />
            </div>
            {psychFlags.length > 0 ? (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {psychFlags.map((flag, fidx) => (
                  <div key={fidx} style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold' }}>
                    {flag}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.65rem', color: '#8FA0B5', marginTop: '6px' }}>
                ✅ {getTxt("Decisions fully objective. Low overtrading risk.", "निर्णय पूरी तरह से तर्कसंगत हैं।")}
              </div>
            )}
          </div>

          {/* Progression Badges Widget */}
          <div style={{
            backgroundColor: '#070E1A',
            border: '1px solid #1a2840',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              🏆 {getTxt("Unlocked Passbook Badges", "अनलॉक किए गए मेडल")}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[
                { id: "Pattern_Padawan", label: "Pattern Padawan", icon: "🔰", desc: "Recognize 1st candlestick patterns" },
                { id: "Breakout_Brahmachari", label: "Breakout Yogi", icon: "🧘", desc: "Catch high momentum trends" },
                { id: "SEBI_Ready_Shaktimaan", label: "SEBI Shaktimaan", icon: "🛡️", desc: "Short sell with risk offsets" }
              ].map(badge => {
                const isUnlocked = badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    title={badge.desc}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border: `1px solid ${isUnlocked ? 'var(--color-amber)' : '#1a2840'}`,
                      backgroundColor: isUnlocked ? 'rgba(217, 142, 4, 0.08)' : 'rgba(0,0,0,0.2)',
                      opacity: isUnlocked ? 1 : 0.4,
                      cursor: 'help'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem' }}>{badge.icon}</div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 'bold', color: isUnlocked ? '#E8E4DA' : '#8FA0B5', marginTop: '2px', lineHeight: '1.1' }}>
                      {badge.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Chaos Engineering Test Widget */}
          <div style={{
            backgroundColor: '#070E1A',
            border: '1px solid #1a2840',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                👾 {getTxt("Chaos Engineering Controls", "केऑस इंजीनियरिंग कंट्रोल्स")}
              </span>
              <button
                type="button"
                onClick={() => setChaosMode(!chaosMode)}
                style={{
                  fontSize: '0.62rem',
                  backgroundColor: chaosMode ? '#ef4444' : '#13233c',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {chaosMode ? "ON" : "OFF"}
              </button>
            </div>
            
            {chaosMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => triggerChaos('DB_CHOKE')}
                    style={{ backgroundColor: '#1e1b4b', border: '1px solid #4338ca', color: '#818cf8', padding: '4px', borderRadius: '3px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Choke DB Pool
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerChaos('LAG_SPIKE')}
                    style={{ backgroundColor: '#2d1a0f', border: '1px solid #78350f', color: '#fb923c', padding: '4px', borderRadius: '3px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Inject 2.5s Lag
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => triggerChaos('STATE_CRASH')}
                    style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#f87171', padding: '4px', borderRadius: '3px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Crash State
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerChaos('CLEAR')}
                    style={{ backgroundColor: '#13233c', border: '1px solid #2a3f5f', color: '#8FA0B5', padding: '4px', borderRadius: '3px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Clear Chaos
                  </button>
                </div>
                {chaosError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#ef4444',
                    fontSize: '0.62rem',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {chaosError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Macro Liquidity Shock Pad */}
          <div style={{
            backgroundColor: '#070E1A',
            border: '1px solid #1a2840',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              💥 {getTxt("Macro Liquidity Panic Shocks", "मैक्रो तरलता पैनिक शॉक")}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => triggerMarketShock('BUDGET')}
                style={{
                  backgroundColor: '#450a0a',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  color: '#ef4444',
                  padding: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Union Budget Shock (-10%)
              </button>
              <button
                type="button"
                onClick={() => triggerMarketShock('INTEREST')}
                style={{
                  backgroundColor: '#450a0a',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  color: '#ef4444',
                  padding: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                RBI Rate Hike Shock (-6%)
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CHART & CONSOLE INTERACTIVE WORKSPACE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {selectedAsset && (
            <>
              {/* Backtesting / Live Trading Mode Selector Tabs */}
              <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #1a2840', paddingBottom: '4px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setBacktestActive(false)}
                  style={{
                    backgroundColor: !backtestActive ? '#13233c' : 'transparent',
                    border: 'none',
                    borderRadius: '4px 4px 0 0',
                    color: !backtestActive ? '#D98E04' : '#8FA0B5',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  📈 {getTxt("Live Trading Terminal", "लाइव ट्रेडिंग टर्मिनल")}
                </button>
                <button
                  type="button"
                  onClick={() => setBacktestActive(true)}
                  style={{
                    backgroundColor: backtestActive ? '#13233c' : 'transparent',
                    border: 'none',
                    borderRadius: '4px 4px 0 0',
                    color: backtestActive ? '#D98E04' : '#8FA0B5',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  ⚙️ {getTxt("Strategy Backtester", "रणनीति बैकटेस्टिंग")}
                </button>
              </div>

              {!backtestActive ? (
                <>
                  <div className="ledger-card" style={{ padding: '20px', backgroundColor: '#0A1628', borderColor: '#1a2840' }}>
              
              {/* Asset title banner */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #1a2840', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#E8E4DA', fontWeight: '800', margin: 0 }}>
                      {selectedAsset.name} ({selectedAsset.symbol})
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#8FA0B5', textTransform: 'uppercase' }}>
                      {selectedAsset.asset_type} • {selectedAsset.sector}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#E8E4DA', fontFamily: 'monospace' }}>
                      ₹{selectedAsset.current_price.toFixed(2)}
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      color: selectedAsset?.is_live ? '#22c55e' : '#60a5fa',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: selectedAsset?.is_live ? 'rgba(34, 197, 94, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${selectedAsset?.is_live ? 'rgba(34, 197, 94, 0.3)' : 'rgba(96, 165, 250, 0.3)'}`
                    }}>
                      {selectedAsset?.is_live 
                        ? getTxt("🟢 Live NSE Market (Yahoo Finance)", "🟢 लाइव एनएसई मार्केट (याहू फाइनेंस)")
                        : getTxt("🔵 Simulated Data (Offline Mode)", "🔵 सिम्युलेटेड डेटा (ऑफलाइन मोड)")
                      }
                    </span>
                  </div>
                </div>
                
                {/* DYNAMIC PATTERN BANNER */}
                <div style={{
                  backgroundColor: '#070E1A',
                  border: '1px solid #1a2840',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      🔍 {getTxt("LATEST CANDLE PATTERN:", "नवीनतम कैंडल पैटर्न:")}
                    </span>
                    {(() => {
                      const detected = detectCandlestickPatterns(selectedAsset.history);
                      if (detected.length === 0) {
                        return (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#8FA0B5',
                            backgroundColor: '#13233c',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontWeight: 'bold'
                          }}>
                            ⚪ {getTxt("Normal Trend (No Pattern)", "सामान्य चाल (कोई पैटर्न नहीं)")}
                          </span>
                        );
                      }
                      return detected.map((pat, pidx) => (
                        <span key={pidx} style={{
                          fontSize: '0.7rem',
                          backgroundColor: pat.type === 'BULLISH' ? 'rgba(34,197,94,0.15)' : (pat.type === 'BEARISH' ? 'rgba(239,68,68,0.15)' : '#13233c'),
                          color: pat.type === 'BULLISH' ? '#22c55e' : (pat.type === 'BEARISH' ? '#ef4444' : '#8FA0B5'),
                          border: `1px solid ${pat.type === 'BULLISH' ? '#22c55e' : (pat.type === 'BEARISH' ? '#ef4444' : '#1a2840')}`,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          {pat.icon} {getTxt(pat.nameEn, pat.nameHi)}
                        </span>
                      ));
                    })()}
                  </div>
                  {(() => {
                    const detected = detectCandlestickPatterns(selectedAsset.history);
                    if (detected.length > 0) {
                      return (
                        <div style={{ fontSize: '0.72rem', color: '#E8E4DA', marginTop: '2px', lineHeight: '1.3' }}>
                          {getTxt(detected[0].descEn, detected[0].descHi)}
                        </div>
                      );
                    }
                    return (
                      <div style={{ fontSize: '0.72rem', color: '#8FA0B5', marginTop: '2px' }}>
                        {getTxt("Prices fluctuate organically. Hammer, Doji, or Engulfing shapes will display here when detected.", 
                                 "कीमतें प्राकृतिक रूप से बदल रही हैं। हैमर, दोजी या एंगल्फिंग पैटर्न बनने पर यहाँ जानकारी दिखाई देगी।")}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Chart Mode Switcher Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  📊 {getTxt("Interactive Technical Chart Workspace", "इंटरएक्टिव टेक्निकल चार्ट वर्कस्पेस")}
                </span>
                <div style={{ display: 'flex', gap: '4px', background: '#070E1A', padding: '3px', borderRadius: '6px', border: '1px solid #1a2840' }}>
                  <button
                    type="button"
                    onClick={() => setChartType('TRADINGVIEW')}
                    style={{
                      background: chartType === 'TRADINGVIEW' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)' : 'transparent',
                      border: chartType === 'TRADINGVIEW' ? '1px solid #06b6d4' : '1px solid transparent',
                      borderRadius: '4px',
                      color: chartType === 'TRADINGVIEW' ? '#fff' : '#8FA0B5',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    📈 TradingView Pro Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('SVG_MICRO')}
                    style={{
                      background: chartType === 'SVG_MICRO' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                      border: chartType === 'SVG_MICRO' ? '1px solid #a855f7' : '1px solid transparent',
                      borderRadius: '4px',
                      color: chartType === 'SVG_MICRO' ? '#fff' : '#8FA0B5',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ FVG Micro SVG
                  </button>
                </div>
              </div>

              {/* Chart frame */}
              <div style={{ height: '380px', backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '6px', padding: '6px', position: 'relative', marginBottom: '20px' }}>
                {chartType === 'TRADINGVIEW' ? (
                  <TradingViewWidget symbol={selectedAsset?.symbol} />
                ) : (
                  renderInteractiveChart(selectedAsset.history, selectedAsset.fvg)
                )}
              </div>

              {/* LEVEL 2 DEPTH MONITOR */}
              <div style={{
                backgroundColor: '#070E1A',
                border: '1px solid #1a2840',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#8FA0B5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    📊 {getTxt("Level 2 Order Book & Liquidity Depth", "लेवल 2 ऑर्डर बुक गहराई (L2 depth)")}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#8FA0B5', fontFamily: 'monospace' }}>
                    SPREAD: <strong style={{ color: '#D98E04' }}>₹{selectedAsset ? (selectedAsset.current_price * 0.0016).toFixed(2) : '0.00'}</strong>
                  </span>
                </div>
                
                {whaleAlert && (
                  <div style={{
                    backgroundColor: whaleAlert.type === 'BUY' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${whaleAlert.type === 'BUY' ? '#22c55e' : '#ef4444'}`,
                    borderRadius: '4px',
                    padding: '6px 10px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    animation: whaleFlash ? 'flash-alert 0.5s infinite' : 'none'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: whaleAlert.type === 'BUY' ? '#22c55e' : '#ef4444' }}>
                      🐳 WHALE ALERT: {whaleAlert.type === 'BUY' ? 'BLOCK BUY' : 'BLOCK DUMP'} OF {whaleAlert.qty} SHARES AT ₹{whaleAlert.price}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#8FA0B5' }}>{whaleAlert.timestamp}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Bids side */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2840', paddingBottom: '4px', fontSize: '0.65rem', color: '#8FA0B5', fontWeight: 'bold' }}>
                      <span>{getTxt("Bid Price (₹)", "क्रय मूल्य")}</span>
                      <span>{getTxt("Qty", "मात्रा")}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                      {orderBook.bids.map((b, bidx) => (
                        <div key={bidx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace', color: '#22c55e' }}>
                          <span>₹{b.price.toFixed(2)}</span>
                          <span style={{ color: '#E8E4DA' }}>{b.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Asks side */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2840', paddingBottom: '4px', fontSize: '0.65rem', color: '#8FA0B5', fontWeight: 'bold' }}>
                      <span>{getTxt("Ask Price (₹)", "विक्रय मूल्य")}</span>
                      <span>{getTxt("Qty", "मात्रा")}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                      {orderBook.asks.map((a, aidx) => (
                        <div key={aidx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace', color: '#ef4444' }}>
                          <span>₹{a.price.toFixed(2)}</span>
                          <span style={{ color: '#E8E4DA' }}>{a.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* UNIFIED TRADING CONSOLE */}
              <form onSubmit={handleExecuteOrder} style={{ borderTop: '1px dashed #1a2840', paddingTop: '16px' }}>
                
                {/* 1. Trade direction toggles */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { key: 'BUY_LONG', label: getTxt('BUY LONG', 'बाय लॉन्ग (BUY)'), color: '#22c55e', bg: 'rgba(34,197,94,0.06)' },
                    { key: 'SELL_LONG', label: getTxt('SELL LONG', 'सेल लॉन्ग (SELL)'), color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
                    { key: 'SHORT_SELL', label: getTxt('SHORT SELL', 'शॉर्ट सेल (SHORT)'), color: '#ef4444', bg: 'rgba(239,68,68,0.06)', disabled: selectedAsset.asset_type === 'MUTUAL_FUND' },
                    { key: 'COVER_SHORT', label: getTxt('COVER SHORT', 'कवर शॉर्ट (COVER)'), color: '#22c55e', bg: 'rgba(34,197,94,0.06)', disabled: selectedAsset.asset_type === 'MUTUAL_FUND' }
                  ].map(t => {
                    const isSel = tradeType === t.key;
                    if (t.disabled) return null;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTradeType(t.key)}
                        style={{
                          flex: 1,
                          backgroundColor: isSel ? t.bg : 'transparent',
                          border: `1.5px solid ${isSel ? t.color : '#2a3f5f'}`,
                          color: isSel ? t.color : '#8FA0B5',
                          padding: '6px 4px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* 2. Order Mode selectors */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { key: 'DELIVERY', label: getTxt('Invest (Delivery)', 'दीर्घकालिक निवेश (Delivery)') },
                    { key: 'INTRADAY', label: getTxt('Trade (Intraday)', 'इंट्राडे ट्रेडिंग (Intraday)'), disabled: selectedAsset.asset_type === 'MUTUAL_FUND' },
                    { key: 'SIP', label: getTxt('Systematic (SIP)', 'आवर्ती निवेश (SIP)') }
                  ].map(m => {
                    const isSel = orderMode === m.key;
                    if (m.disabled) return null;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setOrderMode(m.key)}
                        style={{
                          flex: 1,
                          backgroundColor: isSel ? 'rgba(217,142,4,0.08)' : 'transparent',
                          border: `1.5px solid ${isSel ? 'var(--color-amber)' : '#2a3f5f'}`,
                          color: isSel ? 'var(--color-amber)' : '#8FA0B5',
                          padding: '6px 0',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                {/* 3. Inputs fields depending on asset type & order mode */}
                {orderMode === 'SIP' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {selectedAsset.asset_type === 'MUTUAL_FUND' ? (
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '4px' }}>
                          {getTxt("MONTHLY SIP AMOUNT (₹)", "मासिक एसआईपी राशि (₹)")}
                        </label>
                        <input
                          type="number"
                          value={inputAmt}
                          onChange={e => setInputAmt(e.target.value)}
                          min="500"
                          style={{
                            width: '100%', backgroundColor: '#070E1A', border: '1px solid #2a3f5f',
                            borderRadius: '4px', color: '#E8E4DA', padding: '8px', fontSize: '0.9rem',
                            fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '4px' }}>
                          {getTxt("RECURRING QUANTITY (SHARES)", "आवर्ती शेयर संख्या")}
                        </label>
                        <input
                          type="number"
                          value={inputQty}
                          onChange={e => setInputQty(e.target.value)}
                          min="1"
                          style={{
                            width: '100%', backgroundColor: '#070E1A', border: '1px solid #2a3f5f',
                            borderRadius: '4px', color: '#E8E4DA', padding: '8px', fontSize: '0.9rem',
                            fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '4px' }}>
                        {getTxt("CYCLE PERIOD (DAYS)", "आवर्ती चक्र अंतराल (दिन)")}
                      </label>
                      <select
                        value={sipInterval}
                        onChange={e => setSipInterval(e.target.value)}
                        style={{
                          width: '100%', backgroundColor: '#070E1A', border: '1px solid #2a3f5f',
                          borderRadius: '4px', color: '#E8E4DA', padding: '8px', fontSize: '0.9rem',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      >
                        <option value="7">7 Days (Weekly)</option>
                        <option value="15">15 Days (Bi-weekly)</option>
                        <option value="30">30 Days (Monthly)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '16px' }}>
                    {selectedAsset.asset_type === 'MUTUAL_FUND' ? (
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '4px' }}>
                          {getTxt("INVESTMENT VALUE (₹)", "निवेश की कुल राशि (₹)")}
                        </label>
                        <input
                          type="number"
                          value={inputAmt}
                          onChange={e => setInputAmt(e.target.value)}
                          min="100"
                          style={{
                            width: '100%', backgroundColor: '#070E1A', border: '1px solid #2a3f5f',
                            borderRadius: '4px', color: '#E8E4DA', padding: '10px', fontSize: '0.95rem',
                            fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '4px' }}>
                          {getTxt("SHARES QUANTITY", "शेयरों की संख्या")}
                        </label>
                        <input
                          type="number"
                          value={inputQty}
                          onChange={e => setInputQty(e.target.value)}
                          min="1"
                          style={{
                            width: '100%', backgroundColor: '#070E1A', border: '1px solid #2a3f5f',
                            borderRadius: '4px', color: '#E8E4DA', padding: '10px', fontSize: '0.95rem',
                            fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Indian market friction breakdown */}
                {(() => {
                  const isMF = selectedAsset.asset_type === 'MUTUAL_FUND';
                  const orderValue = isMF ? parseFloat(inputAmt || '0') : (parseFloat(inputQty || '0') * selectedAsset.current_price);
                  
                  if (isNaN(orderValue) || orderValue <= 0) return null;

                  const brokerage = orderValue * 0.0003; 
                  const stt = orderValue * 0.001; 
                  const gst = brokerage * 0.18; 
                  const sebiTurnover = orderValue * 0.0000032; 
                  const totalFriction = brokerage + stt + gst + sebiTurnover;

                  return (
                    <div style={{
                      backgroundColor: '#070E1A',
                      border: '1px solid #1a2840',
                      borderRadius: '6px',
                      padding: '10px',
                      marginBottom: '14px',
                      fontSize: '0.72rem',
                      color: '#8FA0B5'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold', color: '#E8E4DA' }}>
                        <span>🛠️ {getTxt("Frictional Leak Charges", "सट्टा लेनदेन शुल्क (Frictional fees)")}</span>
                        <span>₹{totalFriction.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.65rem' }}>
                        <div>Brokerage (0.03%): ₹{brokerage.toFixed(2)}</div>
                        <div>STT/CTT (0.1%): ₹{stt.toFixed(2)}</div>
                        <div>GST (18%): ₹{gst.toFixed(2)}</div>
                        <div>SEBI (0.00032%): ₹{sebiTurnover.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Submit action */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: tradeType.includes('BUY') || tradeType.includes('COVER') ? '#22c55e' : '#ef4444',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? getTxt("Processing...", "प्रोसेसिंग...") : getTxt("Execute Transaction ➔", "ट्रांजैक्शन की पुष्टि करें ➔")}
                </button>
              </form>
            </div>

            {/* CANDLESTICK PATTERN LITERACY PANEL */}
            <div className="ledger-card" style={{
              padding: '20px',
              backgroundColor: '#0A1628',
              borderColor: '#1a2840',
              marginTop: '0px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', color: '#D98E04', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📚 {getTxt("Candlestick & FVG Literacy Panel", "कैंडलस्टिक और FVG साक्षरता पैनल")}
                </h4>
                <p style={{ fontSize: '0.72rem', color: '#8FA0B5', margin: '4px 0 0 0' }}>
                  {getTxt("Learn standard pattern formations and trade imbalances dynamically in real time.", "वास्तविक समय में कैंडलस्टिक फॉर्मेशन और असंतुलन (FVG) को समझें।")}
                </p>
              </div>

              {/* Detected pattern results */}
              <div style={{
                backgroundColor: '#070E1A',
                border: '1px solid #1a2840',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <span style={{ fontSize: '0.68rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  🔍 {getTxt("LATEST CANDLESTICK PATTERN ANALYSIS", "नवीनतम कैंडलस्टिक पैटर्न विश्लेषण")}
                </span>
                
                {(() => {
                  const detected = detectCandlestickPatterns(selectedAsset.history);
                  if (detected.length === 0) {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8FA0B5', fontSize: '0.78rem' }}>
                        <span>⚪</span>
                        <span>
                          {getTxt("Normal Trend: No distinct candlestick pattern identified on the latest candle. Look for FVG zones or support/resistance key levels.", 
                                 "सामान्य चाल: वर्तमान कैंडल पर कोई विशिष्ट पैटर्न नहीं मिला है। FVG जोन या सपोर्ट/रेजिस्टेंस लेवल देखें।")}
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {detected.map((pat, pidx) => {
                        const isBull = pat.type === 'BULLISH';
                        const isBear = pat.type === 'BEARISH';
                        const badgeBg = isBull ? 'rgba(34,197,94,0.12)' : (isBear ? 'rgba(239,68,68,0.12)' : 'rgba(143,160,181,0.12)');
                        const badgeCol = isBull ? '#22c55e' : (isBear ? '#ef4444' : '#8FA0B5');
                        
                        return (
                          <div key={pidx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '1rem' }}>{pat.icon}</span>
                              <span style={{
                                backgroundColor: badgeBg,
                                color: badgeCol,
                                border: `1px solid ${badgeCol}`,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: '900'
                              }}>
                                {getTxt(pat.nameEn, pat.nameHi)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#E8E4DA', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                              {getTxt(pat.descEn, pat.descHi)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Candlestick cheat sheet guide */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.72rem', color: '#8FA0B5' }}>
                <div style={{ borderRight: '1px solid #1a2840', paddingRight: '8px' }}>
                  <strong style={{ color: '#E8E4DA', display: 'block', marginBottom: '4px' }}>
                    🟢 {getTxt("Bullish Candles", "बुलिश कैंडल (तेजी)")}
                  </strong>
                  {getTxt("Close is HIGHER than open. Shows buying pressure. Lower shadows show price rejection from lows (Bullish support).", 
                           "क्लोज (बंद मूल्य) ओपन से ऊपर होता है। निचली शैडो दर्शाती है कि खरीदारों ने कीमत नीचे टिकने नहीं दी।")}
                </div>
                <div>
                  <strong style={{ color: '#E8E4DA', display: 'block', marginBottom: '4px' }}>
                    🔴 {getTxt("Bearish Candles", "बेरिश कैंडल (मंदी)")}
                  </strong>
                  {getTxt("Close is LOWER than open. Shows selling pressure. Upper shadows show price rejection from highs (Bearish resistance).", 
                           "क्लोज ओपन से नीचे होता है। ऊपरी शैडो दर्शाती है कि बिकवालों ने ऊंची कीमतों को वापस धकेल दिया है।")}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #1a2840', paddingTop: '10px', fontSize: '0.7rem', color: '#8FA0B5' }}>
                <strong style={{ color: '#D98E04', display: 'block', marginBottom: '2px' }}>
                  💡 {getTxt("What is Fair Value Gap (FVG)?", "फेयर वैल्यू गैप (FVG) क्या है?")}
                </strong>
                {getTxt("FVGs represent market inefficiencies where price moves rapidly in one direction due to high institutional buying/selling. The market often returns to fill these gaps later.", 
                         "यह बाजार में आए तीव्र बहाव के कारण छूटा हुआ खाली हिस्सा होता है। भविष्य में मार्केट अक्सर इस खाली हिस्से को भरने वापस आता है।")}
                </div>
              </div>
              </>
            ) : (
              <div className="ledger-card" style={{ padding: '20px', backgroundColor: '#0A1628', borderColor: '#1a2840' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#D98E04', fontWeight: '800', marginBottom: '8px' }}>
                  ⚙️ {getTxt("Strategy Backtesting Sandbox", "रणनीति बैकटेस्टिंग सैंडबॉक्स")}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#8FA0B5', marginBottom: '20px' }}>
                  {getTxt(
                    `Simulate a trading strategy against historical price candles of ${selectedAsset.name}.`,
                    `${selectedAsset.name} के ऐतिहासिक कैंडल डेटा पर रणनीति का बैकटेस्ट सिमुलेशन चलाएं।`
                  )}
                </p>
                
                {/* Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#8FA0B5', marginBottom: '6px', fontWeight: 'bold' }}>
                      {getTxt("Select Strategy", "रणनीति चुनें")}
                    </label>
                    <select
                      value={backtestStrategy}
                      onChange={(e) => {
                        setBacktestStrategy(e.target.value);
                        setBacktestResults(null);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#070E1A',
                        border: '1px solid #1a2840',
                        borderRadius: '6px',
                        color: '#E8E4DA',
                        padding: '10px',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value="BUY_HOLD">{getTxt("Buy & Hold (लॉन्ग-टर्म होल्ड)", "Buy & Hold (लॉन्ग-टर्म होल्ड)")}</option>
                      <option value="SMA_CROSSOVER">{getTxt("5/15 SMA Crossover (मूविंग एवरेज क्रॉस)", "5/15 SMA Crossover (मूविंग एवरेज क्रॉस)")}</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleRunBacktest}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🚀 {getTxt("Run Simulation", "सिमुलेशन चलाएं")}
                    </button>
                  </div>
                </div>

                {/* Results Display */}
                {backtestResults ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Metrics cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      <div style={{ backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '6px', padding: '12px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase' }}>{getTxt("Initial Capital", "प्रारंभिक पूंजी")}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginTop: '4px', fontFamily: 'monospace' }}>
                          ₹{backtestResults.initialVal.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '6px', padding: '12px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase' }}>{getTxt("Final Worth", "अंतिम पूंजी")}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginTop: '4px', fontFamily: 'monospace' }}>
                          ₹{backtestResults.finalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '6px', padding: '12px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase' }}>{getTxt("Total Returns", "कुल रिटर्न")}</span>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold', 
                          color: backtestResults.returnPct >= 0 ? '#22c55e' : '#ef4444', 
                          marginTop: '4px', 
                          fontFamily: 'monospace' 
                        }}>
                          {backtestResults.returnPct >= 0 ? '+' : ''}{backtestResults.returnPct.toFixed(2)}%
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '6px', padding: '12px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase' }}>{getTxt("Total Trades", "कुल ट्रेड")}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fb923c', marginTop: '4px', fontFamily: 'monospace' }}>
                          {backtestResults.trades.length}
                        </div>
                      </div>
                    </div>

                    {/* Visual Equity Curve Chart */}
                    <div style={{ backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '8px', padding: '16px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#8FA0B5', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                        📊 {getTxt("Equity Curve Over Time", "समय के साथ पूंजी वृद्धि वक्र")}
                      </span>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        height: '120px',
                        borderLeft: '1px solid #2a3f5f',
                        borderBottom: '1px solid #2a3f5f',
                        paddingLeft: '6px',
                        paddingBottom: '4px',
                        position: 'relative'
                      }}>
                        {(() => {
                          const minVal = Math.min(...backtestResults.equityCurve);
                          const maxVal = Math.max(...backtestResults.equityCurve);
                          const rangeVal = maxVal - minVal || 1;
                          
                          const stepSize = Math.max(1, Math.floor(backtestResults.equityCurve.length / 15));
                          const points = [];
                          for (let i = 0; i < backtestResults.equityCurve.length; i += stepSize) {
                            points.push(backtestResults.equityCurve[i]);
                          }
                          if (points[points.length - 1] !== backtestResults.equityCurve[backtestResults.equityCurve.length - 1]) {
                            points.push(backtestResults.equityCurve[backtestResults.equityCurve.length - 1]);
                          }

                          return points.map((val, idx) => {
                            const hPct = Math.max(10, Math.min(100, Math.round(((val - minVal) / rangeVal) * 100)));
                            return (
                              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <div 
                                  style={{
                                    width: '70%', 
                                    height: `${hPct}%`, 
                                    background: val >= 100000 
                                      ? 'linear-gradient(to top, rgba(34,197,94,0.1), #22c55e)' 
                                      : 'linear-gradient(to top, rgba(239,68,68,0.1), #ef4444)',
                                    borderRadius: '2px 2px 0 0',
                                    transition: 'all 0.3s ease'
                                  }}
                                  title={`Value: ₹${val.toFixed(0)}`}
                                />
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Transaction Logs Table */}
                    <div style={{ backgroundColor: '#070E1A', border: '1px solid #1a2840', borderRadius: '8px', padding: '16px', maxHeight: '160px', overflowY: 'auto' }}>
                      <span style={{ fontSize: '0.78rem', color: '#8FA0B5', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        📜 {getTxt("Simulation Trade Ledger", "सिमुलेशन ट्रेड लेजर प्रविष्टियां")}
                      </span>
                      <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: '#8FA0B5', borderBottom: '1px solid #1a2840' }}>
                            <th style={{ textAlign: 'left', padding: '6px' }}>{getTxt("Type", "प्रकार")}</th>
                            <th style={{ textAlign: 'right', padding: '6px' }}>{getTxt("Price", "मूल्य")}</th>
                            <th style={{ textAlign: 'right', padding: '6px' }}>{getTxt("Time", "समय")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backtestResults.trades.map((t, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ 
                                padding: '6px', 
                                fontWeight: 'bold',
                                color: t.type.includes('BUY') ? '#22c55e' : '#ef4444' 
                              }}>
                                {t.type}
                              </td>
                              <td style={{ textAlign: 'right', padding: '6px', fontFamily: 'monospace' }}>
                                ₹{t.price.toFixed(2)}
                              </td>
                              <td style={{ textAlign: 'right', padding: '6px', color: '#8FA0B5' }}>
                                {t.date}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', border: '1.5px dashed #1a2840', borderRadius: '8px', color: '#8FA0B5' }}>
                    ⚡ {getTxt("Click 'Run Simulation' to execute backtesting.", "बैकटेस्ट चलाने के लिए 'सिमुलेशन चलाएं' पर क्लिक करें।")}
                  </div>
                )}
              </div>
            )}
            </>
          )}

        </div>
      </div>

      {/* 3. LOWER TABBED PERFORMANCE LEDGER PANEL */}
      <div className="ledger-card" style={{
        backgroundColor: '#0A1628',
        borderColor: '#1a2840',
        marginTop: '12px'
      }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a2840', backgroundColor: '#070E1A', paddingRight: '12px' }}>
          <div style={{ display: 'flex' }}>
            {[
              { key: 'positions', label: getTxt('Live Positions Inventory', 'सक्रिय असेट होल्डिंग्स'), count: portfolio.holdings.length },
              { key: 'mandates', label: getTxt('Systematic Mandates (SIP)', 'सक्रिय आवर्ती निर्देश (SIP)'), count: portfolio.mandates.length },
              { key: 'ledger', label: getTxt('Transaction Ledger logs', 'लेनदेन ऑडिट लेजर'), count: portfolio.transactions.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2.5px solid #D98E04' : '2.5px solid transparent',
                  color: activeTab === tab.key ? '#D98E04' : '#8FA0B5',
                  padding: '12px 20px',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.key ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ marginLeft: '6px', backgroundColor: '#D98E04', color: '#000', borderRadius: '10px', padding: '1px 5px', fontSize: '0.68rem', fontWeight: '900' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExportLedger}
            style={{
              backgroundColor: '#13233c',
              border: '1px solid #4a9eff',
              borderRadius: '4px',
              color: '#4a9eff',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 {getTxt("Export Encrypted Passbook", "पासबुक डाउनलोड करें (Export)")}
          </button>
        </div>

        {/* Tab content table */}
        <div style={{ overflowX: 'auto' }}>
          
          {activeTab === 'positions' && (
            <table className="ledger-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>{getTxt("Asset Scheme", "निवेश साधन / असेट")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px' }}>{getTxt("Position Type", "स्थिति प्रकार")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Qty / Units", "मात्रा / इकाई")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Avg Price", "औसत खरीद मूल्य")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Current Price", "वर्तमान मूल्य")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Invested Amount", "निवेशित राशि")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Current Value", "वर्तमान मूल्य")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Live Return P&L", "फ्लोटिंग रिटर्न")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Trailing SL", "ट्रेलिंग SL")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Asset XIRR", "असेट XIRR")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', width: '110px' }}>{getTxt("Action", "कार्रवाई")}</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ padding: '32px', textAlign: 'center', color: '#8FA0B5' }}>
                      {getTxt("No active trading positions. Open watchlists and execute orders above.", "पोर्टफोलियो में कोई सक्रिय स्थिति नहीं है।")}
                    </td>
                  </tr>
                ) : portfolio.holdings.map(h => {
                  const isLong = h.total_quantity >= 0;
                  const absQty = Math.abs(h.total_quantity);
                  const trendColor = h.absolute_return >= 0 ? '#22c55e' : '#ef4444';
                  
                  return (
                    <tr key={h.asset_id}>
                      <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>
                        <div>{h.symbol}</div>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{h.name}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: isLong ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: isLong ? '#22c55e' : '#ef4444',
                          border: `1px solid ${isLong ? '#22c55e' : '#ef4444'}`,
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '0.65rem',
                          fontWeight: '800'
                        }}>
                          {isLong ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace' }}>{absQty.toFixed(4)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', color: '#8FA0B5' }}>₹{h.average_buy_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace' }}>₹{h.current_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', color: '#8FA0B5' }}>₹{h.invested_amount.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', fontWeight: 'bold' }}>₹{h.current_value.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', color: trendColor, fontWeight: '700' }}>
                        {h.absolute_return >= 0 ? '+' : ''}₹{h.absolute_return.toLocaleString('en-IN')} ({h.absolute_return_pct >= 0 ? '+' : ''}{h.absolute_return_pct}%)
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', color: '#fb923c', fontWeight: '700' }}>
                        {trailingSL[h.asset_id] ? `₹${trailingSL[h.asset_id].toFixed(2)}` : '--'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', color: h.xirr >= 0 ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                        {h.xirr >= 0 ? '+' : ''}{h.xirr}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <button
                          onClick={() => {
                            const matchingAsset = assets.find(a => a.id === h.asset_id);
                            if (matchingAsset) {
                              setSelectedAsset(matchingAsset);
                              setOrderMode('DELIVERY');
                              setTradeType(isLong ? 'SELL_LONG' : 'COVER_SHORT');
                              if (matchingAsset.asset_type === 'MUTUAL_FUND') {
                                setInputAmt(String(h.current_value));
                              } else {
                                setInputQty(String(absQty));
                              }
                              showToast('success', getTxt('Position parameters loaded to console.', 'पोजीशन विवरण कंसोल में लोड किया गया।'));
                            }
                          }}
                          style={{
                            backgroundColor: '#1c0c28',
                            border: '1px solid #c055ef',
                            borderRadius: '4px',
                            color: '#c055ef',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {isLong ? getTxt("LIQUIDATE", "बाहर निकलें") : getTxt("COVER", "कवर करें")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'mandates' && (
            <table className="ledger-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>{getTxt("Asset Symbol", "साधन प्रतीक")}</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>{getTxt("Mandate Type", "निर्देश प्रकार")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Recurring Target", "आवर्ती मात्रा / मूल्य")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px' }}>{getTxt("Interval Days", "आवर्ती अंतराल")}</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>{getTxt("Last Execution Date", "अंतिम डेबिट चक्र")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px' }}>{getTxt("Status", "स्थिति")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', width: '160px' }}>{getTxt("Interactive Trigger", "डेमो चक्र रन")}</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.mandates.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#8FA0B5' }}>
                      {getTxt("No active recurring systematic mandates scheduled.", "कोई व्यवस्थित निर्देश पंजीकृत नहीं है।")}
                    </td>
                  </tr>
                ) : portfolio.mandates.map(m => {
                  const isQtyBased = m.mandate_type === 'STOCK_SIP';
                  return (
                    <tr key={m.id}>
                      <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>
                        <div>{m.asset_symbol}</div>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{m.asset_name}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: '#0f2238',
                          color: '#4a9eff',
                          border: '1px solid #4a9eff',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '0.68rem',
                          fontWeight: '800'
                        }}>
                          {m.mandate_type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {isQtyBased ? `${m.recurring_amount_or_qty} shares` : `₹${m.recurring_amount_or_qty.toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px', fontFamily: 'monospace' }}>{m.interval_days} days</td>
                      <td style={{ padding: '10px 14px', color: '#8FA0B5' }}>
                        {m.last_executed_date ? new Date(m.last_executed_date).toLocaleString('en-IN') : getTxt('Pending Execution', 'डेबिट होना शेष')}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: m.status === 'ACTIVE' ? '#1a3a1a' : '#2a1a0a',
                          color: m.status === 'ACTIVE' ? '#22c55e' : '#D98E04',
                          border: `1px solid ${m.status === 'ACTIVE' ? '#22c55e' : '#D98E04'}`,
                          borderRadius: '4px',
                          padding: '1px 8px',
                          fontSize: '0.65rem',
                          fontWeight: '800'
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <button
                          onClick={() => handleTriggerMandate(m.id)}
                          style={{
                            backgroundColor: '#0f243c',
                            border: '1px solid #4a9eff',
                            borderRadius: '4px',
                            color: '#4a9eff',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ {getTxt("Simulate Cycle", "डेबिट चक्र चलाएं")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'ledger' && (
            <table className="ledger-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>{getTxt("Date & Time", "समय और तिथि")}</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>{getTxt("Asset Instrument", "साधन प्रतीक")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px' }}>{getTxt("Execution Mode", "ऑर्डर मोड")}</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px' }}>{getTxt("Direction", "ऑर्डर दिशा")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Fill Price", "निष्पादन मूल्य")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Quantity", "मात्रा")}</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>{getTxt("Cash Flow", "पूंजी प्रवाह")}</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#8FA0B5' }}>
                      {getTxt("No transactions executed in ledger registry.", "लेजर रजिस्टर में कोई लेनदेन प्रविष्टि उपलब्ध नहीं है।")}
                    </td>
                  </tr>
                ) : portfolio.transactions.map((tx, idx) => {
                  const isBuy = tx.trade_type === 'BUY_LONG' || tx.trade_type === 'COVER_SHORT';
                  const isLong = tx.trade_type === 'BUY_LONG' || tx.trade_type === 'SELL_LONG';
                  const trendColor = isBuy ? '#ef4444' : '#22c55e';
                  
                  return (
                    <tr key={tx.id || idx}>
                      <td style={{ padding: '10px 14px', color: '#8FA0B5' }}>{tx.timestamp}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>
                        <div>{tx.asset_symbol}</div>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{tx.asset_name}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: '#0A1628',
                          color: '#8FA0B5',
                          border: '1px solid #1a2840',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '0.68rem',
                          fontWeight: '800'
                        }}>
                          {tx.order_mode}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: isBuy ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                          color: isBuy ? '#ef4444' : '#22c55e',
                          border: `1.5px solid ${isBuy ? '#ef4444' : '#22c55e'}`,
                          borderRadius: '4px',
                          padding: '1px 8px',
                          fontSize: '0.65rem',
                          fontWeight: '800'
                        }}>
                          {tx.trade_type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace' }}>₹{tx.execution_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace' }}>{tx.quantity.toFixed(4)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontFamily: 'monospace', fontWeight: 'bold', color: trendColor }}>
                        {isBuy ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* FLOAT TOAST FEEDBACK NOTIFICATIONS */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#14532d' : '#450a0a',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px', padding: '12px 24px',
          color: toast.type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: '700', fontSize: '0.88rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fade-in 0.25s ease',
          maxWidth: '90vw'
        }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.text}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

    </div>
  );
}
