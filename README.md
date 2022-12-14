# hotreload
Nodejs projet hot reloader - reload your packages, files and caches easily.

# Install

<div align="center">
  <p>
    <a href="https://nodei.co/npm/hotreload/"><img src="https://nodei.co/npm/hotreload.png?downloads=true&stars=true" alt="https://npmjs.com/hotreload" /></a>
  </p>
</div>

```
npm i hotreload
```

## Import-able Functions

```js
const { hotReload, Utils } = require("hotreload");
```

 - `hotReload` **Function(hotReloadOptions)**
 - `Utils` : **all Util Functions**:
    - `loadAllPaths(paths, functionPaths)`, -> for Each Path: require(path) + execute the first callbackFunction of where the pathGlob matches the current path
    - `filterStrings(str)` -> matching function to filter an array to only contain valid strings,

## hotReloadOptions: 

```ts
interface hotReloadOptions {
    excluded?: string[];
    onlyReload?: string[];
    functionsToLoad?: { pathGlob: string, callbackFunction: string }[];
}[];
```

 - `excluded` **string[]** --> array of string-globs to **not reload** file-paths matching that glob
 - `onlyReload` **string[]** --> array of string-globs to **only reload** file-paths matching that glob | Default: "*" aka everything
 - `functionsToLoad` **reloadFunctionObject[]** --> array of string-gl
    - `functionsToLoad reloadFunctionObject` :
        - `pathGlob`: **string** --> string-glob to **execute** the callbackFunction
        - `callbackFunction`: **Function(path, pull)** -> callback Function to execute, once the pathGlob is matching

## hotReload Return data

```ts
interface hotReloadReturnData {
    success: string[]; // strings of paths which were "successful"
    failed: { path: string, error: TypeError }[]; // path + error for each "failed" reload
}
```

## Why are functionsToLoad useful?

 - You can easily execute scripts upon specific Path-Globs
 - With that you can update Caches / Savings of pulls
 - With that you can technically restart express apps too!
 - You could restart websocket-/EventEmitter listeners (make sure to clear them first)

## Example-Usage

```js
const { hotReload } = require("hotreload");

const res = await hotReload({
    excluded: [ "**/node_modules/**" ], // don't reload stuff with node_modules in path
    onlyReload: [ "**/*.js", "**/*.json" ], // only reload stuff which ends with *.js or **/*.json
    functionsToLoad: [ // array of objects, with pathGlobs, and callbackFunction, which get's executed when the pathGlob match is true
        {
            pathGlob: "**/exports/**/*.js", callbackFunction: (path, pull) => { // pull = require(path);
                if(path.includes("defaults")) pull.default(); // you can execute any functions from that pull:  module.exports = { default: () => {} }
                else pull(); // or even direct execute the pull. if that file: module.exports = () => { ... };
            }
        }
    ]
})
console.log(`Successfully reloaded ${res.success.length} Paths, and failed on ${res.failed.length}`)
res.failed.forEach(data => console.error(data));
```

### Example Usage - Discord Bot

```js
const { hotReload } = require("hotreload");
// if you reload events / listeners, make sure to clear them first!
await client.removeAllListeners();
// reloader function
const res = await hotReload({ // don't reload the node_modules, the bot.js and the sharder Files 
    excluded: ["**/node_modules/**", `${process.cwd()}/bot.js`, `${process.cwd()}/Shard.js`], 
    onlyReload: [ "**/*.js", "**/*.json" ], // reload .js and .json files
    functionsToLoad: [ 
        {   // simple execute "module.exports () => {}" functions with parameters
            pathGlob: `${process.cwd()}/extenders/**`, callbackFunction: (path, pull) => pull(client) // pull = require(path)
        }, 
        {   // store pull data in a cache, + use the path to get the filename (aka eventName) + then execute the requirement
            pathGlob: `${process.cwd()}/events/**`, callbackFunction: (path, event) => { // pull = require(path)
                const eventName = path.split("/").pop().replace(".js", "");
                client.eventPaths.set(eventName, { eventName, path: resolve(path) });
                event(client);
            } 
        }, 
        {   // just update the cache for client.commands, with the pull ;)
            pathGlob: `${process.cwd()}/commands/**`, callbackFunction: (path, cmd) => client.commands.set(cmd.name, cmd); // const pull = require(path);
        },
    ]
});
console.log(res, res.success.length, res.failed.length)
```

### Example Video

https://user-images.githubusercontent.com/68145571/195047254-f17040d5-3e19-412c-bd26-a596d076870f.mp4
