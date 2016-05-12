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
var ValidateEyeosCard = require('../lib/ValidateEyeosCard'),
	CardHasher = require('../lib/CardHasher'),
	RsaVerifier = require('../lib/RsaVerifier'),
	ExpirationChecker = require('../lib/ExpirationChecker');

suite('ValidateEyeosCard suite', function() {
	var sut, cardHasher, cardHasherMock, card, signature, hash, rsaVerifier, rsaVerifierMock,
		verified, expirationChecker, expirationCheckerMock;
	var expCardHasherGetHash, expRsaVerify, expExpirationCheck;

	setup(function() {
		verified = true;
		expirationChecker = new ExpirationChecker();
		expirationCheckerMock = sinon.mock(expirationChecker);
		rsaVerifier = new RsaVerifier();
		rsaVerifierMock = sinon.mock(rsaVerifier);
		hash = 'd6f6ds67677h';
		signature = '76sdf976s98ghs9gf';
		card = {
			'username': 'user1',
			'expiration': 3600
		};
		cardHasher = new CardHasher();
		cardHasherMock = sinon.mock(cardHasher);
		sut = new ValidateEyeosCard(cardHasher, rsaVerifier, expirationChecker);
	});

	function setExpectations(expired) {
		expCardHasherGetHash = cardHasherMock.expects('getHash').once().withExactArgs(card).returns(hash);
		expRsaVerify = rsaVerifierMock.expects('verify').once().withExactArgs(hash, signature).returns(verified);
		expExpirationCheck = expirationCheckerMock.expects('check')
			.once().withExactArgs(card).returns(expired);
	}

	test('validate should return false if no signature provided', function() {
		setExpectations(true);
		var expectedResult = false;
		var result = sut.validate(card);
		assert.equal(expectedResult, result);
	});

	test('validate should return false if no card provided', function() {
		setExpectations(true);
		var expectedResult = false;
		var result = sut.validate(null, signature);
		assert.equal(expectedResult, result);
	});

	test('validate should call expirationChecker check if card provided', function() {
		setExpectations(true);
		sut.validate(card, signature);
		expExpirationCheck.verify();
	});

	test('validate should return false on card expired', function() {
		setExpectations(false);
		var result = sut.validate(card, signature);
		assert.equal(result, false);
	});

	test('validate should call CardHasher getHash with card if not expired', function() {
		setExpectations(true);
		sut.validate(card, signature);
		expCardHasherGetHash.verify();
	});

	test('validate should call RsaVerifier verify with hash and signature if not expired', function() {
		setExpectations(true);
		sut.validate(card, signature);
		expRsaVerify.verify();
	});

	test('validate should return a boolean value', function() {
		setExpectations(true);
		var result = sut.validate(card, signature);
		assert.isBoolean(result);
	});
});
