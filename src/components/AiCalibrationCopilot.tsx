import React, { useState } from 'react';
import { EcuMapDefinition, VehicleIdentity } from '../types/ecu';
import { TuningHazard } from '../utils/tuningHeuristics';
import { Bot, Send, X, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';

interface AiMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  textMizo?: string;
  hazards?: string[];
  suggestedAction?: 'smooth' | 'clamp' | 'scale';
  suggestedFactor?: number;
  timestamp: string;
}

interface AiCalibrationCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  map: EcuMapDefinition;
  vehicle: VehicleIdentity;
  hazards: TuningHazard[];
  isMizo: boolean;
  onApplyRecommendation: (action: 'smooth' | 'clamp' | 'scale', factor?: number) => void;
}

export const AiCalibrationCopilot: React.FC<AiCalibrationCopilotProps> = ({
  isOpen,
  onClose,
  map,
  vehicle,
  hazards,
  isMizo,
  onApplyRecommendation,
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am your AI Calibration and Software Engineer Copilot for ${vehicle.make} ${vehicle.model} (${vehicle.ecuFamily}). I continuously monitor your manual map cell edits to prevent overboost, lean AFR spikes, engine knock, and jagged surface cliffs. How can I assist your tune today?`,
      textMizo: `Chibai! ApexECU-a i AI Calibration Engineer ka ni e. ${vehicle.make} ${vehicle.model} (${vehicle.ecuFamily}) tana map i khawih lai hian overboost, knocking, leh engine chhiat theihna ka lo en pui reng dawn che a ni. Eng kawngah nge rawtna ka pek ang che?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: isMizo ? '🔍 Map Himna Endik Rawh' : '🔍 Analyze Map Hazards',
      prompt: 'Please audit this calibration map for any overboost, knock hazard, lean AFR, or steep gradient spikes.',
    },
    {
      label: isMizo ? '⛰️ Mizoram Tlang Lawn Nan Torque Tiṭha' : '⛰️ Optimize for Hill Climb Torque',
      prompt: 'Suggest optimal low-to-mid range torque calibration for steep hill climbing and heavy load response.',
    },
    {
      label: isMizo ? '✨ Cell Spikes Auto-Smooth Rawh' : '✨ Smooth Cell Spikes',
      prompt: 'Examine adjacent cells and calculate smooth gradient transitions to prevent drivability surge.',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: AiMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Find altered cells summary
      const diffs: { r: number; c: number; orig: number; curr: number }[] = [];
      map.data.forEach((row, r) => {
        row.forEach((curr, c) => {
          const orig = map.originalData[r]?.[c] ?? curr;
          if (curr !== orig) {
            diffs.push({ r, c, orig, curr });
          }
        });
      });

      const response = await fetch('/api/tune-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          map: {
            id: map.id,
            name: map.name,
            rows: map.rows,
            cols: map.cols,
            zUnit: map.zUnit,
          },
          vehicle,
          userPrompt: text,
          cellDiffs: diffs.slice(0, 15),
          detectedHazards: hazards.map(h => ({ type: h.type, title: h.title, severity: h.severity })),
        }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        const data = json.data;
        const aiMsg: AiMessage = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: data.analysisEn || data.analysis || 'Calibration review complete.',
          textMizo: data.analysisMizo || 'Map endik fel a ni a, zilhna leh rawtna a hnuai-ah hian a awm e.',
          hazards: data.hazards,
          suggestedAction: data.suggestedAction || (hazards.length > 0 ? hazards[0].suggestedAction : undefined),
          suggestedFactor: data.suggestedFactor || 1.05,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(json.error || 'Server error');
      }
    } catch (err: any) {
      const errorMsg: AiMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: 'Apologies, calibration server connection failed. Here is instant heuristic advice: Keep turbo boost within 2350 mbar and maintain smooth transitions between adjacent RPM/load points.',
        textMizo: 'AI server nen inzawmna a buai lawk e. He map tan hian boost chu 2350 mbar pelh loh la, cell inkar inthlau lutuk tlem tlem tih mam tur a ni e.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" />

      {/* Slide-over Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs text-slate-100">
                  {isMizo ? 'AI Calibration Engineer Copilot' : 'AI Calibration Engineer'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {vehicle.make} {vehicle.model} · {map.name.split('(')[0]}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white rounded-lg whitespace-nowrap text-[11px] transition-colors shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                {/* Text Content */}
                <p className="leading-relaxed">
                  {isMizo && msg.textMizo ? msg.textMizo : msg.text}
                </p>

                {/* English toggle/supplement if in Mizo mode */}
                {isMizo && msg.textMizo && msg.text !== msg.textMizo && (
                  <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 font-mono">
                    {msg.text}
                  </p>
                )}

                {/* 1-Click Fix Affordance if AI suggests an action */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <button
                      onClick={() => onApplyRecommendation(msg.suggestedAction!, msg.suggestedFactor)}
                      className="w-full py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isMizo
                          ? 'AI Rawtna Table-ah Apply Rawh'
                          : 'Apply AI Recommendation to Table'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>
                {isMizo ? 'AI Engineer-in map a chhut mek e...' : 'AI Calibration Engineer analyzing map...'}
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isMizo
                ? 'Eng thil nge zilhna emaw rawtna i duh? (Mizo / Eng)'
                : 'Ask AI Engineer about boost, timing, or smoothing...'
            }
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
