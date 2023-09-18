import 'dart:async';
import 'package:authc1_flutter/src/authc1.dart';
import 'http_client.dart';

class SocialClient {
  final HttpClient httpClient;
  final StreamController<AuthState> authStateController;

  SocialClient({
    required this.httpClient,
    required this.authStateController,
  });
}
