# Pointer Wallet Node.js Library

# Installing

```
npm install pointer-wallet
# or
yarn add pointer-wallet
```

# Documentation

# Usage

> [!NOTE]
> The package needs a secret key to configure, which you can get at **[Pointer Wallet Dashboard](https://pointer.io.vn/)**

```typescript
import { Pointer } from "pointer-wallet";
const pointerPayment = new Pointer(process.env.POINTER_SECRET_KEY);

class PointerServices {
  static async createOrder() {
    await pointerPayment.createPayment({
      amount: 500000,
      currency: "VND",
      message: "Payment with Pointer",
      userID: "uuid-123",
      orderID: "uuid-123",
      returnUrl: "string",
      orders: [
        {
          name: "Apple",
          image: "url",
          description: "Apple apple",
          quantity: 10,
          price: 25000,
        },
        {
          name: "Coconut",
          image: "url",
          description: "Coconut coconut, i need it",
          quantity: 10,
          price: 25000,
        },
      ],
    });
  }
}
```

# **[Read more](https://pointer.io.vn/)**
