/*
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @author  Hovhannes Babayan <bhovhannes at gmail dot com>
 */
var loaderUtils = require('loader-utils');

var xmldom = require('xmldom');
var xpath = require('xpath');
var crypto = require('crypto');

module.exports = function(content) {
	this.cacheable && this.cacheable();

	var query = loaderUtils.parseQuery(this.query);

	content = content.toString('utf8');

	// Determine which element to use as target
	var tagName = 'symbol';
	if (query.tag) {
		tagName = query.tag;
	}

	var targetDoc = new xmldom.DOMParser().parseFromString('<'+tagName+'></'+tagName+'>', 'text/xml');
	var targetEl = targetDoc.documentElement;

	var svgDoc = new xmldom.DOMParser().parseFromString(content, "text/xml");
	var svgEl = svgDoc.documentElement;

	// Transfer supported attributes from SVG element to the target element.
	// Attributes provided via loader query string overwrite attributes set to SVG element.
	var attributes = ['viewBox', 'height', 'width', 'preserveAspectRatio'];
	attributes.forEach(function(attr) {
		if (query[attr]) {
			targetEl.setAttribute(attr, query[attr]);
		}
		else if (svgEl.hasAttribute(attr)) {
			targetEl.setAttribute(attr, svgEl.getAttribute(attr));
		}
	});

	// Apply additional attributes provided via loader query string
	['id'].forEach(function(param) {
		if (query[param]) {
			targetEl.setAttribute(param, query[param]);
		}
	});

	// Move all child nodes from SVG element to the target element
	var el = svgEl.firstChild;
	while(el) {
		targetEl.appendChild(targetDoc.importNode(el, true));
		el = el.nextSibling;
	}

	var markup = new xmldom.XMLSerializer().serializeToString(targetDoc);
	return 'module.exports = ' + JSON.stringify(markup);
};

module.exports.raw = true;
