import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useWorkout } from '../../context/WorkoutContext';
import { useAI } from '../../context/AIContext';
import AppButton from '../../components/common/AppButton';

export const WorkoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { activePlan, exercises, fetchActivePlan, fetchTodayWorkout, startSession } = useWorkout();
  const { generateWorkout, isGeneratingWorkout } = useAI();
  const [activeTab, setActiveTab] = useState<'routine' | 'library'>('routine');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);

  const muscles = [
    'all',
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'quads',
    'hamstrings',
    'abs',
  ];

  const filteredExercises = exercises.filter((e) => {
    const matchesMuscle =
      selectedMuscle === 'all' ||
      e.primaryMuscle?.toLowerCase().includes(selectedMuscle);
    const matchesSearch =
      !searchQuery.trim() ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.primaryMuscle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const handleGenerateAI = async () => {
    const plan = await generateWorkout(customNotes);
    if (plan) {
      await fetchActivePlan();
      await fetchTodayWorkout();
      setAiModalVisible(false);
      setCustomNotes('');
    }
  };

  const handleStartDay = async (focusArea: string, dayId: number) => {
    await startSession(focusArea, dayId);
    navigation.navigate('ActiveWorkout');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Screen Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Workout Hub 🏋️</Text>
        <TouchableOpacity
          style={styles.aiGenBtn}
          onPress={() => setAiModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color={AppColors.purple} />
          <Text style={styles.aiGenText}>AI Generator</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tab Switcher */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTab, activeTab === 'routine' && styles.subTabActive]}
          onPress={() => setActiveTab('routine')}
        >
          <Text
            style={[
              styles.subTabText,
              activeTab === 'routine' && styles.subTabTextActive,
            ]}
          >
            Active Routine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, activeTab === 'library' && styles.subTabActive]}
          onPress={() => setActiveTab('library')}
        >
          <Text
            style={[
              styles.subTabText,
              activeTab === 'library' && styles.subTabTextActive,
            ]}
          >
            Exercise Library
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'routine' ? (
          <View>
            {activePlan ? (
              <View>
                <View style={styles.planHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{activePlan.title}</Text>
                    <Text style={styles.planDesc}>
                      {activePlan.description || 'Weekly periodized split'}
                    </Text>
                  </View>
                  {activePlan.generatedByAi ? (
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>AI GENERATED</Text>
                    </View>
                  ) : null}
                </View>

                {/* Days */}
                {(activePlan.days || []).map((day: any) => (
                  <View key={day.id} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayName}>
                        {day.day_name?.toUpperCase() || day.dayName?.toUpperCase()} —{' '}
                        {day.focus_area || day.focusArea}
                      </Text>
                      <Text style={styles.dayCount}>
                        {(day.exercises || []).length} Exercises
                      </Text>
                    </View>

                    {/* Exercises List */}
                    <View style={styles.exerciseList}>
                      {(day.exercises || []).map((we: any, idx: number) => {
                        const exName = we.exercise?.name || `Exercise #${idx + 1}`;
                        const targetSets = we.target_sets || we.targetSets || 3;
                        const targetReps = we.target_reps || we.targetReps || '8-12';
                        return (
                          <View key={we.id || idx} style={styles.routineExerciseRow}>
                            <Text style={styles.routineExName}>{exName}</Text>
                            <Text style={styles.routineExSets}>
                              {targetSets} sets × {targetReps}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={styles.startDayBtn}
                      onPress={() =>
                        handleStartDay(
                          day.focus_area || day.focusArea || 'Workout',
                          day.id
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startDayBtnText}>START THIS SESSION</Text>
                      <Ionicons name="play" size={14} color={AppColors.accent} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="barbell-outline" size={48} color={AppColors.textMuted} />
                <Text style={styles.emptyTitle}>No Active Workout Plan</Text>
                <Text style={styles.emptySub}>
                  Use our Gemini AI Generator to create a customized periodized split in seconds.
                </Text>
                <AppButton
                  text="GENERATE AI WORKOUT"
                  onPress={() => setAiModalVisible(true)}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </View>
        ) : (
          <View>
            {/* Search Input */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={AppColors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercise by name or muscle..."
                placeholderTextColor={AppColors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={AppColors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Muscle category filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.muscleScroll}
            >
              {muscles.map((muscle) => {
                const isSelected = selectedMuscle === muscle;
                return (
                  <TouchableOpacity
                    key={muscle}
                    style={[styles.muscleChip, isSelected && styles.muscleChipActive]}
                    onPress={() => setSelectedMuscle(muscle)}
                  >
                    <Text
                      style={[
                        styles.muscleChipText,
                        isSelected && styles.muscleChipTextActive,
                      ]}
                    >
                      {muscle.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Exercises Cards */}
            {filteredExercises.map((ex) => {
              const isExpanded = expandedExerciseId === ex.id;
              return (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.exCard}
                  onPress={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.exCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <View style={styles.exTags}>
                        <View style={styles.exTag}>
                          <Text style={styles.exTagText}>{ex.primaryMuscle?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.exTag, { backgroundColor: `${AppColors.cyan}1A` }]}>
                          <Text style={[styles.exTagText, { color: AppColors.cyan }]}>
                            {ex.equipment?.toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.exTag, { backgroundColor: `${AppColors.orange}1A` }]}>
                          <Text style={[styles.exTagText, { color: AppColors.orange }]}>
                            {ex.difficulty?.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={AppColors.textMuted}
                    />
                  </View>

                  {isExpanded ? (
                    <View style={styles.exExpanded}>
                      <Text style={styles.exInstructionLabel}>EXECUTION FORM:</Text>
                      <Text style={styles.exInstructionText}>{ex.instructions}</Text>
                      {ex.safetyNotes ? (
                        <View style={styles.safetyBox}>
                          <Ionicons name="warning-outline" size={16} color={AppColors.red} />
                          <Text style={styles.safetyText}>{ex.safetyNotes}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* AI Workout Generator Modal */}
      <Modal visible={aiModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>AI Workout Generator 🤖</Text>
                <Text style={styles.modalSub}>
                  Gemini constructs a tailored split based on your profile and volume targets.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Optional custom notes (e.g. emphasize upper chest and arms, 4 days/week)..."
              placeholderTextColor={AppColors.textMuted}
              multiline
              numberOfLines={3}
              value={customNotes}
              onChangeText={setCustomNotes}
            />

            <AppButton
              text="GENERATE AI WORKOUT SPLIT"
              onPress={handleGenerateAI}
              isLoading={isGeneratingWorkout}
              variant="purple"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  aiGenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.purple}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${AppColors.purple}44`,
    gap: 6,
  },
  aiGenText: {
    color: AppColors.purple,
    fontSize: 12,
    fontWeight: '800',
  },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  subTab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.accent,
  },
  subTabText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  subTabTextActive: {
    color: AppColors.accent,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  planDesc: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  aiBadge: {
    backgroundColor: `${AppColors.purple}22`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${AppColors.purple}44`,
  },
  aiBadgeText: {
    color: AppColors.purple,
    fontSize: 10,
    fontWeight: '800',
  },
  dayCard: {
    backgroundColor: AppColors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  dayCount: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 10,
    marginBottom: 14,
  },
  routineExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  routineExName: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  routineExSets: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  startDayBtn: {
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 8,
  },
  startDayBtnText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: AppColors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  muscleScroll: {
    gap: 8,
    marginBottom: 16,
  },
  muscleChip: {
    backgroundColor: AppColors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  muscleChipActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  muscleChipText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  muscleChipTextActive: {
    color: AppColors.black,
    fontWeight: '800',
  },
  exCard: {
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 10,
  },
  exCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exName: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  exTags: {
    flexDirection: 'row',
    gap: 6,
  },
  exTag: {
    backgroundColor: `${AppColors.accent}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  exTagText: {
    color: AppColors.accent,
    fontSize: 9,
    fontWeight: '800',
  },
  exExpanded: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  exInstructionLabel: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  exInstructionText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.red}1A`,
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    gap: 8,
  },
  safetyText: {
    color: AppColors.red,
    fontSize: 11,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: AppColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  modalSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  modalInput: {
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 14,
    color: AppColors.white,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default WorkoutScreen;
