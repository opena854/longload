
export const cache = {}
export const precache = {}

const TIMEOUT = 120

const sleep = async ms => new Promise(r => setTimeout(r, ms));

export const read = async (key, skipCache = true) => new Promise( resolve => {
        
        if (!skipCache && !!cache[key]) resolve ({status: "found", value: cache[key].value})
        else if (!!precache[key]) precache[key].then( (result) => resolve({status: "found", value: result}) )
        else {
            const oldCacheStatus = cache[key] //saving oldstatus for scenario where cache and precache exits
            precache[key] = new Promise ( async (precacheResolve, reject) => {
                let tic = TIMEOUT * 2
                
                while (tic--)
                    if (cache[key] !== oldCacheStatus) {
                        precacheResolve (cache[key].value);
                        delete precache[key]
                        return;
                    } 
                    else await sleep(500);   
                reject ("timeout");

            }).catch( console.log )

            resolve({status: "not found"})
        }
    })

export const set = async (key, value) => cache[key] = { value, ts: new Date() } 

