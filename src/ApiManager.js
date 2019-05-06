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

        return response.json();
      })
      .then(jsonResult => {
        if (gottenResponse.status === 200) {
          return jsonResult
        }
        else {
          throw jsonResult;
        }
      })
  }
};

export default ApiManager;