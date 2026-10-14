/** T​e​m​p​o​r​a​r​y​ ​f​i​x​ ​f​o​r​ ​t​h​e​ ​r​e​n​d​e​r​i​n​g​ ​i​s​s​u​e​ ​o​n​ ​m​o​b​i​l​e​ ​d​e​v​i​c​e​s​. */

import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    analyze: 'Analyze News',
    history: 'My History',
    news: 'News Feed',
    reports: 'My Reports',
    feedback: 'Feedback',
    logout: 'Logout',
    // Analyze Page
    analyze_title: 'Analyze News',
    analyze_subtitle: 'Paste any news headline or article text to detect fake news',
    enter_text: 'Enter News Text',
    placeholder: 'Paste a news headline, article excerpt, or social media post here...',
    clear: 'Clear',
    analyze_now: 'Analyze Now',
    analyzing: 'Analyzing...',
    try_examples: 'Try These Examples',
    verdict: 'VERDICT',
    credibility: 'CREDIBILITY SCORE',
    real: 'Real',
    fake: 'Fake',
    red_flags: 'Red Flags',
    words: 'Words',
    report_content: 'Report This Content',
    analyze_another: 'Analyze Another',
    report_submitted: 'Report submitted',
    confidence: 'Confidence',
  },
  hi: { // Hindi
    // Nav
    dashboard: 'डैशबोर्ड',
    analyze: 'समाचार विश्लेषण',
    history: 'मेरा इतिहास',
    news: 'समाचार फ़ीड',
    reports: 'मेरी रिपोर्ट',
    feedback: 'प्रतिक्रिया',
    logout: 'लॉगआउट',
    // Analyze Page
    analyze_title: 'समाचार विश्लेषण',
    analyze_subtitle: 'फर्जी खबरों का पता लगाने के लिए कोई भी समाचार हेडलाइन या लेख पेस्ट करें',
    enter_text: 'समाचार टेक्स्ट दर्ज करें',
    placeholder: 'यहां समाचार हेडलाइन, लेख का अंश या सोशल मीडिया पोस्ट पेस्ट करें...',
    clear: 'साफ़ करें',
    analyze_now: 'अभी विश्लेषण करें',
    analyzing: 'विश्लेषण हो रहा है...',
    try_examples: 'इन उदाहरणों को आजमाएं',
    verdict: 'निर्णय',
    credibility: 'विश्वसनीयता स्कोर',
    real: 'असली',
    fake: 'फर्जी',
    red_flags: 'चेतावनी संकेत',
    words: 'शब्द',
    report_content: 'इस सामग्री की रिपोर्ट करें',
    analyze_another: 'दूसरा विश्लेषण करें',
    report_submitted: 'रिपोर्ट सबमिट की गई',
    confidence: 'आत्मविश्वास',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
