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
var CardHasher = require('../lib/CardHasher');

suite('CardHasher suite', function() {
	var sut, card, cardString, cryptoFake, cryptoMock, md5Fake, md5Mock, expectedHash, stringify;
	var expCryptoCreateHash, expMd5Update, expMd5Digest;

	setup(function() {
		stringify = sinon.spy(function() {
			return cardString;
		});
		expectedHash = '0xdf6g0sd76h067gfs';
		md5Fake = {
			update: function() {},
			digest: function() {}
		};
		md5Mock = sinon.mock(md5Fake);
		cryptoFake = {
			createHash: function() {}
		};
		cryptoMock = sinon.mock(cryptoFake);
		card = {
			'expiration': 3600,
			'username': 'user1'
		};
		cardString = JSON.stringify(card);
		sut = new CardHasher(cryptoFake, stringify);
		expCryptoCreateHash = cryptoMock.expects('createHash').once().withExactArgs('md5').returns(md5Fake);
		expMd5Update = md5Mock.expects('update').once().withExactArgs(cardString).returns(md5Fake);
		expMd5Digest = md5Mock.expects('digest').once().withExactArgs('hex').returns(expectedHash);
	});

	test('getHash should call stringify injected', function() {
		sut.getHash(card);
		sinon.assert.called(stringify);
	});

	test('getHash should call createHash', function() {
		sut.getHash(card);
		expCryptoCreateHash.verify();
	});

	test('getHash should call md5 update with cardString', function() {
		sut.getHash(card);
		expMd5Update.verify();
	});

	test('getHash should call md5 digest', function() {
		sut.getHash(card);
		expMd5Digest.verify();
	});

	test('getHash should return hash', function() {
		var hash = sut.getHash(card);
		assert(hash, expectedHash);
	});
});
