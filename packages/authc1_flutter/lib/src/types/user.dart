class UserUpdateRequest {
  final String? name;
  final String? nickname;
  final String? avatarUrl;
  final String? email;
  final String? phone;

  UserUpdateRequest({
    this.name,
    this.nickname,
    this.avatarUrl,
    this.email,
    this.phone,
  }) : assert(
          name != null ||
              nickname != null ||
              avatarUrl != null ||
              email != null ||
              phone != null,
          'At least one field should be provided in UserUpdateRequest',
        );

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (name != null) data['name'] = name;
    if (nickname != null) data['nickname'] = nickname;
    if (avatarUrl != null) data['avatar_url'] = avatarUrl;
    if (email != null) data['email'] = email;
    if (phone != null) data['phone'] = phone;
    return data;
  }
}

class User {
  final String localId;
  final bool emailVerified;
  final bool phoneVerified;
  final String? email;
  final String? phone;
  final String? name;
  final String? avatarUrl;

  User({
    required this.localId,
    required this.emailVerified,
    required this.phoneVerified,
    this.email,
    this.phone,
    this.name,
    this.avatarUrl,
  }) : assert(email != null || phone != null,
            'Either email or phone must be provided');

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      localId: json['local_id'],
      emailVerified: json['email_verified'],
      phoneVerified: json['phone_verified'],
      email: json['email'],
      phone: json['phone'],
      name: json['name'],
      avatarUrl: json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'local_id': localId,
      'email_verified': emailVerified,
      'phone_verified': phoneVerified,
      'email': email,
      'phone': phone,
      'name': name,
      'avatar_url': avatarUrl,
    };
  }
}
