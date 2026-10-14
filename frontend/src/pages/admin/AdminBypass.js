/** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminBypass() {
  const [inputText, setInputText] = useState('');
  const [outputLines, setOutputLines] = useState([]);
  const [options, setOptions] = useState({
    zeroWidth: true,
    homoglyphs: false,
    extraSpaces: false,
    caseJitter: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [originalResult, setOriginalResult] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);

  // Mapping for homoglyphs (visual similarity but different Unicode)
  const homoglyphs = {
    'a': 'а', // Cyrillic
    'e': 'е', // Cyrillic
    'i': 'і', // Ukrainian
    'o': 'о', // Cyrillic
    'p': 'р', // Cyrillic
    'y': 'у', // Cyrillic
    'c': 'с', // Cyrillic
    'x': 'х', // Cyrillic
  };

  const applyBypass = (text) => {
  /** D​r​a​f​t​e​d​ ​t​h​i​s​ ​p​a​r​t​ ​w​h​i​l​e​ ​t​e​s​t​i​n​g​ ​t​h​e​ ​n​e​w​ ​A​P​I​ ​i​n​t​e​g​r​a​t​i​o​n​. */
    let result = text;

    if (options.zeroWidth) {
      // Inject zero-width space every few characters to break simple keyword matching
      result = result.split('').map((char, i) =>
        (i % 3 === 0 && char !== ' ') ? char + '\u200B' : char
      ).join('');
    }

    if (options.homoglyphs) {
      // Randomly replace characters with homoglyphs
      result = result.split('').map(char => {
        const lowerChar = char.toLowerCase();
        if (homoglyphs[lowerChar] && Math.random() > 0.7) {
          return char === lowerChar ? homoglyphs[lowerChar] : homoglyphs[lowerChar].toUpperCase();
        }
        return char;
      }).join('');
    }

    if (options.caseJitter) {
      result = result.split('').map(char => {
        if (/[a-zA-Z]/.test(char) && Math.random() > 0.9) {
          return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
        }
        return char;
      }).join('');
    }

    if (options.extraSpaces) {
      result = result.replace(/\s+/g, ' \u200B ');
    }

    return result;
  };

  const handleProcess = () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    const bypassed = applyBypass(inputText);
    setOutputLines([bypassed]);
    setTestResult(null);
    setOriginalResult(null);
    setIsProcessing(false);
  };

  const testComparison = async () => {
    if (!inputText || outputLines.length === 0) return;
    setLoadingTest(true);
    try {
      const [orig, bypass] = await Promise.all([
        axios.post('/api/analyze', { text: inputText }),
        axios.post('/api/analyze', { text: outputLines[0] })
      ]);
      setOriginalResult(orig.data);
      setTestResult(bypass.data);
    } catch (err) {
      console.error("Test failed", err);
    } finally {
      setLoadingTest(false);
    }
  };

  const copyToClipboard = () => {
    if (outputLines.length > 0) {
      navigator.clipboard.writeText(outputLines[0]);
      alert("Bypassed text copied to clipboard!");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🧬 AI Content Injector (Bypass Lab)</div>
        <div className="page-subtitle">Obfuscate text to evade linguistic detection and keyword analysis.</div>
      </div>

      <div className="page-content">
        <div className="grid-2">
          {/* Input Section */}
          <div className="card">
            <div className="card-title">📥 Source Content</div>
            <textarea
              className="analyze-textarea"
              placeholder="Paste AI-generated or suspicious content here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ minHeight: '200px' }}
            />

            <div className="mt-16">
              <div className="card-title" style={{ marginBottom: '10px', fontSize: '0.65rem' }}>Injection Techniques</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label className="flex gap-8 text-sm" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={options.zeroWidth} onChange={() => setOptions({...options, zeroWidth: !options.zeroWidth})} />
                  Zero-Width Injection
                </label>
                <label className="flex gap-8 text-sm" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={options.homoglyphs} onChange={() => setOptions({...options, homoglyphs: !options.homoglyphs})} />
                  Homoglyph Swap
                </label>
                <label className="flex gap-8 text-sm" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={options.caseJitter} onChange={() => setOptions({...options, caseJitter: !options.caseJitter})} />
                  Case Jitter
                </label>
                <label className="flex gap-8 text-sm" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={options.extraSpaces} onChange={() => setOptions({...options, extraSpaces: !options.extraSpaces})} />
                  Space Obfuscation
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary mt-16"
              style={{ width: '100%' }}
              onClick={handleProcess}
              disabled={!inputText.trim() || isProcessing}
            >
              ⚡ Apply Obfuscation
            </button>
          </div>

          {/* Output Section */}
          <div className="card">
            <div className="card-title">📤 Injected Output</div>
            <div
              className="analyze-textarea"
              style={{
                minHeight: '200px',
                background: 'var(--bg3)',
                fontFamily: 'JetBrains Mono',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                overflowY: 'auto'
              }}
            >
              {outputLines[0] || <span style={{ color: 'var(--text3)' }}>Processed text will appear here...</span>}
            </div>

            <div className="flex gap-8 mt-16">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={copyToClipboard} disabled={!outputLines[0]}>
                📋 Copy Text
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={testComparison} disabled={!outputLines[0] || loadingTest}>
                {loadingTest ? '🧪 Testing...' : '🔬 Run A/B Test'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Comparison */}
        {originalResult && testResult && (
          <div className="card mt-24">
            <div className="card-title">📊 Detection Evasion Report</div>
            <div className="grid-2">
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div className="text-xs text-muted mb-8">ORIGINAL DETECTION</div>
                <div className={`badge badge-${originalResult.verdictClass} mb-8`}>{originalResult.verdict}</div>
                <div className="flex-between">
                  <span className="text-sm">Fake Probability:</span>
                  <span className="text-danger font-bold">{originalResult.fake_probability}%</span>
                </div>
                <div className="flex-between">
                  <span className="text-sm">Credibility:</span>
                  <span className="text-accent">{originalResult.credibility_score}/100</span>
                </div>
              </div>

              <div style={{ padding: '15px', background: 'rgba(0,245,160,0.05)', borderRadius: '8px', border: '1px solid rgba(0,245,160,0.2)' }}>
                <div className="text-xs text-muted mb-8">BYPASSED DETECTION</div>
                <div className={`badge badge-${testResult.verdictClass} mb-8`}>{testResult.verdict}</div>
                <div className="flex-between">
                  <span className="text-sm">Fake Probability:</span>
                  <span className={testResult.fake_probability < 30 ? 'text-success' : 'text-danger'}>{testResult.fake_probability}%</span>
                </div>
                <div className="flex-between">
                  <span className="text-sm">Credibility:</span>
                  <span className="text-accent">{testResult.credibility_score}/100</span>
                </div>
                <div className="mt-8 text-xs" style={{ color: 'var(--success)' }}>
                  🎉 Improvement: {Math.round(originalResult.fake_probability - testResult.fake_probability)}% reduction in fake probability
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
