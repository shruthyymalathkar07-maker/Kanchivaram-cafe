import React, { useState } from 'react';
import { Bot, Send, Trash2, Sparkles, User, RefreshCw, MessageSquare, ArrowLeft } from 'lucide-react';
import { sendChatbotQuery } from '../services/api';

export default function AIChatbotWorkspace({ onClose, selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "Hello! I am your Kanchivaram Cafe AI Business Assistant. I am connected directly to your database. Ask me anything about today's revenue, low stock items, top sellers, or discounts!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "How much did we sell today?",
    "What was our best-selling item?",
    "Which stock is running low?",
    "How much did Swiggy contribute today?",
    "How much discount did we give today?",
    "What are today's cash collections?"
  ];

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatbotQuery(queryText);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.answer || response.message || "I have processed your query.",
        dataContext: response.dataContext,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I encountered an issue connecting to the database server.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'msg-1',
        sender: 'bot',
        text: "Chat history cleared. How can I assist your operations now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Theme tokens
  const outerBg    = isBrownBranch ? 'bg-[#1C0D07] border-[#3E2312]' : 'bg-[#0e241b] border-[#1f4a38]';
  const headerBg   = isBrownBranch ? 'bg-[#120804] border-[#3E2312]' : 'bg-[#091912] border-[#1b4231]';
  const backBtn    = isBrownBranch ? 'bg-[#2D190D] hover:bg-[#3E2312] text-[#C69A4B]' : 'bg-[#16382a] hover:bg-[#204e3b] text-[#86af9c]';
  const botIconBox = isBrownBranch ? 'bg-[#2D190D] border-[#542A16] text-[#C69A4B]' : 'bg-[#183d2e] border-[#2b634b] text-[#4ade80]';
  const liveDataBadge = isBrownBranch ? 'bg-[#2D190D] text-[#C69A4B] border-[#542A16]' : 'bg-[#183d2e] text-[#4ade80] border-[#2b634b]';
  const clearBtn   = isBrownBranch ? 'bg-[#2D190D] hover:bg-[#3E2312] text-[#C69A4B] border-[#542A16]' : 'bg-[#16382a] hover:bg-[#22543e] text-[#83a997] border-[#245742]';
  const chipsBg    = isBrownBranch ? 'bg-[#0E0603] border-[#2D190D]' : 'bg-[#0c1f17] border-[#183d2e]';
  const quickLabel = isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]';
  const chipBtn    = isBrownBranch ? 'bg-[#200F08] hover:bg-[#2D190D] border-[#3E2312] hover:border-[#C69A4B]' : 'bg-[#143326] hover:bg-[#1c4735] border-[#235742] hover:border-[#4ade80]';
  const streamBg   = isBrownBranch ? 'from-[#1C0D07] to-[#120804]' : 'from-[#0e241b] to-[#0a1b14]';
  const botBubbleAvatar = isBrownBranch ? 'bg-[#2D190D] border-[#542A16] text-[#C69A4B]' : 'bg-[#183d2e] border-[#2b634b] text-[#4ade80]';
  const botBubble  = isBrownBranch ? 'bg-[#200F08] text-slate-100 border-[#3E2312]' : 'bg-[#143326] text-slate-100 border-[#224f3c]';
  const userBubble = isBrownBranch ? 'bg-[#C69A4B] text-[#120804]' : 'bg-[#4ade80] text-[#091912]';
  const userAvatar = isBrownBranch ? 'bg-[#C69A4B] text-[#120804]' : 'bg-[#4ade80] text-[#091912]';
  const dataCard   = isBrownBranch ? 'bg-[#0E0603] border-[#3E2312]' : 'bg-[#0a1b14] border-[#1f4a38]';
  const dataMetricColor = isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]';
  const loadingAvatar = isBrownBranch ? 'bg-[#2D190D] border-[#542A16] text-[#C69A4B]' : 'bg-[#183d2e] border-[#2b634b] text-[#4ade80]';
  const loadingBubble = isBrownBranch ? 'bg-[#200F08] border-[#3E2312] text-[#C69A4B]' : 'bg-[#143326] border-[#224f3c] text-[#83a997]';
  const inputFooter = isBrownBranch ? 'bg-[#120804] border-[#3E2312]' : 'bg-[#091912] border-[#1b4231]';
  const inputField  = isBrownBranch ? 'bg-[#200F08] border-[#3E2312] focus:border-[#C69A4B]' : 'bg-[#143326] border-[#245742] focus:border-[#4ade80]';
  const sendBtn     = isBrownBranch ? 'bg-[#C69A4B] hover:bg-[#B8892A] text-[#120804]' : 'bg-[#4ade80] hover:bg-[#3ec46f] text-[#091912]';

  return (
    <div className={`w-full flex-1 h-full min-h-0 ${outerBg} rounded-3xl border-2 shadow-2xl overflow-hidden flex flex-col animate-fadeIn`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 ${headerBg} border-b shrink-0`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${backBtn} hover:text-white transition-colors cursor-pointer mr-2`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`p-2.5 rounded-2xl ${botIconBox} border shadow-inner`}>
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-sans flex items-center gap-2">
              Kanchivaram AI Intelligence Workspace
              <span className={`px-2 py-0.5 ${liveDataBadge} text-[10px] font-mono rounded-full border`}>LIVE DATA</span>
            </h2>
            <p className="text-xs text-[#83a997] font-semibold">
              Authorized Business Data Query Engine & Operational Copilot
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className={`flex items-center gap-2 px-3 py-1.5 ${clearBtn} font-bold text-xs rounded-xl border transition-colors cursor-pointer hover:text-white`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className={`px-6 py-3 ${chipsBg} border-b flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0`}>
        <span className={`text-xs font-bold ${isBrownBranch ? 'text-[#C69A4B]/80' : 'text-[#83a997]'} shrink-0 flex items-center gap-1`}>
          <Sparkles className={`w-3.5 h-3.5 ${quickLabel}`} /> Quick Ask:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className={`px-3 py-1.5 ${chipBtn} text-slate-200 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Conversation Stream */}
      <div className={`flex-1 min-h-0 p-6 space-y-4 overflow-y-auto custom-scrollbar bg-gradient-to-b ${streamBg}`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className={`w-8 h-8 rounded-full ${botBubbleAvatar} border flex items-center justify-center shrink-0`}>
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[75%] p-4 rounded-3xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? `${userBubble} font-bold rounded-tr-none shadow-md`
                  : `${botBubble} border rounded-tl-none shadow-lg`
              }`}
            >
              <p>{msg.text}</p>
              
              {/* Optional Structured Data Card */}
              {msg.dataContext && (
                <div className={`mt-3 p-3 ${dataCard} rounded-2xl border text-xs space-y-1`}>
                  <span className={`font-extrabold ${dataMetricColor} uppercase tracking-wider text-[10px]`}>Verified System Context</span>
                  {msg.dataContext.metric && (
                    <div className="flex justify-between font-mono font-bold text-white">
                      <span>{msg.dataContext.metric}:</span>
                      <span className={dataMetricColor}>{msg.dataContext.value}</span>
                    </div>
                  )}
                </div>
              )}

              <span className={`block text-[10px] mt-2 text-right ${msg.sender === 'user' ? `${isBrownBranch ? 'text-[#120804]/70' : 'text-[#0e291e]/70'} font-semibold` : 'text-[#83a997]'}`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className={`w-8 h-8 rounded-full ${userAvatar} font-black text-xs flex items-center justify-center shrink-0`}>
                S
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${loadingAvatar} border flex items-center justify-center animate-spin`}>
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className={`${loadingBubble} p-3 rounded-2xl border text-xs font-bold animate-pulse`}>
              Querying Kanchivaram Cafe live database...
            </div>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className={`p-4 ${inputFooter} border-t shrink-0`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything about sales, revenue, low stock, or best-selling items..."
            className={`flex-1 px-5 py-3 ${inputField} border rounded-full text-sm text-white placeholder-[#69917f] focus:outline-none font-medium`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`flex items-center gap-2 px-6 py-3 ${sendBtn} font-black text-xs rounded-full shadow-lg transition-all cursor-pointer disabled:opacity-50`}
          >
            <span>Ask AI</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
