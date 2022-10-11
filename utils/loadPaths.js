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
 */

/**
 * @param {*} paths 
 * @param {reloadFunction[]} functionPaths 
 * @returns {returnValue} Reload Information
 */
const loadAllPaths = async (paths, functionPaths = []) => {
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

module.exports = {
    loadAllPaths, filterStrings
}