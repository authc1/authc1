import 'dart:convert';

import 'package:http/http.dart' as http;

class HttpClient {
  final String? authorization;
  final String baseUrl;
  final String appId;

  HttpClient({
    this.authorization,
    required this.baseUrl,
    required this.appId,
  });

  Future<http.Response> post(String endpoint, Map<String, String> body) async {
    final headers = <String, String>{};
    if (authorization != null) {
      headers['Authorization'] = authorization!;
    }

    final response = await http.post(Uri.parse("$baseUrl/$appId$endpoint"),
        headers: headers, body: jsonEncode(body));
    return response;
  }
}
