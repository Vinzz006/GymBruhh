import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { ChatMessage, AIRecommendation } from '../types';

interface AIContextType {
  chatMessages: ChatMessage[];
  recommendations: AIRecommendation[];
  lastProgressReview: any | null;
  lastMealSuggestion: any | null;
  isGeneratingWorkout: boolean;
  isGeneratingMeal: boolean;
  isAnalyzingProgress: boolean;
  isChatLoading: boolean;
  fetchRecommendations: () => Promise<void>;
  respondRecommendation: (recommendationId: number, accept: boolean) => Promise<void>;
  fetchChatHistory: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  generateWorkout: (customNotes?: string) => Promise<any>;
  suggestMeal: (mealType?: string, prompt?: string) => Promise<any>;
  replaceExercise: (exerciseId: number) => Promise<any[]>;
  analyzeProgress: () => Promise<any>;
  scanFoodImage: (imageBase64?: string) => Promise<any>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [lastProgressReview, setLastProgressReview] = useState<any | null>(null);
  const [lastMealSuggestion, setLastMealSuggestion] = useState<any | null>(null);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState<boolean>(false);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState<boolean>(false);
  const [isAnalyzingProgress, setIsAnalyzingProgress] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const fetchRecommendations = async () => {
    try {
      const list = await api.get(API_ENDPOINTS.recommendations);
      if (Array.isArray(list)) {
        setRecommendations(
          list.map((r: any) => ({
            id: r.id,
            recommendationType: r.recommendation_type,
            title: r.title,
            recommendationText: r.recommendation_text,
            suggestedAction: r.suggested_action,
            status: r.status,
          }))
        );
      }
    } catch (e) {
      console.warn('Could not fetch recommendations:', e);
    }
  };

  const respondRecommendation = async (recommendationId: number, accept: boolean) => {
    try {
      await api.post(API_ENDPOINTS.respondRecommendation, {
        recommendation_id: recommendationId,
        accept,
      });
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
      await fetchRecommendations();
    } catch (e) {
      console.warn('Error responding to recommendation:', e);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.chatHistory);
      if (data && Array.isArray(data.messages)) {
        setChatMessages(
          data.messages.map((m: any) => ({
            id: m.id || Math.random().toString(),
            sender: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
            createdAt: m.created_at || new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      console.warn('Could not fetch chat history:', e);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchChatHistory();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text || text.trim().length === 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await api.post(API_ENDPOINTS.chatTrainer, { message: text.trim() });
      if (res && res.reply) {
        const aiMsg: ChatMessage = {
          id: res.conversation_id || (Date.now() + 1).toString(),
          sender: 'assistant',
          content: res.reply,
          createdAt: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
      }
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content:
          'I am ready to help! Ask me anything about progressive overload, meal planning, recovery, or workout modifications.',
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateWorkout = async (customNotes?: string) => {
    setIsGeneratingWorkout(true);
    try {
      const res = await api.post(API_ENDPOINTS.generateWorkout, {
        custom_notes: customNotes,
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      return res;
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const suggestMeal = async (mealType: string = 'dinner', prompt?: string) => {
    setIsGeneratingMeal(true);
    try {
      const res = await api.post(API_ENDPOINTS.suggestMeal, {
        meal_type: mealType,
        user_prompt: prompt,
      });
      setLastMealSuggestion(res);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      return res;
    } finally {
      setIsGeneratingMeal(false);
    }
  };

  const replaceExercise = async (exerciseId: number) => {
    try {
      const res = await api.post(API_ENDPOINTS.replaceExercise, {
        exercise_id: exerciseId,
      });
      if (Array.isArray(res)) return res;
      return [];
    } catch (e) {
      console.warn('Error replacing exercise:', e);
      return [];
    }
  };

  const analyzeProgress = async () => {
    setIsAnalyzingProgress(true);
    try {
      const res = await api.post(API_ENDPOINTS.analyzeProgress);
      setLastProgressReview(res);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      return res;
    } finally {
      setIsAnalyzingProgress(false);
    }
  };

  const scanFoodImage = async (imageBase64?: string) => {
    try {
      const res = await api.post(API_ENDPOINTS.scanFood, {
        image_base64: imageBase64,
      });
      return res;
    } catch (e) {
      console.warn('Error scanning food image:', e);
      return null;
    }
  };

  return (
    <AIContext.Provider
      value={{
        chatMessages,
        recommendations,
        lastProgressReview,
        lastMealSuggestion,
        isGeneratingWorkout,
        isGeneratingMeal,
        isAnalyzingProgress,
        isChatLoading,
        fetchRecommendations,
        respondRecommendation,
        fetchChatHistory,
        sendMessage,
        generateWorkout,
        suggestMeal,
        replaceExercise,
        analyzeProgress,
        scanFoodImage,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext;
