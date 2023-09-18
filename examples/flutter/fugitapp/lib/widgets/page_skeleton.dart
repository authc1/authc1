import 'package:flutter/material.dart';

class PageSkeleton extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;

  const PageSkeleton({
    Key? key,
    required this.child,
    this.padding = const EdgeInsets.all(32),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: SafeArea(
        maintainBottomViewPadding: true,
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
