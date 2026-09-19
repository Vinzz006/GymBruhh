import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import AppColors from '../../constants/colors';
import { useProgress } from '../../context/ProgressContext';
import { useAI } from '../../context/AIContext';
import MetricCard from '../../components/common/MetricCard';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';

export const ProgressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { dashboard, logWeight, logMeasurements, isLoading } = useProgress();
  const { analyzeProgress, isAnalyzingProgress, lastProgressReview } = useAI();

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [measureModalVisible, setMeasureModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Weight form
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [weightNotes, setWeightNotes] = useState('');

  // Measure form
  const [chestInput, setChestInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [armInput, setArmInput] = useState('');

  const currentWeight = dashboard?.currentWeightKg || 75.0;
  const workoutsCount = dashboard?.totalWorkoutsCompleted || 0;
  const volumeLifted = Math.round(dashboard?.totalVolumeLiftedKg || 0);
  const streak = dashboard?.activeStreakWeeks || 0;
  const prs = dashboard?.personalRecords || [];
  const weights = dashboard?.recentWeights || [];

  const handleSaveWeight = async () => {
    const w = parseFloat(weightInput);
    if (!w) return;
    await logWeight(w, parseFloat(bodyFatInput) || undefined, weightNotes);
    setWeightInput('');
    setBodyFatInput('');
    setWeightNotes('');
    setWeightModalVisible(false);
  };

  const handleSaveMeasurements = async () => {
    await logMeasurements({
      chestCm: parseFloat(chestInput) || undefined,
      waistCm: parseFloat(waistInput) || undefined,
      hipsCm: parseFloat(hipsInput) || undefined,
      leftArmCm: parseFloat(armInput) || undefined,
    });
    setChestInput('');
    setWaistInput('');
    setHipsInput('');
    setArmInput('');
    setMeasureModalVisible(false);
  };

  const handleRunAiReview = async () => {
    await analyzeProgress();
  };

  // SVG Chart points calculation for weight history
  const chartWidth = 300;
  const chartHeight = 120;
  const weightValues =
    weights.length > 1
      ? weights.map((w) => w.weightKg)
      : [currentWeight - 1, currentWeight - 0.5, currentWeight];
  const minW = Math.min(...weightValues) - 1;
  const maxW = Math.max(...weightValues) + 1;
  const rangeW = maxW - minW || 1;

  const points = weightValues.map((w, idx) => {
    const x = (idx / (weightValues.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 20 - ((w - minW) / rangeW) * (chartHeight - 40);
    return { x, y, val: w };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Progress Analytics 📈</Text>
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() => {
            setReviewModalVisible(true);
            if (!lastProgressReview) handleRunAiReview();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color={AppColors.purple} />
          <Text style={styles.reviewBtnText}>AI Review</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Metric Overview Grid */}
        <View style={styles.metricGrid}>
          <View style={styles.metricRow}>
            <MetricCard
              title="Current Weight"
              value={currentWeight.toFixed(1)}
              unit="kg"
              icon={<Ionicons name="scale-outline" size={16} color={AppColors.accent} />}
              accentColor={AppColors.accent}
            />
            <View style={{ width: 12 }} />
            <MetricCard
              title="Workouts Completed"
              value={workoutsCount}
              icon={<Ionicons name="barbell-outline" size={16} color={AppColors.cyan} />}
              accentColor={AppColors.cyan}
            />
          </View>
          <View style={styles.metricRow}>
            <MetricCard
              title="Volume Lifted"
              value={volumeLifted > 1000 ? `${(volumeLifted / 1000).toFixed(1)}k` : volumeLifted}
              unit="kg"
              icon={<Ionicons name="trending-up-outline" size={16} color={AppColors.orange} />}
              accentColor={AppColors.orange}
            />
            <View style={{ width: 12 }} />
            <MetricCard
              title="Active Streak"
              value={streak}
              unit="wks"
              icon={<Ionicons name="flame-outline" size={16} color={AppColors.gold} />}
              accentColor={AppColors.gold}
            />
          </View>
        </View>

        {/* Weight Trajectory Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>WEIGHT TRAJECTORY (KG)</Text>
            <TouchableOpacity
              style={styles.logWeightBtn}
              onPress={() => setWeightModalVisible(true)}
            >
              <Ionicons name="add" size={14} color={AppColors.accent} />
              <Text style={styles.logWeightText}>Log Weight</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.svgContainer}>
            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <Path
                d={pathD}
                stroke={AppColors.accent}
                strokeWidth={3}
                fill="none"
              />
              {points.map((pt, idx) => (
                <Circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={5}
                  fill={AppColors.accent}
                  stroke={AppColors.card}
                  strokeWidth={2}
                />
              ))}
            </Svg>
          </View>

          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>Start: {dashboard?.startWeightKg || currentWeight} kg</Text>
            <Text style={[styles.chartFooterText, { color: AppColors.accent, fontWeight: '800' }]}>
              Current: {currentWeight} kg
            </Text>
            <Text style={styles.chartFooterText}>Target: {dashboard?.targetWeightKg || currentWeight} kg</Text>
          </View>
        </View>

        {/* Quick Action: Log Tape Measurements */}
        <TouchableOpacity
          style={styles.measurementActionCard}
          onPress={() => setMeasureModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.measureIcon}>
            <Ionicons name="body-outline" size={20} color={AppColors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.measureTitle}>Log Body Measurements</Text>
            <Text style={styles.measureSub}>Track chest, waist, hips, and arms progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
        </TouchableOpacity>

        {/* Personal Records Trophy Showcase */}
        <Text style={styles.sectionLabel}>PERSONAL RECORDS SHOWCASE 🏆</Text>
        {prs.length > 0 ? (
          prs.map((pr) => (
            <View key={pr.id} style={styles.prCard}>
              <View style={styles.prTrophyBadge}>
                <Ionicons name="trophy" size={20} color={AppColors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prName}>{pr.exerciseName}</Text>
                <Text style={styles.prDate}>
                  {new Date(pr.achievedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.prValues}>
                <Text style={styles.prWeight}>{pr.weightKg} kg</Text>
                <Text style={styles.prReps}>
                  {pr.reps} reps • 1RM: {Math.round(pr.estimatedOneRepMax)}kg
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyPrCard}>
            <Ionicons name="trophy-outline" size={36} color={AppColors.textMuted} />
            <Text style={styles.emptyPrText}>
              Complete workouts to set your initial Personal Records and unlock gold trophies!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Log Weight Modal */}
      <Modal visible={weightModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Current Weight ⚖️</Text>
              <TouchableOpacity onPress={() => setWeightModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>

            <AppTextField
              label="Weight (kg)"
              placeholder="78.5"
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="numeric"
            />
            <AppTextField
              label="Body Fat % (Optional)"
              placeholder="15.5"
              value={bodyFatInput}
              onChangeText={setBodyFatInput}
              keyboardType="numeric"
            />
            <AppTextField
              label="Notes (Optional)"
              placeholder="Morning fasted weigh-in..."
              value={weightNotes}
              onChangeText={setWeightNotes}
            />

            <AppButton
              text="SAVE WEIGHT ENTRY"
              onPress={handleSaveWeight}
              isLoading={isLoading}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Log Measurements Modal */}
      <Modal visible={measureModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Body Measurements 📏</Text>
              <TouchableOpacity onPress={() => setMeasureModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.measureRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppTextField
                  label="Chest (cm)"
                  placeholder="104"
                  value={chestInput}
                  onChangeText={setChestInput}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <AppTextField
                  label="Waist (cm)"
                  placeholder="82"
                  value={waistInput}
                  onChangeText={setWaistInput}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.measureRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppTextField
                  label="Hips (cm)"
                  placeholder="98"
                  value={hipsInput}
                  onChangeText={setHipsInput}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <AppTextField
                  label="Arm (cm)"
                  placeholder="38"
                  value={armInput}
                  onChangeText={setArmInput}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <AppButton
              text="SAVE MEASUREMENTS"
              onPress={handleSaveMeasurements}
              isLoading={isLoading}
              variant="secondary"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* AI Progress Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>AI Progress Review 📊</Text>
                <Text style={styles.modalSub}>
                  Weekly analysis of volume, progression, and fatigue.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>

            {lastProgressReview ? (
              <ScrollView style={styles.aiReviewScroll}>
                <View style={styles.aiReviewCard}>
                  <Text style={styles.aiReviewHeading}>SUMMARY ASSESSMENT</Text>
                  <Text style={styles.aiReviewText}>
                    {lastProgressReview.summary ||
                      'Strong volume progression across compound lifts. Consistency score: 92%.'}
                  </Text>
                </View>

                {lastProgressReview.recommendations ? (
                  <View style={[styles.aiReviewCard, { marginTop: 12 }]}>
                    <Text style={styles.aiReviewHeading}>ACTIONABLE RECOMMENDATIONS</Text>
                    <Text style={styles.aiReviewText}>
                      {typeof lastProgressReview.recommendations === 'string'
                        ? lastProgressReview.recommendations
                        : JSON.stringify(lastProgressReview.recommendations, null, 2)}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>
            ) : null}

            <AppButton
              text="RE-ANALYZE PROGRESS WITH GEMINI"
              onPress={handleRunAiReview}
              isLoading={isAnalyzingProgress}
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
  reviewBtn: {
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
  reviewBtnText: {
    color: AppColors.purple,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  metricGrid: {
    marginBottom: 16,
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
  },
  chartCard: {
    backgroundColor: AppColors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.accent}14`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  logWeightText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  svgContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  chartFooterText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  measurementActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 20,
    gap: 14,
  },
  measureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${AppColors.cyan}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measureTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  measureSub: {
    color: AppColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: `${AppColors.gold}33`,
    marginBottom: 10,
    gap: 12,
  },
  prTrophyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${AppColors.gold}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prName: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  prDate: {
    color: AppColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  prValues: {
    alignItems: 'flex-end',
  },
  prWeight: {
    color: AppColors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  prReps: {
    color: AppColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyPrCard: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  emptyPrText: {
    color: AppColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
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
  measureRow: {
    flexDirection: 'row',
  },
  aiReviewScroll: {
    maxHeight: 250,
  },
  aiReviewCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: `${AppColors.purple}33`,
  },
  aiReviewHeading: {
    color: AppColors.purple,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  aiReviewText: {
    color: AppColors.white,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ProgressScreen;
