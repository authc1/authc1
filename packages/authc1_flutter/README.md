# authc1_flutter

This is a Flutter package for integrating with the AuthC1 authentication service. It provides a simple and easy-to-use interface for managing user authentication in your Flutter applications.

## Features

- Email and password authentication
- Phone number authentication with OTP
- Social authentication
- Real-time authentication state tracking

## Installation

To use this package, add `authc1_flutter` as a [dependency in your pubspec.yaml file](https://flutter.dev/docs/development/packages-and-plugins/using-packages).

## Usage

Here is a simple example of using the package:

```dart
    final authc1 = AuthC1(
      appId: '25b86a363a99f8b29e3a0eba382d97563e14770db091a605f2900675c3650029',
    );
    // Listen to authentication state changes
    authC1.onAuthStateChange.listen((state) {
        print('Auth state changed: $state');
    });
    await authc1.sendOtp('+911234567890'); // Phone number
    await authc1.confirmOtp('+911234567890', '333333'); // OTP confirmation
    final authState = await authc1.getCurrentAuthState();
```

## API

The `AuthC1` class provides the following methods:

- `sendOtp(String phone)`: Sends an OTP to the specified phone number.
- `confirmOtp(String phone, String otp)`: Confirms the OTP sent to the specified phone number.
- `loginWithEmail(String email, String password)`: Logs in with the specified email and password.
- `getInitialAuthState()`: Gets the initial authentication state.
- `getCurrentAuthState()`: Gets the current authentication state.
- `getCurrentAuthDetails()`: Gets the current authentication details.

It also provides the `onAuthStateChange` stream which emits `AuthState` values whenever the authentication state changes.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
