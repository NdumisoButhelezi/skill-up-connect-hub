
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  type: "user" | "bot";
  text: string;
}

const FaqChatbot = () => {
  const { userRole } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: `Hello! I'm the SkillUpConnect assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Define FAQ responses based on user role
  const getFaqResponse = (question: string): string => {
    const lowercaseQ = question.toLowerCase();
    
    // Common FAQs for all users
    if (lowercaseQ.includes("hello") || lowercaseQ.includes("hi")) {
      return "Hello! How can I help you today?";
    }
    
    if (lowercaseQ.includes("how does") && lowercaseQ.includes("work")) {
      return "SkillUpConnect helps job seekers build skills through workshops created by recruiters. Complete lessons, submit reflections, and earn points and badges!";
    }
    
    // Role-specific FAQs
    if (userRole === "jobSeeker") {
      if (lowercaseQ.includes("badge") || lowercaseQ.includes("badges")) {
        return "You can earn badges by completing reflections and earning points:\n🥉 Starter Class: Submit your first reflection\n🥈 Achiever Class: Earn 100+ points\n🥇 Expert Class: Complete 3+ workshop lessons";
      }
      
      if (lowercaseQ.includes("point") || lowercaseQ.includes("points")) {
        return "You earn points when your reflections are approved by workshop creators. Points contribute to your position on the leaderboard and help you earn badges!";
      }
      
      if (lowercaseQ.includes("register")) {
        return "To register for a workshop, browse available workshops in your dashboard and click the 'Register' button on any workshop that interests you.";
      }
    }
    
    if (userRole === "recruiter") {
      if (lowercaseQ.includes("create")) {
        return "To create a workshop, click on 'Create Workshop' in your dashboard. You can add multiple lessons to each workshop, and job seekers can register and complete reflections.";
      }
      
      if (lowercaseQ.includes("payment") || lowercaseQ.includes("subscribe")) {
        return "The free tier allows you to create up to 5 workshops. To create unlimited workshops, you'll need to subscribe for $29.99/month.";
      }
      
      if (lowercaseQ.includes("stat") || lowercaseQ.includes("analytics")) {
        return "You can view workshop statistics by clicking on a workshop and selecting the 'Statistics' tab. This shows registrations, reflections submitted, approval rates, and more.";
      }
    }
    
    // Default response
    return "I'm sorry, I don't have information about that yet. Please contact support if you need more help.";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = { type: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Get bot response
    const botResponse = getFaqResponse(input);
    
    // Add bot response with slight delay
    setTimeout(() => {
      const botMessage: Message = { type: "bot", text: botResponse };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
    
    // Clear input
    setInput("");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        size="icon"
        className={`rounded-full shadow-lg ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-teal-600 hover:bg-teal-700"}`}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </Button>
      
      {/* Chat window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-lg">
          <CardHeader className="bg-teal-600 text-white py-3 px-4">
            <CardTitle className="text-sm flex items-center">
              <MessageCircle size={16} className="mr-2" />
              SkillUpConnect Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    message.type === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg py-2 px-3 max-w-[80%] ${
                      message.type === "user"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-3 flex">
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                className="flex-1 mr-2"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Send size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FaqChatbot;
