import 'package:authc1_flutter/src/types/user.dart';

class Session {
  String accessToken;
  final String refreshToken;
  final int expiresIn;
  final int expiresAt;
  final String sessionId;
  final String provider;
  final User user;
  final Map<String, dynamic> claims;

  Session({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.expiresAt,
    required this.sessionId,
    required this.provider,
    required this.user,
    required this.claims,
  });

  void updateAccessToken(String newAccessToken) {
    accessToken = newAccessToken;
  }

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      accessToken: json['access_token'],
      refreshToken: json['refresh_token'],
      expiresIn: json['expires_in'],
      expiresAt: json['expires_at'],
      sessionId: json['session_id'],
      provider: json['provider'],
      user: User.fromJson(json['user']),
      claims: json['claims'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'expires_in': expiresIn,
      'expires_at': expiresAt,
      'session_id': sessionId,
      'provider': provider,
      'user': user.toJson(),
      'claims': claims,
    };
  }
}
