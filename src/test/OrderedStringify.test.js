/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var sinon = require('sinon'),
	assert = require('chai').assert;
var stringify = require('../lib/OrderedStringify');

suite('OrderedStringify suite', function() {
	var json, jsonString;

	setup(function() {
		json = {
			g: 1,
			b: 4,
			c: 2
		};
		jsonString = '{"b":4,"c":2,"g":1}';
	});

	test('orderedStringify with json returns jsonString', function() {
		var result = stringify(json);
		assert.deepEqual(result, jsonString);
	});

	test('orderedStringify with different order json returns same jsonString', function() {
		var result = stringify({
			c: 2,
			b: 4,
			g: 1
		});
		assert.deepEqual(result, jsonString);
	});
});
