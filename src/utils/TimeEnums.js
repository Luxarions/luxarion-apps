/**
 * LXRN TimeEnums Module
 * @namespace LXRN.TimeEnums
 * @author LXRN
 */

/**
 * Time unit enums
 * @class TimeEnums
 */
class TimeEnums {
  static TIME_UNIT_SECOND = 0;
  static TIME_UNIT_MILLISECOND = 1;
  static TIME_UNIT_MICROSECOND = 2;
  static TIME_UNIT_NANOSECOND = 3;

  /**
   * Get unit name
   * @param {number} unit - Unit code
   * @returns {string}
   */
  static getUnitName(unit) {
    const names = {
      [TimeEnums.TIME_UNIT_SECOND]: 'second',
      [TimeEnums.TIME_UNIT_MILLISECOND]: 'millisecond',
      [TimeEnums.TIME_UNIT_MICROSECOND]: 'microsecond',
      [TimeEnums.TIME_UNIT_NANOSECOND]: 'nanosecond',
    };
    return names[unit] || 'unknown';
  }

  /**
   * Get unit abbreviation
   * @param {number} unit - Unit code
   * @returns {string}
   */
  static getUnitAbbrev(unit) {
    const abbrevs = {
      [TimeEnums.TIME_UNIT_SECOND]: 's',
      [TimeEnums.TIME_UNIT_MILLISECOND]: 'ms',
      [TimeEnums.TIME_UNIT_MICROSECOND]: 'μs',
      [TimeEnums.TIME_UNIT_NANOSECOND]: 'ns',
    };
    return abbrevs[unit] || '';
  }

  /**
   * Convert time between units
   * @param {number} value - Time value
   * @param {number} fromUnit - Source unit
   * @param {number} toUnit - Target unit
   * @returns {number}
   */
  static convert(value, fromUnit, toUnit) {
    const factors = {
      [TimeEnums.TIME_UNIT_SECOND]: 1,
      [TimeEnums.TIME_UNIT_MILLISECOND]: 1000,
      [TimeEnums.TIME_UNIT_MICROSECOND]: 1000000,
      [TimeEnums.TIME_UNIT_NANOSECOND]: 1000000000,
    };
    const fromFactor = factors[fromUnit] || 1;
    const toFactor = factors[toUnit] || 1;
    return value * (fromFactor / toFactor);
  }
}

module.exports = TimeEnums;
