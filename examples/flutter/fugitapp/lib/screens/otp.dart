import 'package:flutter/material.dart';
import 'package:authc1_example_app/providers/auth_provider.dart';
import 'package:authc1_example_app/providers/otp_provider.dart';
import 'package:authc1_example_app/providers/phone_provider.dart';
import 'package:authc1_example_app/screens/home.dart';
import 'package:authc1_example_app/widgets/page_skeleton.dart';
import 'package:authc1_example_app/widgets/timer_widget.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class OTPPage extends ConsumerWidget {
  const OTPPage({Key? key}) : super(key: key);
  static String get routeName => 'otp';
  static String get routeLocation => '/$routeName';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final numberOfDigits = ref.watch(otpLengthProvider);
    final String phoneNumber = ref.watch(phoneNumberProvider);
    final authc1 = ref.watch(authc1Provider);
    // final router = GoRouter.of(context);

    final focusNodes = List.generate(numberOfDigits, (index) => FocusNode());
    final controllers =
        List.generate(numberOfDigits, (index) => TextEditingController());

    void moveToNextField(int currentIndex) {
      if (currentIndex < focusNodes.length - 1) {
        focusNodes[currentIndex].unfocus();
        focusNodes[currentIndex + 1].requestFocus();
      }
    }

    void moveToPreviousField(int currentIndex) {
      if (currentIndex > 0) {
        focusNodes[currentIndex].unfocus();
        focusNodes[currentIndex - 1].requestFocus();
      }
    }

    return PageSkeleton(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(
                onPressed: () {
                  // Add logic to go back to previous screen
                },
                icon: const Icon(
                  Icons.arrow_back,
                ),
              ),
              const Text(
                "Enter OTP",
                style: TextStyle(
                  fontSize: 30,
                ),
              ),
              const SizedBox(
                height: 30,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(
                  numberOfDigits,
                  (index) => SizedBox(
                    width: 50,
                    child: TextFormField(
                      controller: controllers[index],
                      focusNode: focusNodes[index],
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      onChanged: (value) {
                        if (value.isNotEmpty) {
                          moveToNextField(index);
                        }
                        if (value.isEmpty) {
                          moveToPreviousField(index);
                        }
                        final otp = controllers
                            .map((controller) => controller.text)
                            .join();
                        otpStreamController.add(otp);
                      },
                      decoration: const InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Column(
            children: [
              const SizedBox(
                height: 30,
              ),
              const TimerWidget(),
              const SizedBox(
                height: 30,
              ),
              StreamBuilder<String>(
                stream: otpStreamController.stream,
                builder: (context, snapshot) {
                  final otp = snapshot.data ?? '';
                  return ElevatedButton(
                    onPressed: otp.length == numberOfDigits
                        ? () async {
                            // Perform OTP verification logic here
                            print("otp$phoneNumber");
                            print(otp);
                            await authc1.confirmOtp("+91$phoneNumber", otp);
                            // router.go(HomePage.routeLocation);
                          }
                        : null, // Disable the button if OTP is not complete
                    child: const Text("Verify OTP"),
                  );
                },
              ),
            ],
          )
        ],
      ),
    );
  }
}
