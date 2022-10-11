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
    const reloadFunctionPaths = []
    await Promise.all(
        paths.map(async (path) => {
            try {
                delete require.cache[resolve(path)];
                const pull = require(resolve(path));
                const reloadFunction = functionPaths.find(x => minimatch(path, x.pathGlob, { matchBase: true, dot: true }))
                if(reloadFunction && reloadFunction.callbackFunction) reloadFunctionPaths.push({ callbackFunction: reloadFunction.callbackFunction, path, pull });
                success.push(path);
            } catch (error) {
                failed.push({ path, error })
            }
        })
    );
    // execute callbacks AFTER everything is reloaded.
    await Promise.all(
        reloadFunctionPaths.map(async ({path, pull, callbackFunction }) => {
            try {
                await callbackFunction(path, pull);
            } catch (error) {
                const index = success.indexOf(path);
                if(index >= 0) success.splice(index, 1);
                failed.push({
                    path, error
                })
            }
        })
    )
    return { success, failed };
}

/**
 * Mapping function for filtering strings
 * @param {string|any} str 
 * @returns {boolean} true if It's a string
 */
const filterStrings = (str) => typeof str === "string" && str.length;

module.exports = {
    loadAllPaths, filterStrings
}