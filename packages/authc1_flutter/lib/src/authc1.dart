import 'dart:io';

import 'package:authc1_flutter/src/token.dart';
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
  Timer? _refreshTimer;
  final Duration refreshThreshold = const Duration(minutes: 5);

  AuthC1({
    required String appId,
    String baseUrl = 'https://api.authc1.com/v1',
  }) {
    _authStateController = StreamController<AuthState>.broadcast();

    WidgetsBinding.instance.addObserver(this);
    initializeAuthState();
    httpClient = HttpClient(
      baseUrl: baseUrl,
      appId: appId,
    );

    emailClient = EmailClient(
      httpClient: httpClient,
      authStateController: _authStateController,
    );

    phoneClient = PhoneClient(
      httpClient: httpClient,
      authStateController: _authStateController,
    );

    socialClient = SocialClient(
      httpClient: httpClient,
      authStateController: _authStateController,
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

  Stream<AuthState> get onAuthStateChange => _authStateController.stream;

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
      final newAccessToken = response.body;

      await AccessTokenManager.updateAccessToken(newAccessToken);
    } else {
      throw Exception(
          'Failed to refresh access token: ${response.statusCode}: ${response.body}');
    }
  }

  void initializeAuthState() async {
    final initialAuthState = await getInitialAuthState();
    _authStateController.add(initialAuthState);
    _startRefreshTimer();
  }

  Future<AuthState> getInitialAuthState() async {
    final authDetials = await AccessTokenManager.getAuthDetails();
    if (authDetials != null) {
      if (!AccessTokenManager.isAuthTokenValid(authDetials)) {
        await refreshAccessToken();
      }
      return AuthState.loggedIn;
    }
    return AuthState.loggedOut;
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

  Future<AuthDetails?> getCurrentAuthDetails() async {
    return await AccessTokenManager.getAuthDetails();
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
