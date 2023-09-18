import 'package:authc1_flutter/authc1_flutter.dart';
import 'package:flutter/material.dart';
import 'package:authc1_example_app/providers/auth_provider.dart';
import 'package:authc1_example_app/screens/home.dart';
import 'package:authc1_example_app/screens/otp.dart';
import 'package:authc1_example_app/screens/phone.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>(
  (ref) {
    final authState = ref.watch(currentAuthStateProvider);

    return GoRouter(
      navigatorKey: navigatorKey,
      debugLogDiagnostics: true,
      initialLocation: HomePage.routeLocation,
      routes: [
        // Unauthenticated Routes
        GoRoute(
          path: PhoneNumberPage.routeLocation,
          name: PhoneNumberPage.routeName,
          builder: (context, state) {
            return const PhoneNumberPage();
          },
        ),
        GoRoute(
          path: OTPPage.routeLocation,
          name: OTPPage.routeName,
          builder: (context, state) {
            return const OTPPage();
          },
        ),

        // Authenticated Routes
        GoRoute(
          path: HomePage.routeLocation,
          name: HomePage.routeName,
          builder: (context, state) {
            return const HomePage();
          },
        ),
        /* GoRoute(
          path: ProfilePage.routeLocation,
          name: ProfilePage.routeName,
          builder: (context, state) {
            return const ProfilePage();
          },
        ),
        GoRoute(
          path: SettingsPage.routeLocation,
          name: SettingsPage.routeName,
          builder: (context, state) {
            return const SettingsPage();
          },
        ),
        GoRoute(
          path: NotificationsPage.routeLocation,
          name: NotificationsPage.routeName,
          builder: (context, state) {
            return const NotificationsPage();
          },
        ), */
      ],
      redirect: (context, state) {
        // If our async state is loading, don't perform redirects, yet
        if (authState.isLoading || authState.hasError) return null;

        if (authState.value == AuthState.loggedIn) {
          return state.matchedLocation == PhoneNumberPage.routeLocation ||
                  state.matchedLocation == OTPPage.routeLocation
              ? HomePage.routeLocation
              : null;
        }
        if (authState.value == AuthState.otpSent) {
          return OTPPage.routeLocation;
        }
        if (authState.value == AuthState.loggedOut) {
          return PhoneNumberPage.routeLocation;
        }
      },
    );
  },
);
