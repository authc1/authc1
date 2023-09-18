import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:authc1_example_app/providers/auth_provider.dart';
import 'package:authc1_example_app/providers/phone_provider.dart';
import 'package:authc1_example_app/screens/otp.dart';
import 'package:authc1_example_app/widgets/page_skeleton.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class PhoneNumberPage extends ConsumerWidget {
  const PhoneNumberPage({super.key});
  static String get routeName => 'phone_number';
  static String get routeLocation => '/$routeName';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final String phoneNumber = ref.watch(phoneNumberProvider);
    final authc1 = ref.watch(authc1Provider);
    final router = GoRouter.of(context);

    return PageSkeleton(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "fugit",
                style: TextStyle(
                  fontSize: 30,
                ),
              ),
              const SizedBox(
                height: 30,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: ListTile(
                  leading: const Text(
                    '+91',
                    style: TextStyle(
                      fontSize: 16,
                    ),
                  ),
                  title: TextFormField(
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: const InputDecoration(
                      hintText: 'Enter your phone number',
                      border: InputBorder.none,
                      counterText: '',
                    ),
                    onChanged: (value) {
                      ref.read(phoneNumberProvider.notifier).state = value;
                    },
                    maxLength: 10,
                    style: const TextStyle(
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(
            height: 30,
          ),
          ElevatedButton(
            onPressed: phoneNumber.length == 10
                ? () async {
                    try {
                      await authc1.sendOtp('+91$phoneNumber');
                      router.go(OTPPage.routeLocation);
                    } catch (e) {
                      print(e);
                    }
                  }
                : null,
            child: const Text("Login"),
          ),
        ],
      ),
    );
  }
}
