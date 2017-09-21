exports.defineTags = function(dictionary) {
	/*
	 * Definition of the propertyof tag. It is a synonym of `@kind property` and `@memberof xxx`
	 */ 
	dictionary.defineTag('propertyof', {
		mustHaveValue: true,
		canHavetype: false,
		onTagged: function(doclet, tag) {
			doclet.kind = 'property';
			doclet.memberof = tag.value;
		}
	});
};

exports.handlers = {
	/*
	 * JSDoc3 normaly cannot parse jsonfiles. Maes sure it can.
	 * TODO: detection should be based onfile content and not on file name
	 */
	beforeParse: function(e) {
		if (e.filename && e.filename.slice(-5) === '.json') {
			e.source = '(' + e.source + ')';
		}
	},
	
	/*
	 * - Attach properties that are member of another tag to the correct tag
	 * - Make properties with a default value optional
	 */
	parseComplete: function(e) {
		var doclets = e.doclets;
		var objects = {};
		for (var i = 0; i < doclets.length; i++) {
			var doclet = doclets[i];
			if (doclet.kind === 'property' && doclet.memberof) {
				var parentDoc = objects[doclet.memberof];
				if (parentDoc) {
					if (doclet.defaultvalue) {
						doclet.optional = true;
					}
					parentDoc.properties = parentDoc.properties || [];
					parentDoc.properties.push(doclet);
					
					doclets.splice(i, 1);
					i--;
				}
			}
			objects[doclet.longname] = doclet;
		}
	}
};

