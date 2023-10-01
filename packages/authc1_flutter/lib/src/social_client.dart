import 'dart:async';
import 'package:authc1_flutter/src/authc1.dart';
import 'package:authc1_flutter/src/types/session.dart';
import 'http_client.dart';

class SocialClient {
  final HttpClient httpClient;
  final StreamController<AuthState> authStateController;
  final StreamController<Session?> userChangesController;

  SocialClient({
    required this.httpClient,
    required this.authStateController,
    required this.userChangesController,
  });
}
