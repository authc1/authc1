import 'dart:async';
import 'dart:io';
import 'package:authc1_flutter/src/authc1.dart';
import 'http_client.dart';

class EmailClient {
  final HttpClient httpClient;
  final StreamController<AuthState> authStateController;

  EmailClient({
    required this.httpClient,
    required this.authStateController,
  });

  Future<void> loginWithEmail(String email, String password) async {
    const endpoint = '/email/login';
    final body = {'email': email, 'password': password};

    final response = await httpClient.post(endpoint, body);

    if (response.statusCode == HttpStatus.ok) {
      // Login successful
    } else {
      // Handle the error
    }
  }
}
