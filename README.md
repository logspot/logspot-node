# @logspot/node

Logspot Node SDK for Node.js application.

## Installation

```npm install @logspot/node```

or

```yarn add @logspot/node```

## Usage

### Init


```js
import Logspot from '@logspot/node';

Logspot.init({ secretKey: 'YOUR_SECRET_KEY' });
```

### Track

```js
Logspot.track({ 
    event: 'UserSubscribed', 
    notify: true,
    message: 'john@doe.com has subscribed',
    userId: 'john@doe.com', 
    metadata: { additionalData: '123' } 
});
```