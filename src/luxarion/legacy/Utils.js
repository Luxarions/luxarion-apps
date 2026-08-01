/**
 * Legacy Adapter for Luxarion Engine Utils.
 * Adapts legacy function signatures to modern Utils module.
 * 
 * @module LegacyUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

import Utils from '../utils/index.js';

export const LegacyUtils = {
    // Legacy Array functions
    arrayChunk: Utils.ArrayUtils.chunk,
    arrayUnique: Utils.ArrayUtils.unique,
    
    // Legacy Serialize
    toJSON: Utils.SerializeUtils.serialize,
    fromJSON: Utils.SerializeUtils.deserialize,

    // Legacy Type checking
    isObj: Utils.TypeUtils.isObject,
    isStr: Utils.TypeUtils.isString,
    isNum: Utils.TypeUtils.isNumber,

    // Modern Utils reference
    modern: Utils
};

export default LegacyUtils;
