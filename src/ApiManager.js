// const apiUrl = "https://api.ellipsis-earth.com";
const apiUrl = "https://dev.api.ellipsis-earth.com";
// const apiUrl = "http://localhost:7552";

const ApiManager = {
  apiUrl: apiUrl,

  accessLevels: {
    viewMap: 100,
    aggregatedData: 200,
    viewGeoMessages: 300,
    addGeoMessages: 400,
    addGeoMessageImage: 410,
    addCustomPolygons: 500,
    deleteGeomessages: 600,
    alterOrDeleteCustomPolygons: 700,
    forms: 750,
    customPolygonLayers: 800,
    userManagement: 900,
    owner: 1000,
  
    mapPublicLevelOne: 300, // viewGeoMessages
    mapPublicLevelTwo: 500, // addCustomPolygons
  
    min: 0,
    max: 1000
  },

  get: async (url, body, user) => {
    return apiManagerFetch('GET', url, body, user);
  },

  post: async (url, body, user) => {
    return apiManagerFetch('POST', url, body, user);
  },

  fetch: (method, url, body, user) => {
    return apiManagerFetch(method, url, body, user);
  }
};

async function apiManagerFetch(method, url, body, user) {

  let a = apiUrl;

  if (url === `/data/spectral/tile/timestamps`) {
    a = 'https://api.ellipsis-earth.com';
  }

  url = `${a}${url}`;

  let headers = {};

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (user) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  let gottenResponse = null;
  let isText = false;
  let isJson = false;

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

      isText = contentType.includes('text');
      isJson = contentType.includes('application/json');

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

export default ApiManager;