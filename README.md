# hotreload
Nodejs projet hot reloader - reload your packages, files and caches easily.

# Example Usage

```js
const { hotReload } = require("hotreloader");
// if you reload events / listeners, make sure to clear them first!
await client.removeAllListeners();
// reloader function
const res = await hotReload({ 
    excluded: ["**/node_modules/**", "**/api/**", `${process.cwd()}/index.js`, `${process.cwd()}/bot.js`, `${process.cwd()}/Cluster.js`], 
    onlyReload: [ "**/*.js", "**/*.json" ],
    functionsToLoad: [
        { 
            pathGlob: `${process.cwd()}/events/**`, callbackFunction: (path, event) => {
                const splitted = resolve(path).split("/")
                const eventName = splitted.reverse()[0].replace(".js", "");
                client.eventPaths.set(eventName, { eventName, path: resolve(path) });
                event(client);
            } 
        }, 
        {  // pull = require(path)
            pathGlob: `${process.cwd()}/extenders/**`, callbackFunction: (path, pull) => pull(client)
        },
        { 
            pathGlob: `${process.cwd()}/commands/**`, 
            callbackFunction: (path, pull) => { // const pull = require(path);
                const cmd = pull;
                const categories = {
                    "administrator":  ["Admin"],
                    "equalizer": ["equalizers", "eq", "eqs", "equalicer", "musicbased", "music"],
                    "moderaton": ["mod"],
                    "player": ["musicbased", "music"],
                    "queue": ["musicbased", "music"],
                    "filter": ["filters", "musicbased", "music"],
                    "setups": ["setup"],
                    "settings": ["setting"],
                    "temporary": ["temp"],
                    "utility": ["util"],
                }
                const splitted = resolve(path).split("/")
                const category = splitted.slice(splitted.indexOf("message") + 1)[0]?.toLowerCase() || "none";
                if(cmd.preCommands?.length) cmd.preCommands.forEach(s => {
                    s.parent = cmd.name
                    s.category = category;
                    s.altCategories = (categories[category] || []);
                });
                client.commands.set(cmd.name, {...cmd, category, altCategories: (categories[category] || []) });
            }
        },
    ]
});
console.log(res, res.success.length, res.failed.length)
```
