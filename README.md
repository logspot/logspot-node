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

### Revenue

Record a payment from your server. `amount` is in **major units** (e.g. dollars).
Pass `transactionId` (your payment/charge id) so re-sending the same payment is
deduped, and `userId` (or any extra props, which become metadata) to attribute it.

```js
Logspot.revenue(29.99, {
    currency: 'USD',
    transactionId: 'ch_123',
    userId: 'john@doe.com',
    plan: 'pro',
});
```