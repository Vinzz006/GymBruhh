import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/constants/colors.dart';
import 'providers/auth_provider.dart';
import 'providers/workout_provider.dart';
import 'providers/nutrition_provider.dart';
import 'providers/progress_provider.dart';
import 'providers/ai_provider.dart';
import 'screens/auth/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GymBruhhApp());
}

class GymBruhhApp extends StatelessWidget {
  const GymBruhhApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WorkoutProvider()),
        ChangeNotifierProvider(create: (_) => NutritionProvider()),
        ChangeNotifierProvider(create: (_) => ProgressProvider()),
        ChangeNotifierProvider(create: (_) => AIProvider()),
      ],
      child: MaterialApp(
        title: 'GYMBruhh — AI Gym & Fitness Companion',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: AppColors.background,
          primaryColor: AppColors.accent,
          colorScheme: const ColorScheme.dark(
            primary: AppColors.accent,
            secondary: AppColors.cyan,
            surface: AppColors.card,
            background: AppColors.background,
          ),
          textTheme: GoogleFonts.plusJakartaSansTextTheme(
            ThemeData.dark().textTheme,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: AppColors.background,
            elevation: 0,
            iconTheme: IconThemeData(color: Colors.white),
            titleTextStyle: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
