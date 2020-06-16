let request = require("request");

let server = "http://10.0.0.100/content/";

function setServerData(baseUrl, port) {
  server = `${baseUrl || 'http://10.0.0.100'}:${port || 80}/content/`;
}

function http(url) {
  return new Promise((resolve, reject) => {
    request.get({url: server + url}, (error, res, body) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(body);
    });
  });
}

module.exports = {http, setServerData};
