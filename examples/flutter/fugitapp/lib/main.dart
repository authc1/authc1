import 'package:flutter/material.dart';
import 'package:authc1_example_app/init.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

Future<void> main() async {
  runApp(
    const ProviderScope(
      child: InitApp(),
    ),
  );
}
