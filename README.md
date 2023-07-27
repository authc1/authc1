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

## Roadmap

Welcome to our project's roadmap! Here, we outline our upcoming plans and developments for supporting more providers and SDKs for various frameworks. Our aim is to continuously expand our product's capabilities and offer a seamless experience to our users. Below are the key milestones we have identified for the near future:

### Upcoming Plans

1. **Provider Expansion:** Our first priority is to extend support for additional authentication and authorization providers. We will be working on integrating popular providers like Microsoft Azure Active Directory, Okta, and Auth0. This will empower our users to connect with a broader range of authentication services and choose the one that best fits their needs.

2. **SDK Integration:** We understand the importance of providing easy-to-use software development kits (SDKs) for various platforms. In this regard, we will be developing SDKs tailored for different programming languages and platforms. Our initial focus will be on creating SDKs for Java, Python, and .NET, enabling developers to seamlessly integrate our authentication system into their applications.

3. **Flutter Support:** We recognize the growing demand for mobile app development using Flutter, and it is one of our top priorities. We are excited to announce that we will be actively working on providing full support for Flutter-based applications. Developers will be able to utilize our authentication and authorization services directly within their Flutter projects with ease.

4. **Documentation and Tutorials:** Clear and comprehensive documentation is crucial for the success of any project. We are committed to enhancing our documentation by providing detailed guides and tutorials to facilitate the integration of our services into various frameworks. This will help developers to get started quickly and make the most of our offerings.

5. **Improved Security and Compliance:** Security is paramount to us, and we are dedicated to continually improving the security measures of our authentication system. Additionally, we will focus on ensuring compliance with industry standards and regulations to guarantee the protection of our users' data and privacy.

### Long-term Vision

Looking further ahead, we have a long-term vision to make our authentication solution a universal choice for developers across all platforms. This includes expanding support for emerging providers, keeping our SDKs up-to-date with the latest advancements in technology, and staying at the forefront of security best practices.

We value feedback from our community and encourage you to share your thoughts and ideas with us. As we progress through our roadmap, we will be transparent about our developments and milestones. Stay tuned for updates, exciting new features, and more as we work towards building a robust and versatile authentication and authorization system.

Thank you for your continued support on this journey!

*Note: This roadmap is subject to change based on various factors, including user feedback, technological advancements, and market trends.*

## Contributing
We welcome contributions to Authc1! Please see CONTRIBUTING.md for more information on how to get involved.

## License
Authc1 is released under the MIT License.
