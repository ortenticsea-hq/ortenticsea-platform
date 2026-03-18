
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, LanguageIcon, ShoppingBagIcon, PlusIcon } from '@heroicons/react/24/solid';
import { ChatMessage, Product } from '../types.ts';
import { getOAssistResponse } from '../services/geminiService.ts';
import { PRODUCTS } from '../constants.tsx';

interface ChatViewProps {
  onProductNavigate: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onProductNavigate, onAddToCart }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'pidgin' | 'english' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'ai',
          text: "Abuja's own O-Assist here! I fit talk Pidgin and I can also speak English. Which one you prefer? / Welcome! I can respond in Pidgin or English. Which do you prefer?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const selectLanguage = (pref: 'pidgin' | 'english') => {
    setLanguage(pref);
    const confirmMsg = pref === 'pidgin' 
      ? "Beta! I go talk Pidgin with you now. Wetin you wan find today? I fit help you find phones, laptops, and clean Grade-A items." 
      : "Excellent! I will respond in English. How can I help you today? I can help you find smartphones, laptops, and other premium Grade-A items.";
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'ai',
      text: confirmMsg,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !language) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }]
    }));

    try {
      const response = await getOAssistResponse(input, language, history);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat response failed:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: language === 'pidgin'
          ? 'Abeg, assistant no dey available right now. Try again shortly.'
          : 'The assistant is unavailable right now. Please try again shortly.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageText = (text: string) => {
    const productRegex = /\[Product:(p\d+)\]/g;
    const parts = text.split(productRegex);
    const matches = Array.from(text.matchAll(productRegex));

    if (matches.length === 0) return <span>{text}</span>;

    return (
      <div className="space-y-4">
        <span>
          {parts.map((part, i) => {
            const product = PRODUCTS.find(p => p.id === part);
            if (product) {
              return (
                <button
                  key={i}
                  onClick={() => onProductNavigate(product.id)}
                  className="inline-flex items-center gap-1 bg-orange-100 text-[#F26A21] px-2 py-0.5 rounded-md text-[11px] font-bold mx-0.5 hover:bg-[#F26A21] hover:text-white transition-all shadow-sm"
                >
                  <ShoppingBagIcon className="w-3 h-3" />
                  {product.name}
                </button>
              );
            }
            return part;
          })}
        </span>
        
        {/* Sales Conversion Card Section */}
        <div className="flex flex-col gap-2 mt-2">
          {matches.map((match, i) => {
            const pId = match[1];
            const product = PRODUCTS.find(p => p.id === pId);
            if (!product) return null;
            return (
              <div 
                key={i}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-2xl transition-all hover:border-[#F26A21] group relative pr-14"
              >
                <div 
                  className="flex items-center gap-3 flex-grow cursor-pointer"
                  onClick={() => onProductNavigate(product.id)}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#0B1E3F] line-clamp-1">{product.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{product.condition}</p>
                    <p className="text-xs text-[#F26A21] font-black">₦{product.price.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Efficient Sale Action: Add to Cart Directly */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#F26A21] text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10 active:scale-90"
                  title="Add to Cart"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 h-[calc(100vh-140px)] md:h-[calc(100vh-200px)] py-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F26A21] rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-[#0B1E3F]">O-Assist Concierge</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Assistant</p>
          </div>
        </div>
        {language && (
          <button 
            onClick={() => setLanguage(null)}
            className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#F26A21] uppercase tracking-wider transition-colors"
          >
            <LanguageIcon className="w-4 h-4" />
            Switch ({language})
          </button>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-4 pb-4 px-2 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[88%] md:max-w-[75%] p-4 rounded-3xl shadow-sm text-sm ${
                msg.sender === 'user' 
                  ? 'bg-[#0B1E3F] text-white rounded-tr-none' 
                  : 'bg-white text-[#0B1E3F] border border-gray-100 rounded-tl-none'
              }`}
            >
              {msg.sender === 'ai' ? renderMessageText(msg.text) : msg.text}
              <div className={`text-[9px] mt-2 opacity-40 font-bold ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {!language && (
          <div className="flex flex-col items-center gap-5 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Select Your Preference</p>
            <div className="flex gap-4">
              <button 
                onClick={() => selectLanguage('pidgin')}
                className="bg-[#F26A21] text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Speak Pidgin
              </button>
              <button 
                onClick={() => selectLanguage('english')}
                className="bg-[#0B1E3F] text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                Speak English
              </button>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-[#F26A21] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#F26A21] rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-[#F26A21] rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 relative">
        <input 
          type="text"
          value={input}
          disabled={!language}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={language ? "Search products or ask O-Assist..." : "Choose a language to start..."}
          className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-5 pr-16 focus:outline-none focus:ring-4 focus:ring-[#F26A21]/10 shadow-lg disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || !language}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#F26A21] text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-30 shadow-lg shadow-orange-500/30"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
