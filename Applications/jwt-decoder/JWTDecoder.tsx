import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Download, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface JWTSection {
  header: object | null;
  payload: object | null;
  signature: string;
}

export default function JWTDecoder() {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JWTSection>({ header: null, payload: null, signature: '' });
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load last session data from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('jwt_decoder_last_token');
    if (savedToken) {
      setToken(savedToken);
      decodeJWT(savedToken);
    }
  }, []);

  const base64UrlDecode = (str: string) => {
    try {
      // Replace non-url safe characters and pad base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return JSON.parse(window.atob(base64));
    } catch (e) {
      throw new Error("Invalid base64 encoding fragment");
    }
  };

  const decodeJWT = (rawToken: string) => {
    const trimmed = rawToken.trim();
    if (!trimmed) {
      setDecoded({ header: null, payload: null, signature: '' });
      setError(null);
      return;
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setError('Invalid JWT format: A valid token must contain exactly 3 segments separated by dots (.)');
      setDecoded({ header: null, payload: null, signature: '' });
      return;
    }

    try {
      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      const signature = parts[2];

      setDecoded({ header, payload, signature });
      setError(null);
      localStorage.setItem('jwt_decoder_last_token', trimmed);
      
      // Dispatch Analytics Event
      triggerAnalytics('jwt_decoded');
    } catch (err) {
      setError('Malformed Token: Unable to decode Base64 URL segments correctly.');
      setDecoded({ header: null, payload: null, signature: '' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setToken(val);
    decodeJWT(val);
  };

  const loadSampleToken = () => {
    // Standard mock OpenID Connect tracking token
    const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE5MjQ5MDU2MDB9.S3pXbXBsZVNpZ25hdHVyZUZvckRlbW9uc3RyYXRpb25Pbmx5MTIzNDU";
    setToken(sample);
    decodeJWT(sample);
    triggerAnalytics('sample_loaded');
  };

  const clearWorkspace = () => {
    setToken('');
    setDecoded({ header: null, payload: null, signature: '' });
    setError(null);
    localStorage.removeItem('jwt_decoder_last_token');
  };

  const copyToClipboard = (text: string, type: 'header' | 'payload' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
    triggerAnalytics(`copy_${type}`);
  };

  const downloadJSON = (data: object, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    triggerAnalytics('download_json');
  };

  const triggerAnalytics = (eventName: string) => {
    // Safely hook into global window data layers if they exist
    if (typeof window !== 'undefined') {
      console.log(`[Analytics Event]: ${eventName}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-6 font-sans selection:bg-purple-500/30">
      {/* Header Info Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Secure JWT Decoder
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Decode and inspect JSON Web Tokens instantly. All calculations are performed entirely locally inside your browser context.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input Workspace */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#111827]/60 border border-white/10 backdrop-blur-md rounded-xl p-5 flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-purple-400">Encoded Token String</span>
              <div className="flex gap-2">
                <button 
                  onClick={loadSampleToken}
                  className="flex items-center gap-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 px-2.5 py-1.5 rounded-md transition"
                >
                  <RefreshCw size={12} /> Load Sample
                </button>
                <button 
                  onClick={clearWorkspace}
                  className="flex items-center gap-1.5 text-xs bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-md transition"
                >
                  <Trash2 size={12} /> Clear
                </button>
              </div>
            </div>

            <textarea
              className="w-full flex-1 min-h-[350px] lg:min-h-[450px] bg-[#0d131f]/90 border border-white/5 rounded-lg p-4 font-mono text-sm leading-relaxed focus:outline-none focus:border-purple-500 transition resize-none text-gray-300 placeholder:text-gray-600"
              placeholder="Paste your encoded JWT string here (header.payload.signature)..."
              value={token}
              onChange={handleInputChange}
            />

            {/* Validation State Bar */}
            <div className="mt-4">
              {error ? (
                <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs leading-normal">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              ) : decoded.header ? (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg text-xs">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Token base-structure parsed successfully. Secure local environment active.</span>
                </div>
              ) : (
                <div className="text-center text-xs text-gray-500 border border-dashed border-white/5 p-3 rounded-lg">
                  Awaiting input data string stream...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pretty Printed Output Blocks */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* HEADER CARD */}
          <div className="bg-[#111827]/60 border border-white/10 backdrop-blur-md rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-sm font-semibold uppercase text-red-400">JWT Header (Metadata)</span>
              </div>
              {decoded.header && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                    className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded transitions"
                    title="Copy Header"
                  >
                    {copySuccess === 'header' ? <span className="text-xs text-emerald-400">Copied!</span> : <Copy size={15} />}
                  </button>
                </div>
              )}
            </div>
            <pre className="bg-[#0d131f]/80 border border-white/5 rounded-lg p-4 font-mono text-sm overflow-x-auto min-h-[80px] text-red-300/90">
              {decoded.header ? JSON.stringify(decoded.header, null, 2) : '// Header object details layout'}
            </pre>
          </div>

          {/* PAYLOAD CARD */}
          <div className="bg-[#111827]/60 border border-white/10 backdrop-blur-md rounded-xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-sm font-semibold uppercase text-purple-400">JWT Payload (Claims Data)</span>
              </div>
              {decoded.payload && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => downloadJSON(decoded.payload!, 'jwt_payload.json')}
                    className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded transitions"
                    title="Download Payload JSON"
                  >
                    <Download size={15} />
                  </button>
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                    className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded transitions"
                    title="Copy Payload"
                  >
                    {copySuccess === 'payload' ? <span className="text-xs text-emerald-400">Copied!</span> : <Copy size={15} />}
                  </button>
                </div>
              )}
            </div>
            <pre className="bg-[#0d131f]/80 border border-white/5 rounded-lg p-4 font-mono text-sm overflow-x-auto flex-1 min-h-[180px] text-purple-300/90">
              {decoded.payload ? JSON.stringify(decoded.payload, null, 2) : '// Claims payload items output'}
            </pre>
          </div>

          {/* SIGNATURE CARD */}
          <div className="bg-[#111827]/60 border border-white/10 backdrop-blur-md rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-sm font-semibold uppercase text-blue-400">Token Signature Fragment</span>
            </div>
            <div className="bg-[#0d131f]/80 border border-white/5 rounded-lg p-4 font-mono text-xs overflow-x-auto break-all text-blue-300/80 tracking-wide">
              {decoded.signature ? decoded.signature : '// Cryptographic validation signature string'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}