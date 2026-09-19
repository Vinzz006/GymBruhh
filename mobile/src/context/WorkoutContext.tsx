import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { WorkoutPlan, WorkoutSession, Exercise } from '../types';

interface WorkoutContextType {
  activePlan: WorkoutPlan | null;
  todayWorkout: any | null;
  activeSession: WorkoutSession | null;
  exercises: Exercise[];
  isLoading: boolean;
  elapsedSeconds: number;
  restTimerSeconds: number;
  isRestTimerActive: boolean;
  lastSummary: any | null;
  loadInitialData: () => Promise<void>;
  fetchActivePlan: () => Promise<void>;
  fetchTodayWorkout: () => Promise<void>;
  fetchActiveSession: () => Promise<void>;
  fetchExercises: (search?: string, muscle?: string) => Promise<void>;
  startSession: (title: string, workoutDayId?: number) => Promise<void>;
  triggerRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  adjustRestTimer: (delta: number) => void;
  logSet: (
    exerciseId: number,
    setNumber: number,
    weightKg: number,
    reps: number,
    rpe?: number
  ) => Promise<{ success: boolean; isPr: boolean }>;
  completeSession: (userFeeling?: string, notes?: string) => Promise<any>;
  clearLastSummary: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<any | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [lastSummary, setLastSummary] = useState<any | null>(null);

  const sessionTimerRef = useRef<any>(null);
  const restTimerRef = useRef<any>(null);

  const fetchActivePlan = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.activePlan);
      setActivePlan(data || null);
    } catch (e) {
      console.warn('Could not fetch active plan:', e);
    }
  };

  const fetchTodayWorkout = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.todayWorkout);
      setTodayWorkout(data || null);
    } catch (e) {
      console.warn('Could not fetch today workout:', e);
    }
  };

  const fetchExercises = async (search?: string, muscle?: string) => {
    try {
      let query = '';
      if (search && search.trim().length > 0) query += `?search=${encodeURIComponent(search.trim())}`;
      if (muscle && muscle !== 'all') {
        query += (query.length > 0 ? '&' : '?') + `muscle=${encodeURIComponent(muscle)}`;
      }
      const data = await api.get(`${API_ENDPOINTS.exercises}${query}`);
      if (Array.isArray(data)) {
        setExercises(data);
      }
    } catch (e) {
      console.warn('Could not fetch exercises:', e);
    }
  };

  const startSessionTimer = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    setElapsedSeconds(0);
  };

  const fetchActiveSession = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.activeSession);
      if (data && data.id) {
        setActiveSession(data);
        if (data.started_at) {
          const startMs = new Date(data.started_at).getTime();
          const nowMs = Date.now();
          const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
          setElapsedSeconds(diffSec);
        }
        startSessionTimer();
      } else {
        setActiveSession(null);
        stopSessionTimer();
      }
    } catch (e) {
      console.warn('Could not fetch active session:', e);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchActivePlan(),
        fetchTodayWorkout(),
        fetchActiveSession(),
        fetchExercises(),
      ]);
    } catch (e) {
      console.warn('Workout loadInitialData error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const startSession = async (title: string, workoutDayId?: number) => {
    setIsLoading(true);
    try {
      const data = await api.post(API_ENDPOINTS.startSession, {
        title,
        workout_day_id: workoutDayId,
      });
      setActiveSession(data);
      setElapsedSeconds(0);
      startSessionTimer();
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRestTimer = (seconds: number = 90) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    restTimerRef.current = setInterval(() => {
      setRestTimerSeconds((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          setIsRestTimerActive(false);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    setIsRestTimerActive(false);
    setRestTimerSeconds(0);
  };

  const adjustRestTimer = (delta: number) => {
    setRestTimerSeconds((prev) => Math.max(0, Math.min(600, prev + delta)));
  };

  const logSet = async (
    exerciseId: number,
    setNumber: number,
    weightKg: number,
    reps: number,
    rpe: number = 8.0
  ): Promise<{ success: boolean; isPr: boolean }> => {
    if (!activeSession) return { success: false, isPr: false };
    try {
      const endpoint = API_ENDPOINTS.sessionSets(activeSession.id);
      const res = await api.post(endpoint, {
        exercise_id: exerciseId,
        set_number: setNumber,
        weight_kg: weightKg,
        reps,
        rpe,
        is_completed: true,
      });

      const isPr = res?.is_pr === true;
      if (isPr) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (_) {}
      } else {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
      }

      triggerRestTimer(90);
      await fetchActiveSession();
      return { success: true, isPr };
    } catch (e) {
      console.warn('Error logging set:', e);
      return { success: false, isPr: false };
    }
  };

  const completeSession = async (userFeeling: string = 'good', notes?: string) => {
    if (!activeSession) return null;
    try {
      const endpoint = API_ENDPOINTS.completeSession(activeSession.id);
      const res = await api.post(endpoint, {
        duration_seconds: elapsedSeconds,
        user_feeling: userFeeling,
        notes: notes || '',
      });
      setLastSummary(res);
      setActiveSession(null);
      stopSessionTimer();
      stopRestTimer();
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      return res;
    } catch (e) {
      console.warn('Error completing workout:', e);
      return null;
    }
  };

  const clearLastSummary = () => {
    setLastSummary(null);
  };

  return (
    <WorkoutContext.Provider
      value={{
        activePlan,
        todayWorkout,
        activeSession,
        exercises,
        isLoading,
        elapsedSeconds,
        restTimerSeconds,
        isRestTimerActive,
        lastSummary,
        loadInitialData,
        fetchActivePlan,
        fetchTodayWorkout,
        fetchActiveSession,
        fetchExercises,
        startSession,
        triggerRestTimer,
        stopRestTimer,
        adjustRestTimer,
        logSet,
        completeSession,
        clearLastSummary,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export default WorkoutContext;
