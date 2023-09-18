import 'package:flutter/material.dart';
import 'package:authc1_example_app/providers/otp_provider.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class TimerWidget extends ConsumerWidget {
  const TimerWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final remainingTime = ref.watch(timerControllerProvider);

    return Column(
      children: [
        Text(
          'Resend OTP in $remainingTime seconds',
          style: const TextStyle(fontSize: 16),
        ),
        TextButton(
          onPressed: remainingTime > 0
              ? null
              : () {
                  // Resend OTP logic here
                  // ref.read(timerControllerProvider.notifier).resetTimer();
                  final timer = ref.read(timerControllerProvider.notifier);
                  timer.reset(); // Reset the timer to 60 seconds
                  timer.start();
                },
          child: const Text(
            'Resend OTP',
            style: TextStyle(fontSize: 16),
          ),
        ),
      ],
    );
  }
}
