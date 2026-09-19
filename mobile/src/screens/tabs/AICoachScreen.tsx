import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAI } from '../../context/AIContext';

export const AICoachScreen: React.FC = () => {
  const {
    chatMessages,
    recommendations,
    sendMessage,
    isChatLoading,
    respondRecommendation,
  } = useAI();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedPrompts = [
    'What should I eat for dinner?',
    'How to progressively overload bench press?',
    'Should I deload this week?',
    'Suggest an alternative for deadlifts',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    sendMessage(text.trim());
    setInputText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const pendingRecs = recommendations.filter((r) => r.status === 'pending');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coachAvatar}>
            <Ionicons name="sparkles" size={20} color={AppColors.purple} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Fitness Coach</Text>
            <Text style={styles.headerSub}>Powered by Google Gemini API</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progressive Overload Recommendation Banner */}
          {pendingRecs.map((rec) => (
            <View key={rec.id} style={styles.recBanner}>
              <View style={styles.recHeader}>
                <Ionicons name="flash" size={16} color={AppColors.purple} />
                <Text style={styles.recTag}>PROGRESSIVE OVERLOAD RECOMMENDATION</Text>
              </View>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recText}>{rec.recommendationText}</Text>
              <View style={styles.recActions}>
                <TouchableOpacity
                  style={styles.recRejectBtn}
                  onPress={() => respondRecommendation(rec.id, false)}
                >
                  <Text style={styles.recRejectText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.recAcceptBtn}
                  onPress={() => respondRecommendation(rec.id, true)}
                >
                  <Text style={styles.recAcceptText}>Accept +2.5kg</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Messages list */}
          {chatMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="sparkles-outline" size={32} color={AppColors.purple} />
              </View>
              <Text style={styles.emptyTitle}>Your AI Personal Trainer</Text>
              <Text style={styles.emptySub}>
                Ask anything about training splits, form cues, progressive overload, or
                nutrition tailored to your fitness targets.
              </Text>
            </View>
          ) : (
            chatMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id || idx}
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.userMsgWrapper : styles.aiMsgWrapper,
                  ]}
                >
                  {!isUser ? (
                    <View style={styles.aiMessageAvatar}>
                      <Ionicons name="sparkles" size={12} color={AppColors.purple} />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.aiText,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {isChatLoading ? (
            <View style={[styles.messageWrapper, styles.aiMsgWrapper]}>
              <View style={styles.aiMessageAvatar}>
                <Ionicons name="sparkles" size={12} color={AppColors.purple} />
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, { paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color={AppColors.purple} />
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Suggested Prompts Carousel */}
        <View style={styles.suggestedSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedScroll}
          >
            {suggestedPrompts.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestedPill}
                onPress={() => handleSend(p)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestedText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask your coach anything..."
            placeholderTextColor={AppColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && { backgroundColor: AppColors.surface },
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isChatLoading}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={inputText.trim() ? AppColors.black : AppColors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: AppColors.card,
    gap: 12,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${AppColors.purple}25`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  headerSub: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  chatScroll: {
    padding: 20,
    paddingBottom: 20,
  },
  recBanner: {
    backgroundColor: `${AppColors.purple}18`,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${AppColors.purple}44`,
    padding: 16,
    marginBottom: 16,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  recTag: {
    color: AppColors.purple,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  recText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  recActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  recRejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  recRejectText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  recAcceptBtn: {
    backgroundColor: AppColors.purple,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  recAcceptText: {
    color: AppColors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: `${AppColors.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptySub: {
    color: AppColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userMsgWrapper: {
    justifyContent: 'flex-end',
  },
  aiMsgWrapper: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  aiMessageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${AppColors.purple}25`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: AppColors.accent,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userText: {
    color: AppColors.black,
    fontWeight: '700',
  },
  aiText: {
    color: AppColors.white,
    fontWeight: '500',
  },
  suggestedSection: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  suggestedScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestedPill: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  suggestedText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: AppColors.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: AppColors.white,
    fontSize: 13,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AICoachScreen;
