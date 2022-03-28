import http from 'http'
import express from "express"
import { read, set } from "./src/cache.js";
import { env } from 'process';

const app = express()

const config = {
  servicePort: env.PORT || 3000,
  cacheService: env.CACHE_SERVICE || `http://localhost:${env.PORT || 3000}/cache`,
  launchPriceService: env.PRICE_SERVICE || true
}

if (!config.externalCacheService) { //serves it's own cache service since it's not defined in config.
  app.get('/cache', ({ query: {plate, skipCache} }, res) => read(plate, asBool(skipCache)).then( result => res.send(result).end()))
  app.put('/cache', ({ query: {plate, price} }, res) => set(plate, price).then( () => res.send().end()))
}

if (config.launchPriceService) {
  app.get("/price", ({ query: {plate, skipCache = true} }, response) => getPrice(plate, skipCache).then( result => response.send(result) ));
}

app.listen(config.servicePort, () => {
  console.log(`Service listening on port ${config.servicePort}`);
});

const asBool = value => typeof value === "string" ? (value.toLowerCase() === "true" || value === "1") : !!value

const getPrice = (plate, skipCache = true) =>
  callService(
    config.cacheService,
    { method: "GET" },
    { plate, skipCache: asBool(skipCache) }
  ).then(({ status, value }) =>
    status === "found"
      ? { plate, price: Number(value) }
      : getExternalPrice(plate).then((result) =>
          callService(
            config.cacheService,
            { method: "PUT" },
            { plate, price: result.price }
          ).then(() => result)
        )
  );

const callService = (url, options= {}, query = {} ) => new Promise( r => {
  const urlObj = (url instanceof URL) ? url : new URL(url)
  Object.entries(query).forEach( (keyval) => urlObj.searchParams.append(...keyval))

  let output = ""
  http.request(urlObj, options, res => {
    if (res.headers['content-length'] > 0) {
      res.setEncoding("utf8");
      res.on("data", (chunk) => (output += chunk));
      res.on("end", () => r(JSON.parse(output)))
    } else {
      r(undefined)
    }
    
  }).end()
})
  
const getExternalPrice = async numberPlate => {
  //console.log(`getExternalPrice("${numberPlate}") query`);
  const secondsDelay = 7
  const randomPrice = Math.floor((1 + Math.random()) * 100) * 100
  return new Promise(r => setTimeout(() => {
    //console.log(`getExternalPrice("${numberPlate}") reponse`);
    r({plate: numberPlate, price: randomPrice})
  }, secondsDelay * 1000));
}
