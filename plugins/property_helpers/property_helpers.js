var _ = require( "lodash" );
//var tipe = require("tipe");
var plg = module.exports = {};
var phTagCache = {};

plg.handlers = {

	/***
	 * Called when processing starts.  This method
	 * resets any globals.
	 * @param {object} e
	 */
	parseBegin : function( e ) {
		phTagCache = {};
	},

	/**
	 * Called when processing is finished.  We will create our
	 * cloned doclets here to ensure that we have full doclet information
	 * (some doclet properties have not been computed yet when the @aka
	 * tag is first identified).
	 *
	 * @param {object} e
	 */
	processingComplete : function( e ) {

		var autoDoclets = [];

		_.each(	e.doclets, function( d ) {

				// Get the doclet's long name
				var longName = getDocletLongName( d );

				// Check the cache for automatic methods to generate
				if( phTagCache[longName] !== undefined ) {

					// If we're here, then at least one automatic
					// method needs to be generated for this property.
					// We'll iterate over each type of automatic method
					// and each specific method name within and
					// generate doclets for each one of them.

					_.each( phTagCache[longName], function( methodNames, methodType ) {

						_.each( methodNames, function( methodName ) {

							var nueDoclet = generateMethodDoclet( methodType, methodName, d );
							autoDoclets.push( nueDoclet );

						});

					});


				}

			}
		);

		// Apply any automatic doclets generated above
		_.each( autoDoclets, function( autoDoclet ) {

			if( !docletExists( e.doclets, autoDoclet ) ) {
				e.doclets.push( autoDoclet );
			}

		});


	}

};

/**
 * This method adds the @aka tag to the jsdoc tag dictionary
 *
 * @param {object} dictionary
 */
plg.defineTags = function( dictionary ) {

	// Add the tags for getters
	dictionary.defineTag( "accessor", {onTagged : onAccessorTagged} );
	dictionary.defineTag( "getter", {onTagged : onAccessorTagged} );

	// Add the tags for setters
	dictionary.defineTag( "mutator", {onTagged : onMutatorTagged} );
	dictionary.defineTag( "setter", {onTagged : onMutatorTagged} );

	// Add the tags for togglers
	dictionary.defineTag( "toggler", {onTagged : onTogglerTagged} );

	// Add the tags for combo getter/setter methods
	dictionary.defineTag( "getSet", {onTagged : onComboTagged} );
	dictionary.defineTag( "optMutator", {onTagged : onComboTagged} );
	dictionary.defineTag( "getterSetter", {onTagged : onComboTagged} );

};

/**
 * Checks a collection of doclets to determine if a doclet already exists.
 *
 * @access private
 * @param {object[]} docletCollection A JSDoc doclet collection
 * @param {object} docletToCheckFor A JSDoc doclet object
 * @returns {boolean}
 */
function docletExists( docletCollection, docletToCheckFor ) {

	var doesExist = false;
	var checkForName = getDocletLongName( docletToCheckFor );

	_.each( docletCollection, function( existingDoclet ) {

		var edName = getDocletLongName( existingDoclet );
		if( edName === checkForName ) {
			doesExist = true;
		}

	});

	return doesExist;

}

//<editor-fold desc="+++++ Tag Event Handlers +++++">

/**
 * This event handler is fired when a getter tag is encountered.
 *
 * @param {object} doclet A JSDoc doclet for the source property/member.
 * @param {object} tag Information about the specific doclet tag that was
 * encountered
 * @return {void}
 */
function onAccessorTagged ( doclet, tag ) {
	onTagged( "accessor", doclet, tag );
}

/**
 * This event handler is fired when a setter tag is encountered.
 *
 * @param {object} doclet A JSDoc doclet for the source property/member.
 * @param {object} tag Information about the specific doclet tag that was
 * encountered
 * @return {void}
 */
function onMutatorTagged ( doclet, tag ) {
	onTagged( "mutator", doclet, tag );
}

/**
 * This event handler is fired when a toggler tag is encountered.
 *
 * @param {object} doclet A JSDoc doclet for the source property/member.
 * @param {object} tag Information about the specific doclet tag that was
 * encountered
 * @return {void}
 */
function onTogglerTagged ( doclet, tag ) {
	onTagged( "toggler", doclet, tag );
}

/**
 * This event handler is fired when a getter/setter combo tag is encountered.
 *
 * @param {object} doclet A JSDoc doclet for the source property/member.
 * @param {object} tag Information about the specific doclet tag that was
 * encountered
 * @return {void}
 */
function onComboTagged ( doclet, tag ) {
	onTagged( "combo", doclet, tag );
}

/**
 * This is an event handler that is fired for any of the tags provided
 * by this JSDoc plugin.
 *
 * @param {string} tagType The type of tag that was encountered.
 * @param {object} doclet A JSDoc doclet for the source property/member.
 * @param {object} tag Information about the specific doclet tag that was
 * encountered
 * @return {void}
 */
function onTagged ( tagType, doclet, tag ) {

	// Locals
	var memberName = getDocletLongName( doclet );

	// Ensure we have a cache for the target member
	if( phTagCache[memberName] === undefined ) {
		phTagCache[memberName] = {};
	}

	// Ensure we have a cache for this tag type within the target member cache
	if( phTagCache[memberName][tagType] === undefined ) {
		phTagCache[memberName][tagType] = {};
	}

	// Get all method names for the tag
	var defaultMethodName = getDefaultMethodName( tagType, doclet );
	var methods = extractMethodsFromTag( tag, defaultMethodName );

	// Add each method to the cache
	_.each( methods, function( methodName ) {
		phTagCache[memberName][tagType][methodName] = methodName;
	});

}

//</editor-fold>


/**
 * Derives the default name for an automatic method based on the method type
 * and the property in which it targets.
 *
 * @access private
 * @param {string} tagType The type of tag/auto-method
 * @param {object} doclet A JSDoc doclet object
 * @returns {string} The default method name
 */
function getDefaultMethodName( tagType, doclet ) {

	var sn = getDocletShortName( doclet );

	// Trim any underscores from the start of the name since
	// we do not want to include them in the method(s) we create.
	sn = sn.replace( /^_+/ig, '' );

	// Combo methods can return here since they are usually named the same
	// as the target property but without any prefixes (e.g. _ or __)
	if( tagType === "combo" ) {
		return sn;
	}

	// Capitalize the first letter of the property name
	sn = sn.substr( 0, 1 ).toUpperCase() + sn.substr( 1 );

	// Apply a string prefix to the mutated property name
	// based on the type of method defined by tagType.
	switch( tagType ) {
		case "accessor":
			return "get" + sn;

		case "mutator":
			return "set" + sn;

		case "toggler":
			return "toggle" + sn;

		default:
			return null;

	}

}

/**
 * Extracts the method names from a tag value or,
 * in lieu of a tag value, injects the default method
 * name for the tag type.
 *
 * @returns {string[]} All methods described or implied by the tag value.
 */
function extractMethodsFromTag( tag, defaultMethodName ) {

	if( tag.value === undefined || tag.value === '' || tag.value === null ) {
		return [ defaultMethodName ];
	} else {

		var rgx = /[^A-Za-z0-9_$]/g;
		var tmp = tag.value.split( rgx );
		var ret = [];

		_.each( tmp, function( val ) {

			if( val !== '' ) {
				ret.push(val);
			}

		});

		return ret;

	}


}

/**
 * Generates a doclet for an automatic method.
 *
 * @access private
 * @param {string} methodType The type of automatic method being generated
 * @param {string} methodName The name of the automatic method
 * @param {object} sourceDoclet A source JSDoc doclet, presumably for a class property (member)
 * @returns {object} A new JSDoc doclet
 */
function generateMethodDoclet( methodType, methodName, sourceDoclet ) {

	// Locals
	var nueDoclet 		= _.cloneDeep( sourceDoclet );
	var sourceName 		= getDocletLongName( sourceDoclet );
	var sourceParent 	= getDocletMemberOf( sourceDoclet );
	var longName 		= sourceParent + "#" + methodName;
	var strPropLink 	= "{@link " + sourceName + "}";
	var arrDesc 		= [];
	var returnDesc;
	var hasParams		= false;
	var returnType;

	// Default property type (and method return) if its not provided
	if( sourceDoclet.type === undefined || sourceDoclet.type.names === undefined ) {
		returnType = { names: ["*"] };
	} else {
		returnType = sourceDoclet.type;
	}

	// Changes for all doclet/method types
	nueDoclet.kind 		= "function";
	nueDoclet.name 		= methodName;
	nueDoclet.longname 	= longName;
	nueDoclet.see 		= [ sourceName ];

	// Private/Public Logic
	if( methodName.substr(0,1) === "_" ) {
		nueDoclet.access = "private"
	} else {
		nueDoclet.access = "public"
	}

	// Changes per automatic method type
	switch( methodType ) {

		case "combo":

			hasParams = true;
			arrDesc = [
				"This is a getter and setter method (combo) for the " + strPropLink + " property.",
				"Calling this method with a parameter will set a new value for the property and return the new value.",
				"Calling this method without a parameter will not set a new value for the property but will return the existing value.",
				"See the documentation for the property to learn more about its possible values and its purpose(s)."
			];
			returnDesc		= "The new (or current) value of the " + strPropLink + " property";

			break;

		case "mutator":

			hasParams = true;
			arrDesc = [
				"This is a setter method (mutator) for the " + strPropLink + " property.",
				"Calling this method will set a new value for the property and that new value will be returned.",
				"See the documentation for the property to learn more about its possible values and its purpose(s)."
			];
			returnDesc		= "The new value of the " + strPropLink + " property";

			break;

		case "accessor":

			arrDesc = [
				"This is a getter method (accessor) for the " + strPropLink + " property.",
				"Calling this method will return the current value of the property.",
				"See the documentation for the property to learn more about its possible values and its purpose(s)."
			];
			returnDesc		= "The current value of the " + strPropLink + " property";

			break;

		case "toggler":

			arrDesc = [
				"This is a 'toggler' method for the " + strPropLink + " property, which is a boolean.",
				"If the property value is currently FALSE, then calling this method will set it to TRUE.",
				"If the property value is currently TRUE, then calling this method will set it to FALSE.",
				"See the documentation for the property to learn more about its purpose(s)."
			];
			returnDesc		= "The new value of the " + strPropLink + " property";

			break;

	}

	// Create params, if applicable
	if( hasParams ) {
		nueDoclet.params = [
			{
				type        : returnType,
				description : "<p>The new value for the " + strPropLink + " property</p>",
				name        : 'newPropValue'
			}
		];

		if( methodType === "combo" ) {
			nueDoclet.params[0].optional = true;
		} else {
			nueDoclet.params[0].optional = false;
		}

	}

	// Returns logic
	nueDoclet.returns = [
		{
			type: returnType,
			description: "<p>" + returnDesc + "</p>"
		}

	];
	delete nueDoclet.type;

	// Create the method description
	nueDoclet.description = "<p>" + arrDesc.join("\n") + "</p>";

	// Create the method comment
	var commentSep = "\n\t\t\t";
	nueDoclet.comment = 	commentSep + arrDesc.join(commentSep);
	nueDoclet.comment += 	commentSep + " *";
	nueDoclet.comment += 	commentSep + "@function " + longName;
	nueDoclet.comment += 	commentSep + "@see " + sourceName;
	nueDoclet.comment += 	commentSep + "@returns {" + returnType.names[0] + "} " + returnDesc;
	nueDoclet.comment += 	commentSep + " */";



	// Set property to private unless 'access' is forcefully set
	if( sourceDoclet.access === undefined ) {
		sourceDoclet.access = "private";
	}

	// Done
	return nueDoclet;

}


//<editor-fold desc="+++++ Helper Methods for Doclet Name Data +++++">

/**
 * Finds the short name of a doclet.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object.
 * @returns {string|null} The short name of a doclet or NULL if the short name
 * could not be found or derived.
 */
function getDocletShortName( doclet ) {

	// Locals
	var nameParts;

	// If the doclet has a 'longname' property and a 'name'
	// property, then we will simply return the 'name' property.
	if( docletHasLongName(doclet) && docletHasName(doclet) ) {
		return doclet.name;
	}

	// If the above did not pass then we will resolve the short
	// name by breaking down the long name of the doclet into subparts.
	nameParts = getDocletNameParts( doclet );

	// Return null if there was a problem breaking the name down
	if( nameParts === null ) {
		return null;
	}

	// Return the last element in the name parts array
	return nameParts[ (nameParts.length - 1) ];

}

/**
 * Returns the 'memberof' information for a doclet.  If JSDoc
 * has not yet derived the memberof property, then this method will
 * attempt to derive it itself.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {string|null} The memberof value for a doclet or NULL if the
 * memberof information could not be found or derived.
 */
function getDocletMemberOf( doclet ) {

	// If the doclet has a memberof property, then we can use it
	// and exit early.
	if( doclet.memberof !== undefined && doclet.memberof !== '' ) {
		return doclet.memberof;
	}

	// Locals
	var longName = getDocletLongName( doclet );
	var shortName = getDocletShortName( doclet );

	// Return NULL if the short or long names could
	// not be found or derived.
	if( longName === null || shortName === null ) {
		return null;
	}

	// Find the symbol by removing the short name from
	// the end of the long name and returning the character
	// at the very end of the result.
	return longName.substr( 0, (longName.length - shortName.length) - 1 );

}

/**
 * Returns the symbol for a doclet (i.e. ~, #, or .), which
 * is part of the long doclet name.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {string|null} The symbol or NULL If no symbol exists or if it could
 * not be found or derived.
 */
function getDocletNameSymbol( doclet ) {

	var longName = getDocletLongName( doclet );
	var shortName = getDocletShortName( doclet );

	// Return NULL if the short or long names could
	// not be found or derived.
	if( longName === null || shortName === null ) {
		return null;
	}

	// Find the symbol by removing the short name from
	// the end of the long name and returning the character
	// at the very end of the result.
	return longName.substr( (longName.length - shortName.length) - 1, 1 );

}

/**
 * Finds the long name of a doclet and breaks it into subparts.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {array|null} An array of doclet name parts or NULL if insufficient
 * naming information could be obtained.
 */
function getDocletNameParts( doclet ) {

	// Locals
	var rgx = /[^A-Za-z0-9_$]/g;
	var longname = getDocletLongName(doclet);
	var parts;

	// If the longname could be found or derivated we will return NULL.
	if( longname === null ) {
		return null;
	}

	// Split the long name
	parts = longname.split( rgx );

	// Validate the split result and return NULL if there was a problem.
	if( parts.length === undefined || parts.length < 1 ) {
		return null;
	} else {
		return parts;
	}

}

/**
 * Returns the long (full) name of a doclet.  Since JSDoc
 * stores the long name in different properties at different
 * portions of the processing, this method will attempt to determine
 * the appropriate long name based on the current doclet structure.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {string|null} The longname for the doclet or NULL If the longname
 * could not be found or derived.
 */
function getDocletLongName( doclet ) {

	// If the doclet does not have naming information then there
	// is a problem and we will return null.
	if( !docletHasAnyName(doclet) ) {
		return null;
	}

	// If the doclet has a 'longname', then we will return that;
	// otherwise, we will return the 'name' property.
	if( docletHasLongName(doclet) ) {
		return doclet.longname;
	} else {
		return doclet.name;
	}

}



/**
 * Checks to see if a doclet object has a 'longname' property.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {boolean} TRUE if the 'longname' property exists; FALSE otherwise.
 */
function docletHasLongName( doclet ) {

	if( doclet.longname === undefined || doclet.longname === '' || doclet.longname === null ) {
		return false;
	} else {
		return true;
	}

}

/**
 * Checks to see if a doclet object has a 'name' property.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {boolean} TRUE if the 'name' property exists; FALSE otherwise.
 */
function docletHasName( doclet ) {

	// Determine if the doclet has a 'name' param
	if( doclet.name === undefined || doclet.name === '' || doclet.name === null ) {
		return false;
	} else {
		return true;
	}

}

/**
 * Checks to see if a doclet object has either a 'name' or a 'longname' property.
 *
 * @access private
 * @param {object} doclet A JSDoc doclet object
 * @returns {boolean} TRUE if the 'name' or 'longname' properties exists; FALSE otherwise.
 */
function docletHasAnyName( doclet ) {

	if( docletHasName(doclet) || docletHasLongName(doclet) ) {
		return true;
	} else {
		return false;
	}

}
//</editor-fold>
