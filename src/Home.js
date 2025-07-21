import React, { useState, useRef, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site';
const API_PREFIX = process.env.REACT_APP_API_PREFIX || '/api/v1';

function getUserId() {
  const userId = localStorage.getItem('userId');
  if (!userId) return 13; // 文档默认userId为13
  return userId;
}

async function interpretText(query) {
  const token = localStorage.getItem('accessToken');
  const userId = getUserId();
  const res = await fetch(`${API_BASE}${API_PREFIX}/interpret`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId: null, userId, query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || '意图解析失败');
  }
  return res.json();
}

async function executeTask(toolId, params) {
  const token = localStorage.getItem('accessToken');
  const userId = getUserId();
  const res = await fetch(`${API_BASE}${API_PREFIX}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId: null, userId, toolId, params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || '执行失败');
  }
  return res.json();
}

function ttsSpeak(text) {
  if (!window.speechSynthesis) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  window.speechSynthesis.speak(utter);
}

function Home() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState('');
  const [intentResult, setIntentResult] = useState(null);
  const [aiStep, setAiStep] = useState('idle');
  const [execResult, setExecResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const resultsRef = useRef([]);

  // 录音流程
  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('当前浏览器不支持语音识别');
      return;
    }
    setIntentResult(null);
    setExecResult(null);
    setError('');
    setAiStep('idle');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.continuous = true;
    resultsRef.current = [];
    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          resultsRef.current.push(event.results[i][0].transcript);
        }
      }
      setResult(resultsRef.current.join(' '));
    };
    recognition.onerror = (event) => {
      setRecording(false);
      setError('语音识别出错: ' + event.error);
    };
    recognition.onend = async () => {
      setRecording(false);
      const query = resultsRef.current.join(' ');
      if (query) {
        setLoading(true);
        setError('');
        setAiStep('interpreting');
        try {
          const data = await interpretText(query);
          setIntentResult(data);
          // 自动TTS播报 direct_response 或 confirmText
          if (data.type === 'direct_response' && data.content) ttsSpeak(data.content);
          if (data.type === 'confirm' && data.confirmText) ttsSpeak(data.confirmText);
          setAiStep(data.type === 'direct_response' ? 'direct_response' : 'confirming');
        } catch (e) {
          setError(e.message);
          setAiStep('error');
        }
        setLoading(false);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  const handleCircleClick = () => {
    if (recording) {
      stopRecognition();
    } else {
      setResult('');
      setIntentResult(null);
      setExecResult(null);
      setError('');
      setAiStep('idle');
      startRecognition();
    }
  };

  // 确认、重说、取消
  const handleConfirm = async () => {
    if (!intentResult) return;
    setLoading(true);
    setAiStep('executing');
    setError('');
    try {
      const data = await executeTask(intentResult.intent, intentResult.params);
      setExecResult(data);
      setAiStep('done');
      if (data.tts) ttsSpeak(data.tts);
    } catch (e) {
      setError(e.message);
      setAiStep('error');
    }
    setLoading(false);
  };
  const handleRetry = () => {
    setResult('');
    setIntentResult(null);
    setExecResult(null);
    setError('');
    setAiStep('idle');
  };
  const handleCancel = () => {
    setResult('');
    setIntentResult(null);
    setExecResult(null);
    setError('');
    setAiStep('idle');
    ttsSpeak('操作已取消');
  };

  // 自动TTS direct_response内容（防止多次播报）
  useEffect(() => {
    if (aiStep === 'direct_response' && intentResult?.content) {
      ttsSpeak(intentResult.content);
    }
  }, [aiStep, intentResult]);

  return (
    <div style={{ position: 'fixed', inset: 0, minHeight: '100vh', width: '100vw', background: 'var(--bg-main)', overflow: 'hidden', zIndex: 0 }}>
      {/* 主内容区留白，可后续扩展 */}
      {/* AI交互卡片浮现于底部卡片上方 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>
          {loading && <div className="card-theme" style={{ color: 'var(--color-primary)', margin: 12, textAlign: 'center', fontSize: 18, pointerEvents: 'auto' }}>AI处理中...</div>}
          {error && <div className="card-theme text-error" style={{ margin: 12, textAlign: 'center', fontSize: 17, pointerEvents: 'auto' }}>{error}</div>}
          {/* direct_response 卡片 */}
          {aiStep === 'direct_response' && intentResult && (
            <div className="card-theme" style={{ margin: 12, padding: 'var(--space-md) var(--space-lg)', fontSize: 17, color: 'var(--text-main)', pointerEvents: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>AI回复</div>
              <div style={{ color: 'var(--text-main)', fontSize: 17, whiteSpace: 'pre-line' }}>{intentResult.content}</div>
            </div>
          )}
          {/* 确认卡片 */}
          {aiStep === 'confirming' && intentResult && (
            <div className="card-theme" style={{ margin: 12, padding: 'var(--space-md) var(--space-lg)', fontSize: 17, color: 'var(--text-main)', pointerEvents: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>AI理解：{intentResult.confirmText || '--'}</div>
              <div style={{ marginBottom: 8 }}><b>意图：</b>{intentResult.intent || '--'}</div>
              <div style={{ marginBottom: 8 }}><b>参数：</b><pre style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', background: 'none' }}>{JSON.stringify(intentResult.params, null, 2)}</pre></div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirm} disabled={loading}>确认执行</button>
                <button style={{ flex: 1, background: 'var(--color-warning)', color: '#18181b' }} onClick={handleRetry} disabled={loading}>重说</button>
                <button style={{ flex: 1, background: 'var(--color-error)', color: '#fff' }} onClick={handleCancel} disabled={loading}>取消</button>
              </div>
            </div>
          )}
          {/* 执行结果卡片 */}
          {aiStep === 'done' && execResult && (
            <div className="card-theme" style={{ margin: 12, padding: 'var(--space-md) var(--space-lg)', fontSize: 17, color: 'var(--text-main)', pointerEvents: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>执行结果</div>
              <div><b>结果：</b><pre style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', background: 'none' }}>{JSON.stringify(execResult.result || execResult.data, null, 2)}</pre></div>
              {execResult.tts && <div style={{ marginTop: 8, color: 'var(--color-primary)' }}><b>播报：</b>{execResult.tts}</div>}
            </div>
          )}
        </div>
      </div>
      {/* 底部悬浮卡片 */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
        <div className="card-theme" style={{ maxWidth: 420, width: '100%', margin: '0 auto', borderRadius: '24px 24px 0 0', boxShadow: '0 -4px 24px rgba(79,209,197,0.10)', padding: '32px 0 40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto' }}>
          {/* 录音按钮 */}
          <div
            onClick={handleCircleClick}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: recording ? '0 0 0 8px #4FD1C555, 0 2px 8px rgba(79,209,197,0.18)' : '0 2px 8px rgba(79,209,197,0.18)',
              cursor: 'pointer',
              position: 'relative',
              animation: recording ? 'pulse 1s infinite' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
              userSelect: 'none',
            }}
          >
            {/* 麦克风SVG图标 */}
            <svg width="36" height="36" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="#fff" fillOpacity={recording ? 0.18 : 0.12} />
              <rect x="20" y="14" width="16" height="24" rx="8" fill="#fff" />
              <rect x="25" y="38" width="6" height="8" rx="3" fill="#fff" />
              <rect x="18" y="46" width="20" height="4" rx="2" fill="#fff" />
            </svg>
            <style>{`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 #4FD1C555, 0 2px 8px rgba(79,209,197,0.18); }
                70% { box-shadow: 0 0 0 24px #4FD1C511, 0 2px 8px rgba(79,209,197,0.18); }
                100% { box-shadow: 0 0 0 0 #4FD1C555, 0 2px 8px rgba(79,209,197,0.18); }
              }
            `}</style>
          </div>
          <div style={{ marginTop: 18, color: 'var(--text-secondary)', fontSize: 16, textAlign: 'center' }}>
            {recording ? '点击停止录音' : '点击录音'}
          </div>
          {/* 录音结果简要显示 */}
          {result && <div style={{ marginTop: 10, color: 'var(--text-main)', fontSize: 17, textAlign: 'center', wordBreak: 'break-all' }}>{result}</div>}
        </div>
      </div>
    </div>
  );
}

export default Home;