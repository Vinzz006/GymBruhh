import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAI } from '../../context/AIContext';

interface ExerciseReplaceModalProps {
  visible: boolean;
  exerciseId: number | null;
  exerciseName: string;
  onDismiss: () => void;
  onSelectAlternative: (altName: string) => void;
}

export const ExerciseReplaceModal: React.FC<ExerciseReplaceModalProps> = ({
  visible,
  exerciseId,
  exerciseName,
  onDismiss,
  onSelectAlternative,
}) => {
  const { replaceExercise } = useAI();
  const [loading, setLoading] = useState(false);
  const [substitutions, setSubstitutions] = useState<any[]>([]);

  React.useEffect(() => {
    if (visible && exerciseId) {
      setLoading(true);
      replaceExercise(exerciseId)
        .then((res) => {
          setSubstitutions(res || []);
        })
        .finally(() => setLoading(false));
    } else {
      setSubstitutions([]);
    }
  }, [visible, exerciseId]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>AI Exercise Substitute 🔄</Text>
              <Text style={styles.sub}>Replacing: {exerciseName}</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={AppColors.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.purple} />
              <Text style={styles.loadingText}>Analyzing biomechanical biomechanics...</Text>
            </View>
          ) : substitutions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No direct substitutions found. Try standard dumbbell or bodyweight variants.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {substitutions.map((sub, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.item}
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelectAlternative(sub.name);
                    onDismiss();
                  }}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{sub.name}</Text>
                    <Text style={styles.itemReason}>
                      {sub.reason || `Target: ${sub.primary_muscle || 'same muscle group'}`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.accent} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: AppColors.border,
    padding: 24,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  sub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  loadingText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  list: {
    gap: 10,
    marginBottom: 20,
  },
  item: {
    backgroundColor: AppColors.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  itemReason: {
    color: AppColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});

export default ExerciseReplaceModal;
