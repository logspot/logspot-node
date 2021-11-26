# @logspot/node

Logspot SDK for browser applications built with React, Next.js, Angular, etc.

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
    userId: 'john@doe.com', 
    metadata: { additionalData: '123' } 
});
```