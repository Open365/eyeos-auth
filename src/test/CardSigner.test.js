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
var CardSigner = require('../lib/CardSigner'),
	CardHasher = require('../lib/CardHasher');

suite('CardSigner suite', function() {
	var sut, cardHasher, cardHasherMock, card, hash, signerFake,
		signerMock, signatureExpected, privatePem;
	var expCardHasherGetHash, expSignerUpdate, expSignerSign;

	setup(function() {
		privatePem = 'private RSA PEM key';
		signatureExpected = 'd8zsgf0asd8g0sd7g60sd7f6g';
		signerFake = {
			update: function() {},
			sign: function() {}
		};
		signerMock = sinon.mock(signerFake);
		card = {
			'username': 'user1',
			'expiration': 3600
		};
		hash = 'z87g08gf7dsf8g0as';
		cardHasher = new CardHasher();
		cardHasherMock = sinon.mock(cardHasher);
		sut = new CardSigner(privatePem, cardHasher);
		expCardHasherGetHash = cardHasherMock.expects('getHash').once().withExactArgs(card).returns(hash);
		expSignerUpdate = signerMock.expects('update').once().withExactArgs(hash);
		expSignerSign = signerMock.expects('sign').once().withExactArgs(privatePem, 'base64').returns(signatureExpected);
	});

	test('sign should call cardHasher getHash', function() {
		sut.sign(card, signerFake);
		expCardHasherGetHash.verify();
	});

	test('sign should call signer update with hash', function() {
		sut.sign(card, signerFake);
		expSignerUpdate.verify();
	});

	test('sign should call signer sign with privatePem and encoding', function() {
		sut.sign(card, signerFake);
		expSignerSign.verify();
	});

	test('sign should return the signature', function() {
		var signature = sut.sign(card, signerFake);
		assert(signatureExpected, signature);
	});
});
