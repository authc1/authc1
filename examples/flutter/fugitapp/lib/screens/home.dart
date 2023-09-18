import 'package:authc1_flutter/authc1_flutter.dart';
import 'package:flutter/material.dart';
import 'package:authc1_example_app/providers/auth_provider.dart';
import 'package:authc1_example_app/widgets/page_skeleton.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class HomePage extends ConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  static String get routeName => 'home';
  static String get routeLocation => '/';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(currentAuthStateProvider);

    return PageSkeleton(
      padding: const EdgeInsets.all(0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Hey, ${authState.value == AuthState.loggedIn ? 'You are logged in successfully.' : ''}',
            style: const TextStyle(fontSize: 24),
          ),
        ],
      ),
    );
  }
}
