import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/widgets/common/app_button.dart';
import '../lib/widgets/common/app_text_field.dart';
import '../lib/widgets/common/macro_ring_card.dart';
import '../lib/widgets/common/metric_card.dart';

void main() {
  group('Flutter UI Custom Widgets Tests', () {
    testWidgets('AppButton renders label and reacts to tap', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              text: 'START WORKOUT',
              onPressed: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('START WORKOUT'), findsOneWidget);

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(tapped, isTrue);
    });

    testWidgets('AppTextField renders label and hint text', (WidgetTester tester) async {
      final controller = TextEditingController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppTextField(
              label: 'Email Address',
              hintText: 'user@example.com',
              controller: controller,
            ),
          ),
        ),
      );

      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('user@example.com'), findsOneWidget);

      await tester.enterText(find.byType(TextFormField), 'athlete@gym.com');
      expect(controller.text, equals('athlete@gym.com'));
    });

    testWidgets('MacroRingCard displays calories and macros', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MacroRingCard(
              targetCalories: 2400.0,
              consumedCalories: 1800.0,
              proteinG: 140.0,
              targetProteinG: 160.0,
              carbsG: 200.0,
              targetCarbsG: 250.0,
              fatG: 50.0,
              targetFatG: 70.0,
            ),
          ),
        ),
      );

      expect(find.text("TODAY'S NUTRITION"), findsOneWidget);
      expect(find.text('600'), findsOneWidget); // 2400 - 1800 = 600 remaining
      expect(find.text('Protein'), findsOneWidget);
      expect(find.text('Carbs'), findsOneWidget);
      expect(find.text('Fat'), findsOneWidget);
    });

    testWidgets('MetricCard displays metric value and unit', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MetricCard(
              title: 'Current Weight',
              value: '80.5',
              unit: 'kg',
              delta: '-1.5 kg',
            ),
          ),
        ),
      );

      expect(find.text('CURRENT WEIGHT'), findsOneWidget);
      expect(find.text('80.5'), findsOneWidget);
      expect(find.text('kg'), findsOneWidget);
      expect(find.text('-1.5 kg'), findsOneWidget);
    });
  });
}
