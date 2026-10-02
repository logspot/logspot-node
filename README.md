# @logspot/node

Logspot Node SDK for Node.js application.

Requires Node.js 18 or newer (uses the built-in `fetch`).

## Installation

```bash
npm install @logspot/node
# or
pnpm add @logspot/node
# or
yarn add @logspot/node
# or
bun add @logspot/node
```

## Usage

### Init


```js
import Logspot from '@logspot/node';

Logspot.init({ apiToken: 'YOUR_API_TOKEN' });
```

Create an API token in **Integrations → AI & API Access → API Keys & OAuth** (or a project's Integrations
tab for a project-scoped one) and keep it in an environment variable. The legacy
`init({ secretKey: 'YOUR_SECRET_KEY' })` still works (it warns once); prefer `apiToken`.

Named exports are also available: `import { init, track, revenue, group } from '@logspot/node';`.

### Track

```js
Logspot.track({
    event: 'UserSubscribed',
    message: 'john@doe.com has subscribed',
    userId: 'john@doe.com',
    metadata: { additionalData: '123' },
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

### Group

Associate a user or anonymous visitor with an account without emitting an event. Pass `userId` or
`anonymousId` (at least one is required).

```js
Logspot.group('acme.com', {
    userId: 'john@acme.com',
    traits: { name: 'Acme, Inc.', plan: 'enterprise' },
});
```
