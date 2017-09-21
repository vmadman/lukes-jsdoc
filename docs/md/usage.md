# Basic Usage

## The Bare Minimums

This module includes several modules, but fundamentally it includes two 
basic components: JSDoc and a Theme

You can use JSDoc from elsewhere (e.g. a globally installed instance), 
but this documentation will assume that you will do as we do and use the 
JSDoc that comes as a dependency of `lukes-jsdoc`.

We're also going to assume that you will be running your documentation
generation through "npm scripts", which we recommend.

### 1 - Create a minimal config

For the most part, use of the various parts of this module is done
through JSDoc configuration; more specifically, through a JSDoc
configuration file.
 
More information is available in the [JSDoc Configuration](./configuration.md) 
document, but here's a minimal example:

**conf/docs/html.json**
```javascript
{
	"source"        : {
		"include"        : [
			"lib",
			"package.json",
			"README.md"
		],
		"includePattern" : ".js$",
		"excludePattern" : "(node_modules/|docs)"
	},
	"opts"          : {
		"destination" : "./doc/html/",
		"template"    : "./node_modules/lukes-jsdoc"
	}
}
```

Create the file above, using the filename above the example.

### 2 - Create a script

**scripts/build-docs.sh**
```shell
#!/bin/bash

# Clean Existing Docs
rm -rf doc/html

# Execute JSDoc
node node_modules/lukes-jsdoc/node_modules/jsdoc/jsdoc.js --configure conf/docs/html.json
```

Create the file above, using the filename above the example.

### 3 - Update Package.json

Next, create a reference to your new script in your project's
`package.json` file.

```javascript
	"scripts"         : {
		"docs" : "scripts/build-docs.sh"
	},
```

### 4 - Run the Script

From your favorite shell you should now be able to run this:

```shell
[root@somehost ~]# cd myproject
[root@somehost myproject]# npm run-script docs
```

.. and away it should go.  If you hit an error, you may have done
something wrong, so read above, again.  If you've done it all properly,
open a GitHub issue and we'll try to help.

## What's Next

Once your documentation is building you begin including the extended
features of this module.  More information about that can be found in
the [JSDoc Configuration](./configuration.md) document.
