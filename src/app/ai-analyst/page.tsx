"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: any;
  timestamp: Date;
}

export default function AIAnalystPage() {
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const { error: showError } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Hi there! I'm Jayne, your AI Business Analyst.\n\nI can help you understand your business data and provide insights. Try asking me:\n\n• "What's my revenue this month?"\n• "Show me top 5 customers"\n• "Which products are low on stock?"\n• "What's my conversion rate?"\n• "How many leads did we get?"\n• "Show me my best selling products"\n• "What's my win rate?"\n• "How many orders are pending?"`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const result = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response.text || result.response,
        chart: result.response.chart || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      showError("Error", "Failed to process your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${getThemeColor()}20` }}
            >
              <Sparkles
                className="h-6 w-6"
                style={{ color: getThemeColor() }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Business Analyst
              </h1>
              <p className="text-gray-600">
                Ask Jayne anything about your business data and get intelligent insights
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Chat with Jayne</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto space-y-4 pr-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-gray-200"
                            : "bg-gray-100"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Bot
                            className="h-4 w-4"
                            style={{ color: getThemeColor() }}
                          />
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-gray-100 text-gray-900"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.chart && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Chart: {message.chart.type}</h4>
                            <div className="text-xs text-gray-600">
                              <p>Labels: {message.chart.data.labels.join(', ')}</p>
                              <p>Values: {message.chart.data.values.join(', ')}</p>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
                      >
                        <Bot
                          className="h-4 w-4"
                          style={{ color: getThemeColor() }}
                        />
                      </div>
                      <div className="rounded-lg p-4 bg-white border border-gray-200">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your business..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  style={{ backgroundColor: getThemeColor(), color: "white" }}
                  className="hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}