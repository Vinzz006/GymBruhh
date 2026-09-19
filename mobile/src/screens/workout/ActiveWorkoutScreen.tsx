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
import RestTimerModal from '../../components/workout/RestTimerModal';
import WorkoutSummaryModal from '../../components/workout/WorkoutSummaryModal';
import ExerciseReplaceModal from '../../components/workout/ExerciseReplaceModal';

export const ActiveWorkoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    activeSession,
    elapsedSeconds,
    restTimerSeconds,
    isRestTimerActive,
    stopRestTimer,
    adjustRestTimer,
    logSet,
    completeSession,
    lastSummary,
    clearLastSummary,
    fetchActiveSession,
  } = useWorkout();

  // Set inputs state keyed by `${exerciseId}_${setNumber}`
  const [inputs, setInputs] = useState<
    Record<string, { weight: string; reps: string; rpe: string }>
  >({});
  const [prBanner, setPrBanner] = useState<string | null>(null);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [feeling, setFeeling] = useState<'great' | 'good' | 'tired'>('good');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // Substitution state
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [subTargetEx, setSubTargetEx] = useState<{ id: number; name: string } | null>(null);

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getInputValue = (exId: number, setNum: number) => {
    const key = `${exId}_${setNum}`;
    return inputs[key] || { weight: '60', reps: '10', rpe: '8' };
  };

  const updateInput = (
    exId: number,
    setNum: number,
    field: 'weight' | 'reps' | 'rpe',
    val: string
  ) => {
    const key = `${exId}_${setNum}`;
    setInputs((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { weight: '60', reps: '10', rpe: '8' }),
        [field]: val,
      },
    }));
  };

  const handleLogSet = async (exId: number, setNum: number) => {
    const current = getInputValue(exId, setNum);
    const w = parseFloat(current.weight) || 60.0;
    const r = parseInt(current.reps, 10) || 10;
    const rpe = parseFloat(current.rpe) || 8.0;

    const res = await logSet(exId, setNum, w, r, rpe);
    if (res.isPr) {
      setPrBanner('🎉 NEW PERSONAL RECORD DETECTED! GOLD TROPHY EARNED 🏆');
      setTimeout(() => setPrBanner(null), 4000);
    }
  };

  const handleCompleteWorkout = async () => {
    setIsFinishing(true);
    try {
      const res = await completeSession(feeling, sessionNotes);
      setFinishModalVisible(false);
      if (!res) {
        navigation.goBack();
      }
    } finally {
      setIsFinishing(false);
    }
  };

  // Extract exercises from active session sets or default sets
  // Group sets by exercise
  const groupedSets: Record<number, any[]> = {};
  if (activeSession?.sets) {
    activeSession.sets.forEach((s) => {
      if (!groupedSets[s.exerciseId]) groupedSets[s.exerciseId] = [];
      groupedSets[s.exerciseId].push(s);
    });
  }

  // If no sets are logged yet, provide a mock list of exercises for the day
  const exerciseIds = Object.keys(groupedSets).map(Number);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Active Workout Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-down" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <View style={styles.timerBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.timerText}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
        <TouchableOpacity
          style={styles.finishTopBtn}
          onPress={() => setFinishModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.finishTopText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Workout Info */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionStatus}>IN-PROGRESS SESSION</Text>
          <Text style={styles.sessionTitle}>
            {activeSession?.title || "Today's Training"}
          </Text>
          <Text style={styles.sessionSub}>
            Record your logged weight, reps, and perceived exertion (RPE).
          </Text>
        </View>

        {/* PR Toast Banner */}
        {prBanner ? (
          <View style={styles.prBanner}>
            <Ionicons name="trophy" size={20} color={AppColors.gold} />
            <Text style={styles.prBannerText}>{prBanner}</Text>
          </View>
        ) : null}

        {/* Exercise Sets Tracking */}
        {exerciseIds.length > 0 ? (
          exerciseIds.map((exId) => {
            const sets = groupedSets[exId];
            return (
              <View key={exId} style={styles.exerciseCard}>
                <View style={styles.exHeader}>
                  <Text style={styles.exName}>Exercise #{exId}</Text>
                  <TouchableOpacity
                    style={styles.substituteBtn}
                    onPress={() => {
                      setSubTargetEx({ id: exId, name: `Exercise #${exId}` });
                      setSubModalVisible(true);
                    }}
                  >
                    <Ionicons name="shuffle" size={14} color={AppColors.purple} />
                    <Text style={styles.substituteText}>Substitute</Text>
                  </TouchableOpacity>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 0.8 }]}>SET</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>WEIGHT (KG)</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>REPS</Text>
                  <Text style={[styles.th, { flex: 1 }]}>RPE</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>LOG</Text>
                </View>

                {/* Existing logged sets */}
                {sets.map((s, idx) => (
                  <View key={s.id || idx} style={styles.loggedRow}>
                    <Text style={[styles.td, { flex: 0.8, color: AppColors.accent, fontWeight: '800' }]}>
                      {s.setNumber}
                    </Text>
                    <Text style={[styles.td, { flex: 1.5 }]}>{s.weightKg} kg</Text>
                    <Text style={[styles.td, { flex: 1.2 }]}>{s.reps} reps</Text>
                    <Text style={[styles.td, { flex: 1 }]}>{s.rpe || 8.0}</Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={20} color={AppColors.accent} />
                    </View>
                  </View>
                ))}

                {/* Next Set Input Form */}
                <View style={styles.inputRow}>
                  <Text style={[styles.td, { flex: 0.8, color: AppColors.textMuted }]}>
                    {sets.length + 1}
                  </Text>
                  <TextInput
                    style={[styles.numInput, { flex: 1.5 }]}
                    keyboardType="numeric"
                    value={getInputValue(exId, sets.length + 1).weight}
                    onChangeText={(val) =>
                      updateInput(exId, sets.length + 1, 'weight', val)
                    }
                  />
                  <TextInput
                    style={[styles.numInput, { flex: 1.2 }]}
                    keyboardType="numeric"
                    value={getInputValue(exId, sets.length + 1).reps}
                    onChangeText={(val) =>
                      updateInput(exId, sets.length + 1, 'reps', val)
                    }
                  />
                  <TextInput
                    style={[styles.numInput, { flex: 1 }]}
                    keyboardType="numeric"
                    value={getInputValue(exId, sets.length + 1).rpe}
                    onChangeText={(val) =>
                      updateInput(exId, sets.length + 1, 'rpe', val)
                    }
                  />
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => handleLogSet(exId, sets.length + 1)}
                  >
                    <Ionicons name="checkmark" size={18} color={AppColors.black} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          // Default initial set logger for new session
          <View style={styles.exerciseCard}>
            <View style={styles.exHeader}>
              <Text style={styles.exName}>Barbell Bench Press</Text>
              <TouchableOpacity
                style={styles.substituteBtn}
                onPress={() => {
                  setSubTargetEx({ id: 1, name: 'Barbell Bench Press' });
                  setSubModalVisible(true);
                }}
              >
                <Ionicons name="shuffle" size={14} color={AppColors.purple} />
                <Text style={styles.substituteText}>Substitute</Text>
              </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 0.8 }]}>SET</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>WEIGHT (KG)</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>REPS</Text>
              <Text style={[styles.th, { flex: 1 }]}>RPE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>LOG</Text>
            </View>

            {[1, 2, 3].map((setNum) => (
              <View key={setNum} style={styles.inputRow}>
                <Text style={[styles.td, { flex: 0.8, color: AppColors.accent, fontWeight: '800' }]}>
                  {setNum}
                </Text>
                <TextInput
                  style={[styles.numInput, { flex: 1.5 }]}
                  keyboardType="numeric"
                  value={getInputValue(1, setNum).weight}
                  onChangeText={(val) => updateInput(1, setNum, 'weight', val)}
                />
                <TextInput
                  style={[styles.numInput, { flex: 1.2 }]}
                  keyboardType="numeric"
                  value={getInputValue(1, setNum).reps}
                  onChangeText={(val) => updateInput(1, setNum, 'reps', val)}
                />
                <TextInput
                  style={[styles.numInput, { flex: 1 }]}
                  keyboardType="numeric"
                  value={getInputValue(1, setNum).rpe}
                  onChangeText={(val) => updateInput(1, setNum, 'rpe', val)}
                />
                <TouchableOpacity
                  style={styles.checkBtn}
                  onPress={() => handleLogSet(1, setNum)}
                >
                  <Ionicons name="checkmark" size={18} color={AppColors.black} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.bottomFinishBtn}
          onPress={() => setFinishModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.bottomFinishText}>FINISH & LOG WORKOUT</Text>
          <Ionicons name="checkmark-done" size={20} color={AppColors.black} />
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Auto Rest Timer */}
      <RestTimerModal
        seconds={restTimerSeconds}
        isActive={isRestTimerActive}
        onSkip={stopRestTimer}
        onAdjust={adjustRestTimer}
      />

      {/* Exercise Substitute Modal */}
      <ExerciseReplaceModal
        visible={subModalVisible}
        exerciseId={subTargetEx?.id || null}
        exerciseName={subTargetEx?.name || ''}
        onDismiss={() => setSubModalVisible(false)}
        onSelectAlternative={(altName) => {
          console.log('Selected alternative:', altName);
        }}
      />

      {/* Finish Workout Modal */}
      <Modal visible={finishModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Complete Workout 🎉</Text>
            <Text style={styles.modalSub}>How did today's training session feel?</Text>

            <View style={styles.feelingRow}>
              {[
                { id: 'great', label: '🔥 Great' },
                { id: 'good', label: '👍 Good' },
                { id: 'tired', label: '😴 Tired' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.feelingChip,
                    feeling === item.id && styles.feelingChipActive,
                  ]}
                  onPress={() => setFeeling(item.id as any)}
                >
                  <Text
                    style={[
                      styles.feelingText,
                      feeling === item.id && styles.feelingTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Optional notes (e.g. hit new PR on top set)..."
              placeholderTextColor={AppColors.textMuted}
              multiline
              numberOfLines={2}
              value={sessionNotes}
              onChangeText={setSessionNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.keepGoingBtn}
                onPress={() => setFinishModalVisible(false)}
              >
                <Text style={styles.keepGoingText}>Keep Going</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmFinishBtn}
                onPress={handleCompleteWorkout}
              >
                <Text style={styles.confirmFinishText}>Finish & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Completion Summary Modal */}
      <WorkoutSummaryModal
        visible={!!lastSummary}
        summary={lastSummary}
        onDismiss={() => {
          clearLastSummary();
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backBtn: {
    padding: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accent,
  },
  timerText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  finishTopBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  finishTopText: {
    color: AppColors.black,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  sessionCard: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  sessionStatus: {
    color: AppColors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sessionTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  sessionSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.gold}20`,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.gold,
    marginBottom: 16,
    gap: 10,
  },
  prBannerText: {
    color: AppColors.gold,
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  substituteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.purple}1A`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  substituteText: {
    color: AppColors.purple,
    fontSize: 11,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    marginBottom: 8,
  },
  th: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.border}66`,
  },
  td: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  numInput: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
  },
  checkBtn: {
    flex: 1,
    height: 34,
    backgroundColor: AppColors.accent,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomFinishBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  bottomFinishText: {
    color: AppColors.black,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: AppColors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 24,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalSub: {
    color: AppColors.textSecondary,
    fontSize: 13,
    marginBottom: 18,
  },
  feelingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  feelingChip: {
    flex: 1,
    backgroundColor: AppColors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  feelingChipActive: {
    borderColor: AppColors.accent,
    backgroundColor: `${AppColors.accent}1A`,
  },
  feelingText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  feelingTextActive: {
    color: AppColors.accent,
    fontWeight: '800',
  },
  notesInput: {
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 12,
    color: AppColors.white,
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keepGoingBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  keepGoingText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmFinishBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmFinishText: {
    color: AppColors.black,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ActiveWorkoutScreen;
