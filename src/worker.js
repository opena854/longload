
export const cache = {}
export const precache = {}

const sleep = async ms => new Promise(r => setTimeout(r, ms));

export const read = async (key, skipCache = true) => {
    //console.log(cache, precache)
    return new Promise( resolve => {
        
        if (!skipCache && !!cache[key]) resolve ({status: "found", value: cache[key]})
        else if (!!precache[key]) precache[key].then( (result) => resolve({status: "found", value: result}) )
        else {
            //console.log("it's gonna be read and should be precached.")
            const oldcachestatus = cache[key] //saving oldstatus for scenario where cache and precache exits
            precache[key] = new Promise ( async (resolve, reject) => {
                let tic = 60
                
                while (tic--) {
                    //console.log("waiting for cache... ", tic)
                    if (cache[key] !== oldcachestatus) {
                        //console.log("found price", cache[key])
                        resolve (cache[key]);
                        delete precache[key]
                        return;
                    } 
                    await sleep(1000);   
                }
                reject ("timeout");

            }).catch( console.log )

            resolve({status: "not found"})
        }
    })
}

export const set = async (key, value) => cache[key] = value

