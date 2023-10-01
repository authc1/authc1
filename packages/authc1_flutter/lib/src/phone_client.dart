import 'dart:convert';
import 'dart:io';
import 'package:authc1_flutter/src/authc1.dart';
import 'package:authc1_flutter/src/token.dart';
import 'package:authc1_flutter/src/types/session.dart';
import 'http_client.dart';
import 'dart:async';

class PhoneClient {
  final HttpClient httpClient;
  final StreamController<AuthState> _authStateController;
  final StreamController<Session?> _userChangesController;

  PhoneClient({
    required this.httpClient,
    required StreamController<AuthState> authStateController,
    required StreamController<Session?> userChangesController,
  })  : _authStateController = authStateController,
        _userChangesController = userChangesController;

  Future<void> sendOtp(String phone) async {
    const endpoint = '/phone/verify';
    final body = {'phone': phone};

    final response = await httpClient.post(endpoint, body);

    if (response.statusCode == HttpStatus.ok) {
      _authStateController.add(AuthState.otpSent);
    } else {
      _authStateController.add(AuthState.otpSendError);
      throw Exception(
          'Failed to send otp: ${response.statusCode}: ${response.body}');
    }
  }

  Future<void> confirmOtp(String phone, String otp) async {
    const endpoint = '/phone/confirm';
    final body = {'phone': phone, 'code': otp};

    final response = await httpClient.post(endpoint, body);

    if (response.statusCode == HttpStatus.ok) {
      await AccessTokenManager.addLoggedInData(response.body);
      _authStateController.add(AuthState.loggedIn);
      final session = Session.fromJson(
        jsonDecode(response.body),
      );
      _userChangesController.add(session);
    } else {
      _authStateController.add(AuthState.otpConfirmError);
      throw Exception(
          'Failed to confirm otp: ${response.statusCode}: ${response.body}');
    }
  }
}
