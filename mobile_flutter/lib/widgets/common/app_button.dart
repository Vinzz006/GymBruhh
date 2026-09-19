import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

enum AppButtonVariant { primary, cyan, orange, danger, ghost }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final Widget? leftIcon;
  final Widget? rightIcon;
  final bool fullWidth;

  const AppButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.leftIcon,
    this.rightIcon,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case AppButtonVariant.primary:
        bgColor = AppColors.accent;
        textColor = Colors.black;
        break;
      case AppButtonVariant.cyan:
        bgColor = AppColors.cyan;
        textColor = Colors.black;
        break;
      case AppButtonVariant.orange:
        bgColor = AppColors.orange;
        textColor = Colors.white;
        break;
      case AppButtonVariant.danger:
        bgColor = AppColors.red.withOpacity(0.2);
        textColor = AppColors.red;
        borderSide = BorderSide(color: AppColors.red.withOpacity(0.4));
        break;
      case AppButtonVariant.ghost:
        bgColor = AppColors.surface.withOpacity(0.6);
        textColor = AppColors.textPrimary;
        borderSide = const BorderSide(color: AppColors.border);
        break;
    }

    Widget content = Row(
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (leftIcon != null) ...[leftIcon!, const SizedBox(width: 8)],
        Text(
          text,
          style: TextStyle(
            color: textColor,
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
        ),
        if (rightIcon != null) ...[const SizedBox(width: 8), rightIcon!],
      ],
    );

    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: 48,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: textColor,
          elevation: variant == AppButtonVariant.primary ? 4 : 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: borderSide,
          ),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(textColor),
                ),
              )
            : content,
      ),
    );
  }
}
