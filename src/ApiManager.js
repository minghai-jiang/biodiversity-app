const apiUrl = "https://api.ellipsis-earth.com";
//const apiUrl = "https://dev.api.ellipsis-earth.com";
// const apiUrl = "http://localhost:7552";

const ApiManager = {
  fetch: async (method, url, body, user) => {

    url = `${apiUrl}${url}`;

    let headers = {};

    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    if (user) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    let gottenResponse = null;
    let isJson = false;
    let isText = false;

    let options = {
      method: method,
      headers: headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return await fetch(url, options)
      .then(response => {
        gottenResponse = response;        

        let contentType = response.headers.get('Content-Type');
        isJson = contentType.includes('application/json');
        isText = contentType.includes('text/plain');

        if (isJson) {
          return response.json();
        }
        else if (isText) {
          return response.text();
        }
        else {
          return response.blob();
        }
      })
      .then(result => {
        if (gottenResponse.status === 200) {
          return result
        }
        else {
          if (!isText) {
            throw result;
          }
          else {
            throw {
              status: gottenResponse.status,
              message: result
            };
          }
        }
      })
  }
};

export default ApiManager;