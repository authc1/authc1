<p align="center"><img src="/apps/webapp/public/logo/authc1-logo.svg" alt="authc1" width="120px"></p>

<h1 align="center">Authc1</h1>

<p align="center">
The easiest way to secure your app or website with powerful authentication and authorization services.
</p>

<h3 align="center">
Built for Edge
</h3>

<div align="center">

| Cloudflare Queues | Cloudflare Pages | Cloudflare Workers |
|:-----------------:|:----------------:|:------------------:|
| <img src="/apps/webapp/public/logo/cloudflare/queues.svg" alt="Cloudflare Queues" width="80"> | <img src="/apps/webapp/public/logo/cloudflare/pages.svg" alt="Cloudflare Pages" width="80"> | <img src="/apps/webapp/public/logo/cloudflare/workers.svg" alt="Cloudflare Workers" width="80"> |

</div>

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Authc1 is a fully-featured and easy-to-use authentication and authorization service for apps and websites that helps you secure your platform by verifying the identity of your users with state-of-the-art security features. Authc1 provides multiple authentication options including email and social media, and is compatible with any platform that supports JavaScript.

## What Makes Authc1 Unique? 🚀

Authc1 stands out from the crowd thanks to its unique combination of features and the power of cutting-edge technologies at the edge. Here's what makes Authc1 truly exceptional:

### Edge-Powered Scalability 🌐

Authc1 leverages Cloudflare's advanced edge technologies, including Functions, Durable Objects, and Key-Value Stores (KVs), to provide unmatched scalability. With these technologies, Authc1 can effortlessly handle millions of authentication requests without breaking a sweat.

- **Functions**: Authc1 uses Cloudflare Functions to execute code at the edge, reducing latency and ensuring lightning-fast responses. Whether you have a small app or a global platform, Authc1 scales effortlessly to meet your needs.

- **Durable Objects**: Durable Objects allow Authc1 to maintain stateful connections at the edge, making real-time features like webhooks and event handling a breeze. Your users can enjoy a seamless and responsive experience no matter where they are in the world.

- **Key-Value Stores (KVs)**: Authc1 utilizes Cloudflare's distributed Key-Value Stores for efficient data storage and retrieval. This ensures that your user data is always available and secure, even during traffic spikes.

Authc1's architecture is built for high availability, low latency, and unlimited scalability, making it the perfect choice for apps and websites of all sizes.

With Authc1, you can trust that your authentication and authorization services will perform reliably and efficiently, even as your user base grows. 📈

## Features

### Multiple Authentication Options
Authc1 provides a variety of authentication methods to suit your needs:

- **Email**: Allow users to sign up and log in with their email addresses. 📧
- **Phone Login**: Enable phone number-based authentication for a seamless login experience. 📱
- **Social Login**: Support social media login options including Google, GitHub, Apple, Facebook, Gitlab, Twitter, and more. 🌐

### Webhooks for Real-time Events
Stay informed about user activity and important events with Authc1's webhook support. Receive real-time notifications about user sign-ups, logins, and other critical events, allowing you to take immediate action. 🪝

### API Key for Server-to-Server Integration
Securely interact with Authc1 as an admin using API keys. Perform server-to-server operations and manage your authentication and authorization services effortlessly. 🔑


## Getting Started

To get started with Authc1, create an account and setup a new app within the Authc1 dashboard. After that, simply follow the instructions provided to setup Authc1 in your app.

## Usage

Using Authc1 is easy - simply create a new `@authc1/auth-js` instance with your `appId` and start making API calls. Here’s a quick example:

### Example Usage

```javascript
import { Authc1Client } from '@authc1/auth-js';

const client = new Authc1Client('your-app-id-here');

async function signIn() {
  try {
    const result = await client.signInWithEmail('user@example.com', 'password123');
    console.log('Signed in successfully!');
    console.log('Access token:', result.access_token);
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

signIn();
```
```javascript
import { Authc1Client } from '@authc1/auth-js';

const client = new Authc1Client('your-app-id-here');

async function register() {
  try {
    await client.registerWithEmail('user@example.com', 'password123');
    console.log('User registered successfully!');
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

register();
```

```javascript
// Subscribe to changes in the user's auth state
const subscription = client.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});

// Unsubscribe from auth state changes
subscription.unsubscribe();
```
For more information on how to use `@authc1/auth-js`, please see the [documentation](https://docs.authc1.com)

## API Reference
For detailed API reference and examples, please see the [documentation](https://docs.authc1.com)


## Contributing and Community Support 🤝

Authc1 thrives on community collaboration, and we welcome contributions from developers, designers, and users like you! Whether you want to report a bug, suggest an enhancement, or contribute code, there are several ways to get involved.

### How You Can Contribute 🙌

- **Code Contributions**: If you're a developer, you can help improve Authc1 by submitting pull requests with bug fixes, new features, or enhancements. Check out our [CONTRIBUTING.md](CONTRIBUTING.md) guide to get started.

- **Documentation**: Clear and comprehensive documentation is essential. Help us improve our documentation by suggesting edits, additions, or clarifications. Documentation improvements are highly valued contributions.

- **Bug Reports**: If you encounter a bug or an issue, please report it on our [GitHub Issues](https://github.com/authc1/authc1/issues) page. Be sure to provide as much detail as possible to help us understand and address the problem.

- **Feature Requests**: Have an idea for a new feature or improvement? Share it with us on the [GitHub Issues](https://github.com/authc1/authc1/issues) page. We appreciate your input and may even invite you to collaborate on implementing the idea.

### Community Support 👥

We believe that a vibrant community makes Authc1 even better. Here's how you can support the Authc1 community:

- **Spread the Word**: Help us grow by sharing Authc1 with your network. Tweet about your experience, write blog posts, or mention us at tech meetups and conferences.

- **Answer Questions**: If you're experienced with Authc1, consider helping fellow developers on our community forums or on platforms like Stack Overflow. Sharing your knowledge can make a big difference.

- **Provide Feedback**: Share your thoughts, suggestions, and ideas with us. We value your feedback and use it to make Authc1 even better.

Authc1 is committed to building a welcoming and inclusive community. We encourage respectful and constructive interactions among community members. Together, we can make Authc1 the best it can be!

Thank you for considering contributing to Authc1 and helping us create a powerful and secure authentication and authorization service for developers worldwide. 🌍


## License
Authc1 is released under the MIT License.
