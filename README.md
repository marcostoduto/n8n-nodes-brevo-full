# n8n-nodes-brevo-full

![n8n.io](https://img.shields.io/badge/n8n-community-blue) ![npm](https://img.shields.io/npm/v/n8n-nodes-brevo-full) ![License](https://img.shields.io/npm/l/n8n-nodes-brevo-full)

**n8n community node for Brevo (ex Sendinblue)**: it covers **every endpoint of the Brevo API v3**: 292 operations across 35 resources (contacts, campaigns, transactional email/SMS/WhatsApp, CRM, e-commerce, loyalty, master account, webhooks…). It also includes a **webhook trigger** and a **Custom API Call** mode.

Operations are generated automatically from the official Brevo SDK ([`@getbrevo/brevo`](https://github.com/getbrevo/brevo-node)), which is itself generated from the [Brevo OpenAPI definition](https://api.brevo.com/v3/swagger_definition_v3.yml). So every parameter has the right type, the enum values and the official description.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/):

1. **Settings → Community Nodes → Install**
2. Enter `n8n-nodes-brevo-full` and click **Install**

## Credentials

Create a **Brevo (Full API) API** credential:

| Field | Description |
|---|---|
| **Authentication** | `API Key` (header `api-key`) or `OAuth Access Token` (header `Authorization: Bearer …`) |
| **API Key** | Brevo → *Settings → SMTP & API → API Keys* |
| **Base URL** | Default `https://api.brevo.com/v3` |

The credential test calls `GET /account`.

## Nodes

### Brevo (Full API)

- **Resource / Operation** for every API endpoint. Each operation shows the official Brevo description, method and path.
- **Required parameters** appear as dedicated fields. Optional ones are grouped under *Query Parameters* and *Body Fields*, with types, enums (dropdowns) and descriptions.
- Complex fields (objects, arrays of objects) are JSON fields, and the description includes an example of the expected structure.
- Lists of IDs, emails and so on accept a comma-separated list, a JSON array or an expression that returns an array.
- **Return All** on paginated endpoints (`limit`/`offset`) fetches every page automatically.
- **File upload** (contact/company/deal imports, CRM files) from an n8n binary field, sent as `multipart/form-data`.
- **File download** (e.g. inbound attachments): the response is returned as binary data.
- **Options** available on every operation: *Extra Body (JSON)*, *Extra Query Parameters (JSON)*, *Return Full Response*, *Split Arrays Into Items*, *Max Pages*.
- **Custom API Call**: free method + path + query + JSON body, for endpoints Brevo adds in the future.
- `usableAsTool`: the node can be used as a tool by n8n AI agents.

### Brevo (Full API) Trigger

Registers a webhook on Brevo automatically when the workflow is activated, and removes it when the workflow is deactivated:

- type **Transactional**, **Marketing** or **Inbound**, with the events to listen to
- options: *Batched*, *Channel* (email/SMS), *Description*, *Auth Token* (Bearer token checked on incoming calls)

## Resources

| Resource | Operations |
|---|---|
| **Account** | 2 |
| **Balance (Loyalty)** | 18 |
| **Company (CRM)** | 11 |
| **Consent Group** | 5 |
| **Contact** | 30 |
| **Conversation** | 10 |
| **Coupon** | 5 |
| **Custom Object** | 4 |
| **Deal (CRM)** | 11 |
| **Domain** | 5 |
| **E-Commerce** | 18 |
| **Email Campaign** | 13 |
| **Event** | 3 |
| **External Feed** | 5 |
| **File (CRM)** | 5 |
| **Inbound Parsing** | 3 |
| **Master Account** | 26 |
| **Note (CRM)** | 5 |
| **OAuth** | 1 |
| **Payment** | 3 |
| **Process** | 2 |
| **Program (Loyalty)** | 12 |
| **Reward (Loyalty)** | 10 |
| **Sender** | 7 |
| **SMS Campaign** | 10 |
| **SMS Template** | 1 |
| **Task (CRM)** | 6 |
| **Tier (Loyalty)** | 10 |
| **Transactional Email** | 22 |
| **Transactional SMS** | 5 |
| **Transactional WhatsApp** | 2 |
| **User** | 6 |
| **Wallet (Loyalty)** | 1 |
| **Webhook** | 6 |
| **WhatsApp Campaign** | 9 |
| **Custom API Call** | any endpoint |

The full list of operations with method and path is in [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Development

```bash
npm install
npm run build      # compile into dist/
npm test           # tests (node:test + tsx): each of the 292 operations is checked against a mock
```

### Regenerating operations from a new Brevo SDK release

```bash
git clone --depth 1 https://github.com/getbrevo/brevo-node ../brevo-node
npm run generate -- ../brevo-node
npm test
```

The generator (`scripts/generate-operations.js`) parses the SDK clients with the TypeScript compiler and rewrites `nodes/Brevo/operations.generated.ts` and `docs/OPERATIONS.md`. Do not edit those files by hand.

### Local test in n8n

```bash
npm run build && npm link
cd ~/.n8n/custom && npm link n8n-nodes-brevo-full
n8n start
```

## License

MIT
