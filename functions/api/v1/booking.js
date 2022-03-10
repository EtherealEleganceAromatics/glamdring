const BASE_MAIL_DOMAIN = "https://api.mailgun.net/v3";
const MAIL_API_USER = 'api';

function requestFailure(cause = "An unexpected error occurred") {
  return new Response(cause, { status: 500 });
}

function generateEmailSubject(ctx) {
  return `New Consult Request from ${ctx.name}`;
}

function generateEmailBody(ctx) {
  return `
<html>
<body>
  <h1>You have a new message from ${ctx.name}</h1>
  <br>
  <b>
    ${ctx.message.replace(/\n/g, "<br>")}
  </b>
  <br>
  <p>You can reach them back at <a href="mailto:${ctx.email}">${ctx.email}</a></p>
</body>
</html>
  `;
}

function encodeAuthorization(username, password) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

async function extractBody(request) {
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  } else if (contentType.includes('form')) {
    const formData = await request.formData();
    const formObject = {};
    for (const entry of formData.entries()) {
      formObject[entry[0]] = entry[1];
    }
    return formObject;
  } else {
    throw new Error("Failed to determine content type");
  }
}

export async function onRequestPost(context) {
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params: _params, // if filename includes [id] or [[path]]
    waitUntil: _waitUntil, // same as ctx.waitUntil in existing Worker API
    next: _next, // used for middleware or to fetch assets
    data: _data, // arbitrary space for passing data between middlewares
  } = context;

  const { MAIL_API_TOKEN, MAIL_DOMAIN, MAIL_TARGET, MAIL_SENDER } = env;
  if (!MAIL_API_TOKEN) {
    return requestFailure("MAIL_API_TOKEN validation error");
  }
  if (!MAIL_DOMAIN) {
    return requestFailure("MAIL_DOMAIN validation error");
  }
  if (!MAIL_TARGET) {
    return requestFailure("MAIL_TARGET validation error");
  }
  if (!MAIL_SENDER) {
    return requestFailure("MAIL_SENDER validation error");
  }

  const messageContext = {};
  try {
    const { email, name, message } = await extractBody(request);
    messageContext.email = email;
    messageContext.name = name;
    messageContext.message = message;
  } catch (err) {
    return requestFailure(err.message);
  }

  const formData = new FormData();
  formData.append("from", MAIL_SENDER);
  formData.append("to", MAIL_TARGET);
  formData.append("subject", generateEmailSubject(messageContext));
  formData.append("html", generateEmailBody(messageContext));
  
  const init = {
    body: formData,
    headers: {
      authorization: encodeAuthorization(MAIL_API_USER, MAIL_API_TOKEN),
    },
    method: "POST",
  };
  const url = `${BASE_MAIL_DOMAIN}/${MAIL_DOMAIN}/messages`;

  console.info(`${init.method}ing to ${url} using auth '${init.headers.authorization}' with form data: \n${JSON.stringify(formData, null, 2)}`);
  const res = await fetch(url, init);

  console.info(`Response was ok? ${res.ok}`);

  if (!res.ok) {
    const message = await res.text();
    return requestFailure(`Mail API response error\n${message}`);
  }

  return new Response('Success', { status: 303, headers: { 'location': 'https://etherealelegance.design/#'} });
}
