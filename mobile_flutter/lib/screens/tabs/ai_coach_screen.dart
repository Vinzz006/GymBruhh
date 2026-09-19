import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/ai_provider.dart';

class AICoachScreen extends StatefulWidget {
  const AICoachScreen({super.key});

  @override
  State<AICoachScreen> createState() => _AICoachScreenState();
}

class _AICoachScreenState extends State<AICoachScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  final List<String> _suggestedPrompts = [
    "What should I eat for dinner?",
    "How to progressively overload bench press?",
    "Should I deload this week?",
    "Suggest an alternative for deadlifts",
  ];

  void _sendMessage([String? prompt]) {
    final text = prompt ?? _msgCtrl.text.trim();
    if (text.isEmpty) return;
    _msgCtrl.clear();

    final ai = Provider.of<AIProvider>(context, listen: false);
    ai.sendMessage(text);

    Future.delayed(const Duration(milliseconds: 300), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent + 100,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ai = Provider.of<AIProvider>(context);
    final messages = ai.chatMessages;
    final recs = ai.recommendations;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.purple.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.auto_awesome, color: AppColors.purple, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text("AI Fitness Coach", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                Text("Powered by Gemini API", style: TextStyle(color: AppColors.accent, fontSize: 10, fontWeight: FontWeight.w700)),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Pending Progressive Overload Recommendation Banners
          if (recs.isNotEmpty) ...[
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.purple.withOpacity(0.12),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.purple.withOpacity(0.35)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.bolt_rounded, color: AppColors.purple, size: 18),
                      SizedBox(width: 6),
                      Text("PROGRESSIVE OVERLOAD RECOMMENDATION", style: TextStyle(color: AppColors.purple, fontSize: 10, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(recs.first.title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 2),
                  Text(recs.first.recommendationText, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accent,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => ai.respondRecommendation(recs.first.id, true),
                        child: const Text("Accept +2.5kg", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () => ai.respondRecommendation(recs.first.id, false),
                        child: const Text("Keep Current", style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          // Quick Prompt Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: Row(
              children: _suggestedPrompts.map((p) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    label: Text(p),
                    backgroundColor: AppColors.card,
                    labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w600),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: AppColors.border),
                    ),
                    onPressed: () => _sendMessage(p),
                  ),
                );
              }).toList(),
            ),
          ),

          // Chat Messages List
          Expanded(
            child: messages.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.smart_toy_rounded, size: 48, color: AppColors.purple),
                          SizedBox(height: 16),
                          Text("Ask Your AI Trainer Anything", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                          SizedBox(height: 6),
                          Text("Get tailored workout adjustments, meal suggestions, and recovery advice.", style: TextStyle(color: AppColors.textSecondary, fontSize: 12), textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: messages.length,
                    itemBuilder: (ctx, idx) {
                      final msg = messages[idx];
                      final isUser = msg.sender == 'user';

                      return Align(
                        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                          decoration: BoxDecoration(
                            color: isUser ? AppColors.accent : AppColors.card,
                            borderRadius: BorderRadius.circular(18).copyWith(
                              bottomRight: isUser ? const Radius.circular(2) : null,
                              bottomLeft: !isUser ? const Radius.circular(2) : null,
                            ),
                            border: !isUser ? Border.all(color: AppColors.border) : null,
                          ),
                          child: Text(
                            msg.content,
                            style: TextStyle(
                              color: isUser ? Colors.black : Colors.white,
                              fontSize: 13,
                              fontWeight: isUser ? FontWeight.w700 : FontWeight.w500,
                              height: 1.4,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Message input bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: AppColors.card,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: "Ask AI Coach anything...",
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                        filled: true,
                        fillColor: AppColors.surface,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.black, size: 18),
                      onPressed: () => _sendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
