import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useNutrition } from '../../context/NutritionContext';
import { useProgress } from '../../context/ProgressContext';
import { useAI } from '../../context/AIContext';
import MacroRingCard from '../../components/common/MacroRingCard';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, profile, targets, refreshUserData } = useAuth();
  const { todayWorkout, fetchTodayWorkout, fetchActivePlan, startSession } = useWorkout();
  const { todayNutrition, fetchTodayNutrition } = useNutrition();
  const { dashboard, fetchDashboard } = useProgress();
  const { recommendations, lastProgressReview, fetchRecommendations } = useAI();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshUserData(),
      fetchTodayWorkout(),
      fetchActivePlan(),
      fetchTodayNutrition(),
      fetchDashboard(),
      fetchRecommendations(),
    ]);
    setRefreshing(false);
  };

  const userName = user?.fullName?.split(' ')[0] || 'Athlete';
  const workoutsCount = dashboard?.totalWorkoutsCompleted || 0;
  const streakText =
    workoutsCount > 0
      ? `${workoutsCount} Workouts Logged 🔥 Active Consistency`
      : 'Ready for Day 1 🚀 Start your fitness journey';

  // Dynamic AI Insight
  let aiInsight =
    'Consistent progressive overload and hitting your daily protein target are key to achieving your fitness goals.';
  if (recommendations.length > 0) {
    aiInsight = `${recommendations[0].title}: ${recommendations[0].recommendationText}`;
  } else if (lastProgressReview?.summary) {
    aiInsight = String(lastProgressReview.summary);
  } else if (targets) {
    const goalName = (profile?.primaryGoal || 'muscle gain').replace('_', ' ');
    aiInsight = `Your daily target is ${Math.round(targets.targetCalories)} kcal with ${Math.round(
      targets.targetProteinGrams
    )}g protein for ${goalName}.`;
  }

  const hasTodayWorkout = todayWorkout?.has_workout === true;
  const dayFocus = todayWorkout?.day?.focus_area || 'Scheduled Training';
  const dayDuration = todayWorkout?.day?.estimated_minutes || 60;
  const dayDesc =
    todayWorkout?.day?.description ||
    'Follow your periodized split and track every set with precise weight & reps.';

  const handleStartWorkout = async () => {
    const dayId = todayWorkout?.day?.id;
    await startSession(dayFocus, dayId);
    navigation.navigate('ActiveWorkout');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.accent}
            colors={[AppColors.accent]}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>Good Day, {userName} 👋</Text>
            <Text style={styles.greetingSub}>Ready to crush today's training?</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={18} color={AppColors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Streak & Consistency Pill */}
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={18} color={AppColors.orange} />
          <Text style={styles.streakText}>{streakText}</Text>
        </View>

        {/* Macro & Calorie Ring Card */}
        <View style={styles.section}>
          <MacroRingCard
            targetCalories={targets?.targetCalories || 2400}
            consumedCalories={todayNutrition?.totalCalories || 0}
            proteinG={todayNutrition?.totalProteinG || 0}
            targetProteinG={targets?.targetProteinGrams || 160}
            carbsG={todayNutrition?.totalCarbsG || 0}
            targetCarbsG={targets?.targetCarbsGrams || 220}
            fatG={todayNutrition?.totalFatG || 0}
            targetFatG={targets?.targetFatGrams || 70}
          />
        </View>

        {/* Today's Training Card */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TODAY'S TRAINING</Text>
          <View style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>
                  {hasTodayWorkout ? dayFocus.toUpperCase() : 'REST / RECOVERY'}
                </Text>
              </View>
              <Text style={styles.durationText}>{dayDuration} MIN</Text>
            </View>

            <Text style={styles.workoutTitle}>{dayFocus}</Text>
            <Text style={styles.workoutDesc}>{dayDesc}</Text>

            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStartWorkout}
              activeOpacity={0.8}
            >
              <Text style={styles.startBtnText}>START WORKOUT</Text>
              <Ionicons name="arrow-forward" size={16} color={AppColors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gemini AI Coach Insight Card */}
        <View style={styles.section}>
          <View style={styles.aiCard}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={18} color={AppColors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiCardLabel}>GEMINI AI COACH INSIGHT</Text>
              <Text style={styles.aiCardText}>{aiInsight}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  greetingSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.accent}14`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${AppColors.accent}33`,
    marginBottom: 20,
    gap: 8,
  },
  streakText: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  workoutCard: {
    backgroundColor: AppColors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: `${AppColors.accent}1A`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  durationText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  workoutTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  workoutDesc: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    color: AppColors.black,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  aiCard: {
    flexDirection: 'row',
    backgroundColor: `${AppColors.purple}14`,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: `${AppColors.purple}35`,
    padding: 18,
    gap: 14,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${AppColors.purple}25`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiCardLabel: {
    color: AppColors.purple,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  aiCardText: {
    color: AppColors.white,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default HomeScreen;
