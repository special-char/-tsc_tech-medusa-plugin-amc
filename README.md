<h1 align="center">
  🛠️ Medusa Annual Maintenance Contract (AMC) Plugin 🛠️
</h1>

<p align="center">
  <strong>🏭 Transform your product maintenance into a seamless service experience 🔧</strong>
</p>

<p align="center">
  <a href="https://github.com/special-char/-tsc_tech-medusa-plugin-amc/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Medusa AMC Plugin is released under the MIT license." />
  </a>
  <a href="https://github.com/special-char/-tsc_tech-medusa-plugin-amc/contribute">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

<p align="center">
  🚀 Boost Revenue | 🤝 Enhance Customer Loyalty | ⚡ Automate Maintenance | 📈 Scale Services
</p>

---

## ✨ Features

### 🎯 Core Capabilities

- 📝 Create & manage maintenance contracts
- 🔄 Automated contract lifecycle management
- 💳 Flexible pricing & billing
- 📊 Comprehensive reporting
- 🔔 Smart notifications system

### 🚀 For Your Business

- 📈 Increase recurring revenue
- 🤝 Improve customer retention
- ⚡ Automate maintenance scheduling
- 📱 Enhanced customer experience

### 💪 For Your Customers

- 🛡️ Guaranteed maintenance support
- ⏰ Priority service response
- 💰 Predictable maintenance costs
- 🎯 Customized service plans

---

## 🚀 Quick Start

### 📦 Installation

```bash
npm install @tsc_tech/medusa-plugin-amc
# or
yarn add @tsc_tech/medusa-plugin-amc
```

### ⚙️ Configuration

```javascript
// medusa-config.js
module.exports = {
  plugins: [
    // ... other plugins
    {
      resolve: "@tsc_tech/medusa-plugin-amc",
      options: {
        // plugin options (if any)
      },
    },
  ],
};
```

### 🔥 Initialize

```bash
npx medusa db:migrate
```

---

## 💡 Key Features Explained

### 1. 📋 Contract Management

- Create customized AMC plans
- Set flexible durations
- Track contract status

### 2. 🛒 Storefront Integration

#### AMC API Endpoints

1. **List All AMCs**

```bash
# Using curl
curl -X GET "http://localhost:9000/store/amc?limit=50&offset=0" \
-H "Content-Type: application/json"

# Direct endpoint
GET /store/amc
```

Query Parameters:

- `limit`: Number of items to return (default: 50)
- `offset`: Number of items to skip (default: 0)

Response:

```json
{
  "amc": [...],
  "count": number,
  "limit": number,
  "offset": number
}
```

2. **Get AMC by Variant ID**

```bash
# Using curl
curl -X GET "http://localhost:9000/store/amc/variant_123" \
-H "Content-Type: application/json"

# Direct endpoint
GET /store/amc/{variantId}
```

Response:

```json
{
  "amc": [...],
  "count": number,
  "limit": number,
  "offset": number
}
```

3. **Add AMC to Cart Line Item**

```bash
# Using curl
curl -X POST "http://localhost:9000/store/add-amc-to-cart-line-item" \
-H "Content-Type: application/json" \
-d '{
  "cart_id": "cart_123",
  "variant_id": "variant_456",
  "amc_id": "amc_789",
  "order_line_item_id": "ordli_101",
  "quantity": 1
}'

# Direct endpoint
POST /store/add-amc-to-cart-line-item
```

Request Body:

```json
{
  "cart_id": "cart_123",
  "variant_id": "variant_456",
  "amc_id": "amc_789",
  "order_line_item_id": "ordli_101",
  "quantity": 1
}
```

3. **Get Customer Warranties**

```bash
# Using curl
curl --location 'http://localhost:9010/store/customer-warranties?variant_id=variant_01JQ950S0REDQXND3CKZ3TF7S0&order_line_item_id=ordli_01JQEAND0D686JR9VH8JRZN6Z6' \
--header 'x-publishable-api-key: <your_publishable_api_key>' \
--header 'Authorization: Bearer <your_token>'
```

Query Parameters:

- `variant_id`: The ID of the product variant.
- `order_line_item_id`: The ID of the order line item.

Headers:

- `x-publishable-api-key`: Your publishable API key.
- `Authorization`: Bearer token for authentication.

Response:

```json
[
  {
    "customer_id": "cus_01234567890",
    "variant_id": "variant_01234567890",
    "order_line_item_id": "ordli_01234567890",
    "start_date": "2025-03-28T12:12:09.704Z",
    "end_date": "2025-04-27T12:12:09.704Z",
    "isWarrantyAvailable": true,
    "details": [
      {
        "start_date": "2025-03-28T12:12:09.704Z",
        "end_date": "2025-04-27T12:12:09.704Z",
        "id": "warranty_01234567890",
        "duration_days": 30,
        "order_id": "order_01234567890",
        "product_id": "prod_01234567890",
        "amc_id": "",
        "created_at": "2025-03-28T12:12:09.704Z",
        "updated_at": "2025-03-28T12:12:09.704Z",
        "deleted_at": null
      },
      {
        "start_date": "2025-04-27T12:12:09.704Z",
        "end_date": "2026-04-27T12:12:09.704Z",
        "id": "warranty_09876543210",
        "duration_days": 365,
        "order_id": "order_09876543210",
        "product_id": "prod_01234567890",
        "amc_id": "amc_01234567890",
        "created_at": "2025-03-28T12:12:56.027Z",
        "updated_at": "2025-03-28T12:12:56.027Z",
        "deleted_at": null
      }
    ]
  }
]
```