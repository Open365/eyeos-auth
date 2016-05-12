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
var RsaVerifier = require('../lib/RsaVerifier');

suite('RsaVerifier suite', function() {
	var sut, verifierFake, verifierMock, hash, signature, publicPem, resultExpected;
	var expVerifierUpdate, expVerifierVerify;

	setup(function() {
		resultExpected = true;
		publicPem = 'RSA PUBLIC PEM KEY';
		hash = '0bxs6fgbh9s6h7sf';
		signature = 'zdf8gs0877ghf';
		verifierFake = {
			update: function() {},
			verify: function() {}
		};
		verifierMock = sinon.mock(verifierFake);
		sut = new RsaVerifier(publicPem);
		expVerifierUpdate = verifierMock.expects('update')
			.once().withExactArgs(hash);
		expVerifierVerify = verifierMock.expects('verify')
			.once().withExactArgs(publicPem, signature, 'base64').returns(resultExpected);
	});

	test('verify should call verifier update with hash', function() {
		sut.verify(hash, signature, verifierFake);
		expVerifierUpdate.verify();
	});


	test('verify should call verifier verify with public key signature and encoding', function() {
		sut.verify(hash, signature, verifierFake);
		expVerifierVerify.verify();
	});

	test('verify should return result', function() {
		var result = sut.verify(hash, signature, verifierFake);
		assert.equal(result, resultExpected);
	});
});
