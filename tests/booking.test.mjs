import http from 'http';

function injectPolyfill() {
  globalThis.FormData = class FormData {
    constructor() {
    }
    append(key, value) {
      this[key] = value;
    }
  }
  globalThis.fetch = function _fetch(url, init) {
    return new Promise((res, rej) => {
      function callback(response) {
        let body = ''
        response.on('data', function (chunk) {
          str += chunk;
        });

        response.on('end', function () {
          res({
            body,
            ok: true,
          });
        });

        response.on('error', function () {
          rej({
            body,
            ok: false,
          });
        })
      }
      
      http.request({
        ...init,
        url,
      }, callback);

      
    })
  }
}

async function main() {
  injectPolyfill();

  const mod = await import("../functions/api/v1/booking.js");

  console.log(process.argv);
  console.log(mod);

  const request = {
    body: JSON.stringify({
      "name": "Test Boy",
      "email": "testing@test.com",
      "message": "Help I want an awesome wedding"
    }),
  };

  const env = {
    MAIL_API_TOKEN: "01fe980b0536644f428fd63eef6765e1-1b237f8b-6ea8bdc4",
    MAIL_DOMAIN: "sandbox375bc9cca4c74154b8c715b7ab65590f.mailgun.org",
    MAIL_TARGET: "victoria@etherealelegance.design",
    MAIL_SENDER: "Consultation Manager <postmaster@sandbox375bc9cca4c74154b8c715b7ab65590f.mailgun.org>"
  }

  mod.onRequestPost({ request, env })
}

main();
