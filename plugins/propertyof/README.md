jsdoc3-plugin-propertyof
======================

## Plugin Origin

Note: The original source code for this plugin was found here: https://github.com/vmeurisse/jsdoc3-plugin-propertyof
It has been included in `lukes-jsdoc` for convenience, consistency, and ease-of-use.

## Usage

This plugin allows you to split split the documentation of large objects into several documentation blocks.

Lets consider an example:
````js
/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Triforce
 * @property {boolean} [hasCourage=false] - Indicates whether the Courage component is present.
 * @property {boolean} [hasPower=false] - Indicates whether the Power component is present.
 * @property {boolean} [hasWisdom=false] - Indicates whether the Wisdom component is present.
 */


````

You can now document it like this:
````js
/**
 * @typedef {Object} Triforce The complete Triforce, or one or more components of the Triforce.
 */
{
	/**
	 * Indicates whether the Courage component is present.
	 * @type boolean
	 * @default false
	 * @propertyof Triforce
	 */
	 hasCourage: false,
	
	/**
	 * Indicates whether the Power component is present.
	 * @type boolean
	 * @default false
	 * @propertyof Triforce
	 */
	hasPower: false,
	
	/**
	 * Indicates whether the Wisdom component is present.
	 * @type boolean
	 * @default false
	 * @propertyof Triforce
	 */
	hasWisdom: false
}
````
