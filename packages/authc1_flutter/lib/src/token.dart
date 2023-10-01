import 'dart:convert';

import 'package:authc1_flutter/src/types/session.dart';
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
      final authDetails = Session.fromJson(
        jsonDecode(tokenJson),
      );
      return isAuthTokenValid(authDetails);
    }

    return false;
  }

  static bool isAuthTokenValid(Session authDetials) {
    final currentTimeInSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return authDetials.expiresAt > currentTimeInSeconds;
  }

  static Future<void> addLoggedInData(String data) async {
    final box = await openHiveBox(_authBoxKey);
    await box.put(_authTokenKey, data);
  }

  static Future<Session?> getAuthDetails() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey);
    if (tokenJson != null) {
      final authDetails = Session.fromJson(
        jsonDecode(tokenJson),
      );
      return authDetails;
    }
    return null;
  }

  static Future<void> deleteLoggedInData() async {
    final box = await openHiveBox(_authBoxKey);
    await box.delete(_authTokenKey);
  }

  static Future<String?> getRefreshToken() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey);

    if (tokenJson != null) {
      final authDetails = Session.fromJson(
        jsonDecode(tokenJson),
      );
      return authDetails.refreshToken;
    }

    return null;
  }

  static Future<void> updateAccessToken(String newAccessToken) async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey);

    if (tokenJson != null) {
      final authDetails = Session.fromJson(
        jsonDecode(tokenJson),
      );
      authDetails.updateAccessToken(newAccessToken);
      await box.put(_authTokenKey, newAccessToken);
    }
  }

  static Future<String?> getAccessToken() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey);

    if (tokenJson != null) {
      final authDetails = Session.fromJson(
        jsonDecode(tokenJson),
      );
      return authDetails.accessToken;
    }

    return null;
  }

  static Future<int?> getAccessTokenExpirationTime() async {
    final box = await openHiveBox(_authBoxKey);
    final tokenJson = box.get(_authTokenKey);

    if (tokenJson != null) {
      final authDetails = Session.fromJson(
        jsonDecode(tokenJson),
      );
      return authDetails.expiresAt;
    }

    return null;
  }

  static Future<void> deleteAuthDetails() async {
    final box = await openHiveBox(_authBoxKey);
    await box.delete(_authTokenKey);
  }
}
