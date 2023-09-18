import 'dart:async';
import 'package:hooks_riverpod/hooks_riverpod.dart';

final otpLengthProvider = StateProvider<int>((ref) => 6);

final otpStreamController = StreamController<String>.broadcast();

class TimerController extends StateNotifier<int> {
  TimerController(int initialValue) : super(initialValue);

  void start() {
    if (state > 0) {
      // Start the countdown timer
      Future<void>.delayed(const Duration(seconds: 1), () {
        state -= 1;
        start();
      });
    }
  }

  void reset() {
    state = 60;
  }
}

final timerControllerProvider =
    StateNotifierProvider<TimerController, int>((ref) {
  return TimerController(60)..start();
});
