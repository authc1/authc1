import 'package:authc1_flutter/authc1_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

// Create a separate provider for the AuthC1 instance.
final authc1Provider = Provider<AuthC1>((ref) {
  return AuthC1(
    baseUrl: 'http://127.0.0.1:8787/v1',
    appId: '25b86a363a99f8b29e3a0eba382d97563e14770db091a605f2900675c3650029',
  );
});

final currentAuthStateProvider = StreamProvider<AuthState>((ref) {
  final authc1 = ref.read(authc1Provider);
  return authc1.onAuthStateChange;
});
