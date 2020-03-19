# oauth-demo

详情请见文档：[接入 OAuth 2.0 - Authing 官方文档](https://docs.authing.cn/authing/authentication/oauth2)

## 如何运行

```
$ yarn
$ node index.js
```

## Demo 及原理讲解

### 基础配置

```javascript
const port = 8888
const appId = "OAuth 应用 AppId";
const appSecret = "OAuth 应用 AppSecret";
const redirect_uri = `http://localhost:${port}/oauth/handle`
```

![](https://cdn.authing.cn/blog/20200319182216.png)

- appId 填入 OAuth 应用的 AppId
- appSecret 填入 OAuth 应用的 AppSecret
- 将 OIDC 应用的回调 URL 设置为本项目的 `/oauth/handle` 接口，如 `http://localhost:8888/oauth/handle`

### 使用 Guard 登录获取 Code

点击体验登录访问 Guard 在线地址：

![](https://cdn.authing.cn/blog/20200319182532.png)

成功登录之后，将会回调到本项目到 `/oauth/handle`，并且在 Get 请求参数中携带 code。

### 使用 Code 换 Token

```javascript
const qs = require('querystring')
const code2tokenResponse = await axios.post(
  "https://sso.authing.cn/token",
  qs.stringify({
    code,
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirect_uri
  }),
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
```

有几点需要注意：
- `Content-Type` 为 `application/x-www-form-urlencoded`，非 `application/json`
- Post Body 要转成 `var1=xx&var2=xxx` 的格式。（`qs.stringify()`）

### 使用 Token 换用户信息

```javascript
  let token2UserInfoResponse = await axios.get("https://users.authing.cn/oauth/user/userinfo?access_token=" + access_token);
```

返回的标准 OIDC 用户信息格式如下：

```json
{
  "thirdPartyIdentity": {
    "updatedAt": "2020-03-12T15:24:22.332Z"
  },
  "email": "changjiangthecoder@gmail.com",
  "phone": "",
  "emailVerified": false,
  "phoneVerified": false,
  "username": "17670416754",
  "nickname": "",
  "company": "",
  "photo": "https://usercontents.authing.cn/authing-avatar.png",
  "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
  "device": "",
  "loginsCount": 14,
  "registerMethod": "default:username-password",
  "blocked": false,
  "isDeleted": false,
  "oauth": "",
  "phoneCode": "",
  "name": "17670416754",
  "givenName": "",
  "familyName": "",
  "middleName": "",
  "profile": "",
  "preferredUsername": "",
  "website": "",
  "gender": "",
  "birthdate": "",
  "zoneinfo": "",
  "locale": "",
  "address": "",
  "formatted": "",
  "streetAddress": "",
  "locality": "",
  "region": "",
  "postalCode": "",
  "country": "",
  "updatedAt": "",
  "metadata": "",
  "sendSMSCount": 0,
  "sendSMSLimitCount": 1000,
  "_id": "5e6af42080206253f97566c5",
  "registerInClient": "5e6a4a98dee1b66fb488d8d9",
  "lastLogin": "2020-03-19T10:27:19.552Z",
  "signedUp": "2020-03-13T02:46:56.200Z",
  "__v": 0,
  "lastIP": "221.220.51.58"
}
```
