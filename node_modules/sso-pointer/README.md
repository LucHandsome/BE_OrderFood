<p align="center">
  <a href="https://auth.pointer.io.vn/" target="blank"><img src="https://i.imgur.com/5cYzRrm.png" width="120" alt="Pointer Logo" /></a>
</p>

# OAuth Pointer Node.js Library

**[OAuth Pointer Github](https://github.com/nguynthuhigh/sso-pointer-npm)**

# Installation

```
npm install oauth-pointer
# or
yarn add oauth-pointer
```

# Usage

```javascript
const { PointerStrategy } = require("sso-pointer");
const pointer = new PointerStrategy(
  process.env.POINTER_CLIENT_ID,
  process.env.POINTER_CLIENT_SECRET
);

const data = await pointer.getAccessToken(code);
// {
//   accessToken: 'eyJhbGciOiJSUz.......',
//   user: { _id: '66f18f7c2c298da02e857d85', email: 'admin@pointer.com',image:'image.url.com',name:'Admin' }
// }
//Verify token
const payload = await pointer.verifyAccessToken(accessToken);
console.log(payload);
```
