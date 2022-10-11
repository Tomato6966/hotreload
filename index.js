const { resolve } = require("path");
const minimatch = require("minimatch")

/**
 * @param {string} path the path of the file
 * @param {any} pull const pull = require(path);
 * @typedef {(path: string, pull:any) => void} callbackFunction
 */

/**
 * @typedef {{ success: string[], failed: { error: TypeError, path: string }[] }} returnValue
 * @typedef {{ fnOptions?: params[], callbackFunction?: callbackFunction, pathGlob: string }} reloadFunction
 * @typedef { { excluded?: string[], onlyReload?: string[], functionsToLoad?: reloadFunction[] } } reloadOptions
 */

/**
 * @param {*} paths 
 * @param {reloadFunction[]} functionPaths 
 * @returns {returnValue} Reload Information
 */
async function loadAllPaths(paths, functionPaths = []) {
    const success = [];
    const failed = [];
    await Promise.all(
        paths.map(async (path) => {
            try {
                delete require.cache[resolve(path)];
                const pull = require(resolve(path));
                const reloadFunction = functionPaths.find(x => minimatch(path, x.pathGlob, { matchBase: true, dot: true }))
                if(reloadFunction && reloadFunction.fnOptions) path(...(reloadFunction.fnOptions || []));
                else if(reloadFunction && reloadFunction.callbackFunction) await reloadFunction.callbackFunction(path, pull);
                success.push(path);
            } catch (error) {
                failed.push({ path, error })
            }
        })
    );
    return { success, failed };
}
/**
 * Mapping function for filtering strings
 * @param {any} x 
 * @returns {boolean} true if It's a string
 */
const filterStrings = (x) => typeof x === "string" && x.length;

/**
 * @param {reloadOptions} options 
 * @return {returnValue}
 */
const hotReload = async (options = {}) => {
    const excluded = options.excluded?.filter?.(filterStrings) ?? [];
    const onlyReload = options.onlyReload?.filter?.(filterStrings) ?? ["*"];
    const functionsToLoad = options.functionsToLoad?.filter?.(x => typeof x?.pathGlob == "string" && x?.pathGlob?.length);
    const toReload = [];
    const paths = Object.values(require.cache).map(x => x.filename)
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
