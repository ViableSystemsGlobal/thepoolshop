"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface FloatingChatButtonProps {
  customBackground?: string;
}

export function FloatingChatButton({ customBackground }: FloatingChatButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasDismissedPreview, setHasDismissedPreview] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const chatModalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatModalRef.current && !chatModalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Show welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome && chatHistory.length === 0) {
      setHasShownWelcome(true);
      const welcomeMessage = {
        role: 'assistant' as const,
        content: "👋 Hi! I'm Kwame, your AI assistant.\n\nI'm here to help you navigate the system, answer questions, and make your work easier. Feel free to ask me anything!"
      };
      setChatHistory([welcomeMessage]);
    }
  }, [isOpen, hasShownWelcome, chatHistory.length]);

  // Check if user has previously dismissed the preview
  useEffect(() => {
    const dismissed = localStorage.getItem('kwame-preview-dismissed');
    const lastShown = localStorage.getItem('kwame-preview-last-shown');
    const visitCount = parseInt(localStorage.getItem('kwame-visit-count') || '0');
    
    // Increment visit count
    localStorage.setItem('kwame-visit-count', (visitCount + 1).toString());
    
    if (dismissed === 'true') {
      setHasDismissedPreview(true);
      return;
    }
    
    // Only show if:
    // 1. User hasn't seen it in the last 24 hours
    // 2. User has visited at least 2 times (not first visit)
    // 3. Not on mobile (less intrusive)
    const now = Date.now();
    const lastShownTime = lastShown ? parseInt(lastShown) : 0;
    const isMobile = window.innerWidth < 768;
    const shouldShow = visitCount >= 2 && 
                      (now - lastShownTime) > 24 * 60 * 60 * 1000 && 
                      !isMobile;
    
    if (shouldShow) {
      const showTimer = setTimeout(() => {
        setShowPreview(true);
        localStorage.setItem('kwame-preview-last-shown', now.toString());
      }, 3000); // Slightly longer delay
      
      const hideTimer = setTimeout(() => {
        setShowPreview(false);
      }, 10000); // Shorter display time
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user' as const, content: message };
    setChatHistory([...chatHistory, userMessage]);
    setMessage("");

    // Placeholder AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: "Hello! I'm your AI assistant. I'll be connected soon to help you with questions about the system."
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Enhanced dismissal function with animation
  const handleDismissPreview = (permanent = true) => {
    setIsDismissing(true);
    
    // Animate out
    setTimeout(() => {
      setShowPreview(false);
      setIsDismissing(false);
      
      if (permanent) {
        setHasDismissedPreview(true);
        localStorage.setItem('kwame-preview-dismissed', 'true');
      }
    }, 300); // Match animation duration
  };

  // Utility function to reset preview dismissal (for development/testing)
  const resetPreviewDismissal = () => {
    setHasDismissedPreview(false);
    setIsDismissing(false);
    localStorage.removeItem('kwame-preview-dismissed');
    localStorage.removeItem('kwame-preview-last-shown');
    localStorage.removeItem('kwame-visit-count');
  };

  // Expose reset function to window for debugging
  useEffect(() => {
    (window as any).resetKwamePreview = resetPreviewDismissal;
  }, []);

  return (
    <>
      {/* Preview Message */}
      {showPreview && !isOpen && !hasDismissedPreview && (
        <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${
          isDismissing 
            ? 'animate-out slide-out-to-bottom-2 fade-out' 
            : 'animate-in slide-in-from-bottom-2 fade-in'
        }`}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Hi! I'm Kwame 👋</p>
                <p className="text-xs text-gray-600 mt-1">Need help? Click here to chat with me!</p>
                <button
                  onClick={() => handleDismissPreview(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1 underline"
                >
                  Don't show again
                </button>
              </div>
              <button
                onClick={() => handleDismissPreview(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPreview(false); // Hide preview when opening chat
        }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        style={{
          background: customBackground 
            ? `url(${customBackground}) center/cover` 
            : 'linear-gradient(135deg, #2563eb, #1d4ed8)'
        }}
      >
        {!customBackground && <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div 
          ref={chatModalRef}
          className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-white text-opacity-80">Ask me anything!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 resize-none border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl px-4 py-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
