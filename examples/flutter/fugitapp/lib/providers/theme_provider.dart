import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:io';

final themeDataProvider = FutureProvider<Map<String, ThemeData>>((ref) async {
  final response =
      await http.get(Uri.parse('https://jsonplaceholder.typicode.com/todos/1'));

  if (response.statusCode == HttpStatus.ok) {
    // await Future.delayed(Duration(seconds: 5));
    return {
      'light': parseThemeData(response.body, Brightness.light),
      'dark': parseThemeData(response.body, Brightness.dark),
    };
  } else {
    throw Exception('Failed to fetch themes: ${response.statusCode}');
  }
});

ThemeData parseThemeData(String responseBody, Brightness brightness) {
  // Implement the parsing logic here
  // Return the parsed theme data as a ThemeData object
  return ThemeData(
    brightness: brightness,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFFFD5A4B),
      brightness: brightness,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        minimumSize: MaterialStateProperty.all<Size>(
          const Size(double.infinity, 49),
        ),
        shape: MaterialStateProperty.all<RoundedRectangleBorder>(
          const RoundedRectangleBorder(),
        ),
      ),
    ),
    useMaterial3: true,
  );
}
