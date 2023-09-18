import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:authc1_flutter/authc1_flutter.dart';
import 'package:hive/hive.dart';

void initHive() {
  var path = Directory.current.path;
  Hive.init('$path/test/hive_testing_path');
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(
          const MethodChannel('plugins.flutter.io/path_provider'),
          (MethodCall methodCall) async {
    return '.';
  });
}

void main() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  initHive();
  group('Auth Tests', () {
    final authc1 = AuthC1(
      baseUrl: 'http://127.0.0.1:8787/v1',
      appId: '25b86a363a99f8b29e3a0eba382d97563e14770db091a605f2900675c3650029',
    );
    test(
        'Auth State changes to Authenticated after successful OTP confirmation',
        () async {
      await authc1.sendOtp('+911234567890'); // Phone number
      await authc1.confirmOtp('+911234567890', '333333'); // OTP confirmation
      final authState = await authc1.getCurrentAuthState();
      expect(authState, AuthState.loggedIn);
    });

    test('Auth State remains Unauthenticated after failed OTP confirmation',
        () async {
      await authc1.sendOtp('+911234567890'); // Phone number
      await authc1.confirmOtp('+911234567890', '892892'); // Wrong OTP
      final authState = await authc1.getCurrentAuthState();
      expect(authState, AuthState.loggedOut);
    });
  });
}
