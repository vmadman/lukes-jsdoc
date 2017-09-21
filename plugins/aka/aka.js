var _ = require("lodash");
var tipe = require("tipe");
var plg = {};
var refDocletClones = {};

plg.handlers = {

	/***
	 * Called when processing starts.  This method
	 * resets any globals.
	 * @param {object} e
	 */
	parseBegin: function ( e ) {

		refDocletClones = {};

	},

	/**
	 * Called when processing is finished.  We will create our
	 * cloned doclets here to ensure that we have full doclet information
	 * (some doclet properties have not been computed yet when the @aka
	 * tag is first identified).
	 *
	 * @param {object} e
	 */
	processingComplete: function( e ) {

		// Locals
		var clonesToAdd = [];

		// We'll check each doclet to see if any are supposed to be cloned
		_.each( e.doclets, function( v, k ) {

			// If a doclet has an @aka tag then it will exist
			// in the refDocletClones object.
			if( refDocletClones[ v.longname ] !== undefined ) {

				// Each doclet will have one entry for each occurrence
				// of the @aka tag, so we will iterate over each occurrence.
				_.each( refDocletClones[ v.longname ], function( name ) {

					// Use a helper method to apply the doclet name change..
					var cln = cloneAndRenameDoclet( v, name );

					// Add the new doclet to a temporary array
					// that will be iterated later..
					clonesToAdd.push( cln );

				});

			}

		});

		// Do we have any clones to add?
		if( clonesToAdd.length > 0 ) {

			// Yes.. iterate over each..
			_.each( clonesToAdd, function( cln ) {

				// Add each clone to the main doclet array
				e.doclets.push( cln );

			});
		}

	}

};

/**
 * This method adds the @aka tag to the jsdoc tag dictionary
 *
 * @param {object} dictionary
 */
plg.defineTags = function(dictionary) {

	// Add the tag
	dictionary.defineTag("aka", {

		// Here we require a value
		// e.g.
		// @aka someOtherName   < valid
		// @aka                 < invalid
		mustHaveValue: true,

		// This method is fired each time jsdoc
		// encounters the @aka tag.
		// (actually, oddly, its fired twice for each)
		onTagged: function( doclet, tag ) {

			// Pass to the helper method (below)
			return onAkaTag( doclet, tag );

		}
	});

};

/**
 * This helper function clones a doclet and gives it a new name
 * (but preserves everything else, including the `memberOf` info).
 * This method is called exclusively by the `processingComplete`
 * listener above.
 *
 * @param {object} objDoclet
 * @param {string} newName
 * @returns {void}
 */
function cloneAndRenameDoclet( objDoclet, newName ) {

	// Create the doclet clone
	var nd = _.cloneDeep( objDoclet );

	// Here we use a bit of hackery so that we don't
	// need to know all of the available symbols (., #, ~)
	// in jsdoc.  We'll just use whatever symbol proceeds
	// the memberOf string in the longname.
	var memOfLength = nd.memberof.length;
	var localName = nd.longname.substr( memOfLength );
	var sym = localName.substr( 0, 1 );

	// Change the short name in the doclet
	nd.name = newName;

	// Change the long name in the doclet
	nd.longname = nd.memberof + sym + newName;

	// Automatically set the access level of the alias
	if( nd.name.substr(0,1) === "_" ) {
		nd.access = "private";
	} else {
		nd.access = "public";
	}

	// Return our modified clone for inclusion.
	return nd;

}

/**
 * This method is fired each time the @aka tag is encountered.
 * All this method does is keep track of the doclets that have
 * one or more @aka tags for use by the `processingComplete`
 * listener above. (it doesn't actually clone anything)
 *
 * @param {object} doclet
 * @param {object} tag
 * @returns {void}
 */
function onAkaTag( doclet, tag ) {

	// Paranoia check: Ensure the doclet is "aka-able"
	if( doclet.name === undefined || doclet.name === '' || doclet.name === null ) {
		return;
	}

	// Locals
	var dName = doclet.name;
	var tValue = tag.value;

	// Track the clone
	createDocletCloneRef( dName, tValue );

}

/**
 * Helper function for creating doclet clone references
 *
 * @param {string} docletName
 * @param {string} akaValue
 */
function createDocletCloneRef( docletName, akaValue ) {

	var rgxValidMemberChrs = /[^A-Za-z0-9_]/g;
	var allAkaValues = akaValue.split( rgxValidMemberChrs );

	_.each( allAkaValues, function( finalAkaValue ) {

		if( finalAkaValue !== "" ) {

			// Create the ref property for this doclet
			// (if it does not exist)
			if( refDocletClones[ docletName ] === undefined ) {
				refDocletClones[ docletName ] = {};
			}

			// Add this tag to the reference object
			// for doclet cloning later on...
			refDocletClones[ docletName ][ finalAkaValue ] = finalAkaValue;

		}

	});

}

// Export our plugin
module.exports = plg;
