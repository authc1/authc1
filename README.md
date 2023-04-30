<p align="center"><img src="/apps/webapp/public/logo/authc1-logo.svg" alt="authc1" width="120px"></p>

<h1 align="center">Authc1</h1>

<p align="center">
The easiest way to secure your app or website with powerful authentication and authorization services.
</p>

<h3 align="center">
Built for Edge
</h3>

<p align="center">
| Cloudflare Queues | Cloudflare Pages | Cloudflare Workers |
|:-----------------:|:----------------:|:------------------:|
| <img src="/apps/webapp/public/logo/cloudflare/queues.svg" alt="Cloudflare Queues" width="80"> | <img src="/apps/webapp/public/logo/cloudflare/pages.svg" alt="Cloudflare Pages" width="80"> | <img src="/apps/webapp/public/logo/cloudflare/workers.svg" alt="Cloudflare Workers" width="80"> |
</p>


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
For more information on how to use `@authc1/auth-js`, please see the documentation

## API Reference
For detailed API reference and examples, please see the documentation

## Contributing
We welcome contributions to Authc1! Please see CONTRIBUTING.md for more information on how to get involved.

## License
Authc1 is released under the MIT License.