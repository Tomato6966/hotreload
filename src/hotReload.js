const minimatch = require("minimatch");
const { loadAllPaths, filterStrings } = require("../utils/utils.js");

/**
 * @typedef { (path: string, pull:any) => void } callbackFunction
*/

/**
 * @typedef {{ success: string[], failed: { error: TypeError, path: string }[] }} returnValue
 * @typedef {{ fnOptions?: params[], callbackFunction?: callbackFunction, pathGlob: string }} reloadFunction
 * @typedef { { excluded?: string[], onlyReload?: string[], functionsToLoad?: reloadFunction[] } } reloadOptions
*/

/**
 * @param {reloadOptions} options 
 * @return {returnValue}
 */
const hotReload = async (options = {}) => {
    const excluded = options.excluded?.filter?.(filterStrings) ?? [];
    const onlyReload = options.onlyReload?.filter?.(filterStrings) ?? ["*"];
    const functionsToLoad = options.functionsToLoad?.filter?.(x => typeof x?.pathGlob == "string" && x?.pathGlob?.length);
    const toReload = [];
    const paths = Object.values(require.cache).map(x => x.filename).sort((a,b) => {
        const y = b.endsWith(".json");
        const x = a.endsWith(".json");
        return (x === y) ? 0 : x ? -1 : 1
    })
    if(!onlyReload.length) throw new SyntaxError("No paths to reload since onlyReload is empty")
    for await(const path of paths) {
        if(excluded.length && excluded.some(glob => minimatch(path, glob, { matchBase: true, dot: true }))) continue
        // if it's not inside a onlyReload glob
        if(!onlyReload.length || !onlyReload.some(glob => minimatch(path, glob, { matchBase: true, dot: true }))) continue;
        toReload.push(path);
    }
    const returnVal = await loadAllPaths(toReload, functionsToLoad);
    return returnVal
}
module.exports = {
    hotReload
}
