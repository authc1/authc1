import 'package:flutter/material.dart';

class AnimatedLogo extends StatelessWidget {
  final String gifPath;

  const AnimatedLogo({Key? key, required this.gifPath}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).colorScheme.background,
      child: SizedBox(
        height: double.infinity,
        child: Center(
          child: Image.asset(
            gifPath,
            width: 200, // Adjust the width as needed
            height: 200, // Adjust the height as needed
          ),
        ),
      ),
    );
  }
}
