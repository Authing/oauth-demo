const koa = require("koa");
const koaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const axios = require("axios");
const qs = require('querystring')
const app = new koa();
const router = new koaRouter();

const port = 8888
const appId = "<APP_ID>";
const appSecret = "<APP_SECRET>";
const redirect_uri = `http://localhost:${port}/oauth/handle`

// Authing 控制台 redirect_uri 可以填下面这个。本示例 code 换 token，token 换用户信息都在后端完成。code 由 Authing 以 url query 的形式发到 redirect_uri。
router.get("/oauth/handle", async (ctx, next) => {
  let code = ctx.query.code;
  // code 换 token
  let code2tokenResponse
  try {
    code2tokenResponse = await axios.post(
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
  } catch (error) {
    ctx.body = error.response.data
    return
  }
  let { access_token, refresh_token } = code2tokenResponse.data;
  // token 换用户信息
  let token2UserInfoResponse = await axios.get("https://users.authing.cn/oauth/user/userinfo?access_token=" + access_token);

  // 这里可以操作用户信息，比如存入数据库
  // ...
  // 把用户重定向到前端登录处理页，携带 id_token，前端需要把这里的 id_token 保存，以后访问受保护资源时要携带

  // 获取 refresh_token
  let refreshTokenRes
  try {
    refreshTokenRes = await axios.post(
      'https://sso.authing.cn/sso/token',
      qs.stringify({
        app_id: appId,
        app_secret: appSecret,
        refresh_token,
        grant_type: "refresh_token"
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    )
  } catch (error) {
    console.log(error)
    ctx.body = error.response.data
    return
  }

  ctx.body = {
    'code -> access_token response': code2tokenResponse.data,
    'access_token -> userInfo response': token2UserInfoResponse.data,
    'refresh_token': refreshTokenRes.data
  }
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);
console.log(`App listening at http://localhost:${port}`)