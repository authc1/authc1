import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart' as path_provider;

class AccessTokenManager {
  static const String _authBoxKey = 'authc1_auth_box';
  static const String _authTokenKey = 'authc1_auth_token';

  static Future<Box<dynamic>> openHiveBox(String boxName) async {
    final appDocumentDir =
        await path_provider.getApplicationDocumentsDirectory();
    Hive.init(appDocumentDir.path);
    return Hive.openBox(boxName);
  }

  static Future<bool> isUserLoggedIn() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey);

    if (tokenJson != null) {
      final authDetials = AuthDetails.fromJson(tokenJson);
      return isAuthTokenValid(authDetials);
    }

    return false;
  }

  static bool isAuthTokenValid(AuthDetails authDetials) {
    final currentTimeInSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return authDetials.expiresAt > currentTimeInSeconds;
  }

  static Future<void> addLoggedInData(Map<String, dynamic> data) async {
    final box = await openHiveBox(_authBoxKey);
    await box.put(_authTokenKey, data);
  }

  static Future<AuthDetails?> getAuthDetails() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey) as Map<dynamic, dynamic>?;
    if (tokenJson != null) {
      return AuthDetails.fromJson(tokenJson);
    }
    return null;
  }

  static Future<void> deleteLoggedInData() async {
    final box = await openHiveBox(_authBoxKey);
    await box.delete(_authTokenKey);
  }

  static Future<String?> getRefreshToken() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey) as Map<dynamic, dynamic>?;

    if (tokenJson != null) {
      final authToken = AuthDetails.fromJson(tokenJson);
      return authToken.refreshToken;
    }

    return null;
  }

  static Future<void> updateAccessToken(String newAccessToken) async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey) as Map<dynamic, dynamic>?;

    if (tokenJson != null) {
      final authToken = AuthDetails.fromJson(tokenJson);
      authToken.accessToken = newAccessToken;
      await box.put(_authTokenKey, authToken.toJson());
    }
  }

  static Future<String?> getAccessToken() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey) as Map<dynamic, dynamic>?;

    if (tokenJson != null) {
      final authToken = AuthDetails.fromJson(tokenJson);
      return authToken.accessToken;
    }

    return null;
  }

  static Future<int?> getAccessTokenExpirationTime() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey) as Map<dynamic, dynamic>?;

    if (tokenJson != null) {
      final authToken = AuthDetails.fromJson(tokenJson);
      return authToken.expiresAt;
    }

    return null;
  }
}

class AuthDetails {
  String accessToken;
  String? email;
  final String refreshToken;
  final int expiresIn;
  final int expiresAt;
  final String localId;
  String? name;
  String? phone;

  AuthDetails(
    this.accessToken,
    this.email,
    this.refreshToken,
    this.expiresIn,
    this.expiresAt,
    this.localId,
    this.name,
    this.phone,
  );

  factory AuthDetails.fromJson(Map<dynamic, dynamic> json) {
    return AuthDetails(
      json['access_token'] as String,
      json['email'] as String?,
      json['refresh_token'] as String,
      json['expires_in'] as int,
      json['expires_at'] as int,
      json['local_id'] as String,
      json['name'] as String?,
      json['phone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'email': email,
      'refresh_token': refreshToken,
      'expires_in': expiresIn,
      'expires_at': expiresAt,
      'local_id': localId,
      'name': name,
      'phone': phone,
    };
  }
}
