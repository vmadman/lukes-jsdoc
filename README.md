Luke's JSDoc
============

[![Travis](https://img.shields.io/travis/vmadman/lukes-jsdoc.svg)](https://travis-ci.org/vmadman/lukes-jsdoc)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/vmadman/lukes-jsdoc/master/LICENSE.md)
[![NPM](https://img.shields.io/npm/v/@lukechavers/jsdoc.svg)](https://www.npmjs.com/package/@lukechavers/jsdoc)
[![GitHub watchers](https://img.shields.io/github/watchers/vmadman/lukes-jsdoc.svg?style=social&label=Watch)](https://github.com/vmadman/lukes-jsdoc)

This project provides [JSDoc](http://usejsdoc.org/) and a collection of 
plugin's that I use for most of my JavaScript projects.

## What does it do?

It abbreviates the necessary dependencies for our projects, allowing me 
to include fewer libraries for our JSDoc generation needs.

## Why did I create it?

I wanted a simple way to add JSDoc documentation to all (or most) of my 
Javascript projects without needing to train each of my coworkers on the 
intricacies of JSDoc execution and configuration.  My hope was that 
this, in turn, would lead to a wider adoption rate of JSDoc in my 
projects.

I also wanted to make my JSDoc output more consistent.

## Installation

Use NPM to install this library as a `devDependency` of your project:

```shell
$ npm install --save-dev --save-exact lukes-jsdoc
```

## Basic Usage

### Step 1 - Create a JSDoc Config

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

### Step 2 - Execute JSDoc

```shell
$ cd /path/to/myproject
$ node node_modules/lukes-jsdoc/node_modules/jsdoc/jsdoc.js --configure conf/docs/html.json
```

### Next Steps

The above example is a minimal implementation.  You should, at least, add your
documentation generation to an "npm script".  More information about that is
outlined in the [Usage Document](docs/md/usage.md).

## Documentation

* [Usage](docs/md/usage.md)
* [Configuration](docs/md/configuration.md)
* [Developing](docs/md/developing.md)
* [Dependency Documentation](docs/md/dependencies.md)
* [Acknowledgements](docs/md/acknowledgements.md)

## Useful Links

* [Travis CI Page](https://travis-ci.org/vmadman/lukes-jsdoc)
