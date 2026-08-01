/**
 * Primary package entry point for Luxarion Engine.
 * 
 * @module LuxarionEngine
 * @author Luxarion Labs
 * @version 1.0.0
 */

import Luxarion, { LuxarionEngine } from './core/Luxarion.js';
import * as Constants from './core/Constants.js';
import version from './core/Version.js';
import * as Types from './core/Types.js';
import Container from './core/Container.js';
import Utils, {
    ArrayUtils,
    ConsoleUtils,
    ConsoleLogger,
    AsyncUtils,
    SerializeUtils,
    TypeUtils,
    ErrorUtils,
    MatrixUtils,
    DOMUtils,
    SecurityCybork
} from './utils/index.js';

const { ServiceLifetime, LogLevel, LuxarionError } = Types;

export {
    Luxarion,
    LuxarionEngine,
    Constants,
    version,
    Types,
    Container,
    Utils,
    ArrayUtils,
    ConsoleUtils,
    ConsoleLogger,
    AsyncUtils,
    SerializeUtils,
    TypeUtils,
    ErrorUtils,
    MatrixUtils,
    DOMUtils,
    SecurityCybork,
    ServiceLifetime,
    LogLevel,
    LuxarionError
};

export default Luxarion;
