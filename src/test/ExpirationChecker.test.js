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
var ExpirationChecker = require('../lib/ExpirationChecker');

suite('ExpirationChecker suite', function() {
	var sut, card;

	setup(function() {
		card = {
			'username': 'user1',
			'expiration': 3600
		};
		sut = new ExpirationChecker();
	});

	test('check should return true if expiration time is not acomplished', function() {
		card.expiration = Math.floor(Date.now() / 1000) + 3600;
		var result = sut.check(card);
		assert.equal(result, true);
	});

	test('check should return true if expiration time is not acomplished', function() {
		card.expiration = Math.floor(Date.now() / 1000) - 3600;
		var result = sut.check(card);
		assert.equal(result, false);
	});
});
