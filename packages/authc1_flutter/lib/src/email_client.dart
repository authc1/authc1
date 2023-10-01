import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:authc1_flutter/src/authc1.dart';
import 'package:authc1_flutter/src/types/session.dart';
import 'http_client.dart';

class EmailClient {
  final HttpClient httpClient;
  final StreamController<AuthState> _authStateController;
  final StreamController<Session?> _userChangesController;

  EmailClient({
    required this.httpClient,
    required StreamController<AuthState> authStateController,
    required StreamController<Session?> userChangesController,
  })  : _authStateController = authStateController,
        _userChangesController = userChangesController;

  Future<void> loginWithEmail(String email, String password) async {
    const endpoint = '/email/login';
    final body = {'email': email, 'password': password};

    final response = await httpClient.post(endpoint, body);

    if (response.statusCode == HttpStatus.ok) {
      // Login successful
      _authStateController.add(AuthState.otpSent);
      final session = Session.fromJson(
        jsonDecode(response.body),
      );
      _userChangesController.add(session);
    } else {
      // Handle the error
      _authStateController.add(AuthState.otpSent);
    }
  }
}
