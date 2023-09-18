import 'package:flutter/material.dart';
import 'package:authc1_example_app/providers/router_provider.dart';
import 'package:authc1_example_app/providers/theme_provider.dart';
import 'package:authc1_example_app/widgets/animated_logo.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

final _key = GlobalKey<NavigatorState>();

class InitApp extends ConsumerWidget {
  const InitApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeDataAsyncValue = ref.watch(themeDataProvider);
    final router = ref.watch(routerProvider);

    return themeDataAsyncValue.when(
      data: (themeData) {
        return MaterialApp.router(
          routerDelegate: router.routerDelegate,
          routeInformationParser: router.routeInformationParser,
          routeInformationProvider: router.routeInformationProvider,
          theme: themeData['light'],
          darkTheme: themeData['dark'],
          themeMode: ThemeMode.dark,
        );
      },
      loading: () => const AnimatedLogo(gifPath: 'assets/logo.gif'),
      error: (error, stack) => const Text('Error fetching theme data'),
    );
  }
}
