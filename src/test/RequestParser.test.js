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
var RequestParser = require('../lib/RequestParser');

suite('RequestParser suite', function() {
	var sut, request, card, signature, stringCard;
	var requestNoHeaders, requestNoCard, requestInvalidCard;

	setup(function() {
		signature = '78sdgh0df';
		card = {
			"username":"qa.user",
			"expiration":3612
		};
		stringCard = JSON.stringify(card);
		request = {
			headers: {
				'card': stringCard,
				'signature': signature
			}
		};
		requestNoHeaders = {};
		requestNoCard = {headers: {}};
		requestInvalidCard = {
			headers: {
				card: '"invalid json'
			}
		};
		sut = new RequestParser();
	});

	test('getCard should return card', function() {
		var result = sut.getCard(request);
		assert.deepEqual(card, result);
	});

	test('getCard should return capitalized card', function() {
		var req = { headers: { Signature: signature, Card: stringCard } };
		var result = sut.getCard(req);
		assert.deepEqual(card, result);
	});

	test('getCard If no headers are found, return null', function () {
		var result = sut.getCard(requestNoHeaders);
		assert.isNull(result);
	});

	test('getCard If no card on headers is found, return null', function () {
		var result = sut.getCard(requestNoCard);
		assert.isNull(result);
	});

	test('getCard should return null if card can not be parsed', function () {
		var result = sut.getCard(requestInvalidCard);
		assert.isNull(result);
	});

	test('getSignature should return signature', function() {
		var result = sut.getSignature(request);
		assert.equal(signature, result);
	});

	test('getSignature should return capitalized signature', function() {
		var req = { headers: { Signature: signature, Card: stringCard } };
		var result = sut.getSignature(req);
		assert.equal(signature, result);
	});

	test('getSignature If no headers are found, return empty string', function () {
		var result = sut.getSignature(requestNoHeaders);
		assert.equal(result, '');
	});

	test('getCard If no card on headers is found, return empty string', function () {
		var result = sut.getSignature(requestNoCard);
		assert.equal(result, '');
	});
});
