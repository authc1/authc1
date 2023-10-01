import 'dart:convert';
import 'dart:io';

import 'package:authc1_flutter/src/token.dart';
import 'package:authc1_flutter/src/types/session.dart';
import 'package:authc1_flutter/src/types/user.dart';
import 'package:flutter/widgets.dart';

import 'http_client.dart';
import 'email_client.dart';
import 'phone_client.dart';
import 'social_client.dart';
import 'dart:async';

class AuthC1 with WidgetsBindingObserver {
  late HttpClient httpClient;
  late EmailClient emailClient;
  late PhoneClient phoneClient;
  late SocialClient socialClient;
  late final StreamController<AuthState> _authStateController;
  late final StreamController<Session?> _userChangesController;
  Timer? _refreshTimer;
  final Duration refreshThreshold = const Duration(minutes: 5);

  AuthC1({
    required String appId,
    String baseUrl = 'https://api.authc1.com/v1',
  }) {
    _authStateController = StreamController<AuthState>.broadcast();
    _userChangesController = StreamController<Session?>.broadcast();

    WidgetsBinding.instance.addObserver(this);
    initializeAuthState();
    httpClient = HttpClient(
      baseUrl: baseUrl,
      appId: appId,
    );

    emailClient = EmailClient(
      httpClient: httpClient,
      authStateController: _authStateController,
      userChangesController: _userChangesController,
    );

    phoneClient = PhoneClient(
      httpClient: httpClient,
      authStateController: _authStateController,
      userChangesController: _userChangesController,
    );

    socialClient = SocialClient(
      httpClient: httpClient,
      authStateController: _authStateController,
      userChangesController: _userChangesController,
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    switch (state) {
      case AppLifecycleState.resumed:
        final authDetails = await AccessTokenManager.getAuthDetails();
        if (authDetails != null) {
          final isTokenExpired =
              AccessTokenManager.isAuthTokenValid(authDetails);
          if (isTokenExpired) {
            await refreshAccessToken();
          }
        }
        break;
      case AppLifecycleState.inactive:
        break;
      case AppLifecycleState.paused:
        break;
      case AppLifecycleState.detached:
        break;
      default:
        // Handle the case when the AppLifecycleState is hidden
        break;
    }
  }

  Stream<AuthState> get authStateChange => _authStateController.stream;
  Stream<Session?> get userChanges => _userChangesController.stream;

  Future<void> sendOtp(String phone) {
    return phoneClient.sendOtp(phone);
  }

  Future<void> confirmOtp(String phone, String otp) {
    return phoneClient.confirmOtp(phone, otp);
  }

  Future<void> loginWithEmail(String email, String password) {
    return emailClient.loginWithEmail(email, password);
  }

  Future<void> refreshAccessToken() async {
    const endpoint = '/accounts/access-token';
    final refreshToken = await AccessTokenManager.getRefreshToken();

    final response = await httpClient
        .post(endpoint, {'refresh_token': refreshToken as String});

    if (response.statusCode == HttpStatus.ok) {
      final newAccessTokenDetails = response.body;

      await AccessTokenManager.updateAccessToken(newAccessTokenDetails);
      httpClient.updateAuthorization(newAccessTokenDetails);
      final session = Session.fromJson(
        jsonDecode(newAccessTokenDetails),
      );
      _addUserChanges(session);
    } else {
      throw Exception(
        'Failed to refresh access token: ${response.statusCode}: ${response.body}',
      );
    }
  }

  void initializeAuthState() async {
    final initialAuthState = await getInitialAuthState();
    if (initialAuthState != null) {
      _authStateController.add(AuthState.loggedIn);
      _addUserChanges(initialAuthState);
    } else {
      _authStateController.add(AuthState.loggedOut);
      _addUserChanges(null);
    }
    _startRefreshTimer();
  }

  Future<Session?> getInitialAuthState() async {
    final authDetials = await AccessTokenManager.getAuthDetails();
    if (authDetials != null) {
      if (!AccessTokenManager.isAuthTokenValid(authDetials)) {
        await refreshAccessToken();
      }

      httpClient.updateAuthorization(authDetials.accessToken);

      return authDetials;
    }
    return null;
  }

  void _addUserChanges(Session? session) {
    _userChangesController.add(session);
  }

  void _startRefreshTimer() {
    _refreshTimer?.cancel();
    Future<void> startTimer() async {
      final authState = await getCurrentAuthState();
      if (authState == AuthState.loggedIn) {
        final expirationTime =
            await AccessTokenManager.getAccessTokenExpirationTime();
        if (expirationTime != null) {
          final currentTime = DateTime.now().millisecondsSinceEpoch;
          final timeUntilExpiration = expirationTime - currentTime;

          if (timeUntilExpiration > refreshThreshold.inMilliseconds) {
            final delay = timeUntilExpiration - refreshThreshold.inMilliseconds;
            _refreshTimer = Timer(Duration(milliseconds: delay), () {
              refreshAccessToken();
              _startRefreshTimer();
            });
          }
        }
      }
    }

    startTimer();
  }

  Future<AuthState> getCurrentAuthState() async {
    final authDetails = await AccessTokenManager.getAuthDetails();
    if (authDetails != null) {
      return AuthState.loggedIn;
    }
    return AuthState.loggedOut;
  }

  Future<Session?> getCurrentAuthDetails() async {
    return await AccessTokenManager.getAuthDetails();
  }

  Future<Session> updateUser(UserUpdateRequest payload) async {
    const endpoint = '/accounts/user';

    final response = await httpClient.post(endpoint, payload.toJson());

    if (response.statusCode == HttpStatus.ok) {
      final authDetails = Session.fromJson(jsonDecode(response.body));
      return authDetails;
    } else {
      throw Exception('Failed to update user: ${response.statusCode}');
    }
  }

  Future<void> logout() async {
    await AccessTokenManager.deleteAuthDetails();
    _authStateController.add(AuthState.loggedOut);
    _addUserChanges(null);
  }

  void cancelAccessTokenTimer() {
    _refreshTimer?.cancel();
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _authStateController.close();
    cancelAccessTokenTimer();
  }
}

enum AuthState {
  loading,
  otpSendError,
  otpConfirmError,
  otpSent,
  loggedIn,
  loggedOut,
  tokenRefreshed,
  userUpdated,
  passwordRecoverySuccess,
  passwordRecoveryError,
  loginSuccess,
  loginError,
  logoutSuccess,
  logoutError,
  emailVerificationSent,
  emailVerificationSuccess,
  emailVerificationResent,
  emailVerificationError,
  passwordResetRequestSent,
  passwordResetRequestSuccess,
  passwordResetRequestError,
  passwordResetSent,
  passwordResetSuccess,
  passwordResetError,
  registerSuccess,
  registerError,
  emailVerificationSendError,
  forgotPasswordSuccess,
  forgotPasswordError,
}
