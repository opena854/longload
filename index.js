
import http from 'http'
import express from "express"
import { read, set } from "./src/worker.js";
import { env } from 'process';

const app = express()

const config = {
  servicePort: env.PORT || 3000,
  externalCacheService: env.CACHE_SERVICE || undefined,
  launchPriceService: env.PRICE_SERVICE || true
}

const asBool = value => typeof value === "string" ? (value.toLowerCase() === "true" || value === "1") : !!value

const getExternalPrice = async numberPlate => {
  console.log(`getExternalPrice("${numberPlate}") query`);
  const secondsDelay = 10
  const randomPrice = Math.floor((1 + Math.random()) * 100) * 100
  return new Promise(r => setTimeout(() => {
    console.log(`getExternalPrice("${numberPlate}") reponse`);
    r({plate: numberPlate, price: randomPrice})
  }, secondsDelay * 1000));
}

if (!config.externalCacheService) { //serves it's own cache services since it's not defined in config.
  app.put('/cache', ({ query: {plate, price} }, res) => set(plate, price).then( () => res.send().end()))

  app.get('/cache', ({ query: {plate, skipCache} }, res) => read(plate, asBool(skipCache)).then( result => res.send(result).end()))
}

if (config.launchPriceService) {
  app.get("/price", ({ query: {plate, skipCache = true} }, response) => {
    console.log(`getPrice("${plate}", ${asBool(skipCache)}) call`);
    const cacheService = new URL(
      config.externalCacheService || "http://localhost:3000/cache"
    );

    cacheService.searchParams.set("plate", plate);
    cacheService.searchParams.set("skipCache", asBool(skipCache));

    let output = "";

    http.request(cacheService, { method: "GET" }, res => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => (output += chunk));
      res.on("end", () => {
        let obj = JSON.parse(output);

        if (obj?.status === "found") {
          console.log(`getPrice("${plate}", ${asBool(skipCache)}) response: ${Number(obj?.value)}`);
          response.send({ plate: plate, price: Number(obj?.value) });
        }
        else if (obj?.status === "not found") {
          getExternalPrice(plate).then((result) => {
            cacheService.searchParams.delete("skipCache");
            cacheService.searchParams.set("price", result.price);

            http.request(cacheService, { method: "PUT" }, () => {
              //console.log("cache refreshed");
              console.log(`getPrice("${plate}", ${asBool(skipCache)}) response: ${result.price}`);
              response.send(result);
            }).end();
          });
        }
      });
    }).end();
  });
}

app.listen(config.servicePort, () => {
  console.log(`Service listening on port ${config.servicePort}`);
});


