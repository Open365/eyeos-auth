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
var RsaSigner = require('../lib/RsaSigner'),
	ValidCard = require('../lib/ValidCard'),
	CardSigner = require('../lib/CardSigner');

suite('RsaSigner suite', function() {
	var sut, responseFinisherFake, userId = 'user1', domain, validCard, validCardMock, card, minicard, minisignature,
		cardSigner, cardSignerMock, signature, loginSignCardCallback, loginSignCardCallbackMock;
	var expValidCardGetCard, expValidCardGetCardForPrincipal, expCardSignerSign, expLoginSignCardCallback;
    var principal;

	setup(function() {
		domain = "domain";
		loginSignCardCallback = {
			signed: function() {}
		};
		loginSignCardCallbackMock = sinon.mock(loginSignCardCallback);
		signature = 'kdjsfgha8asd0fg';
		minisignature = 'dklsjalsha';
        principal = {
            principalId: userId
        };

		card = {
			'username': userId,
			'expiration': 3600
		};
		minicard = {
			'username': userId,
			'expiration': 3600
		};
		cardSigner = {
			sign: function () {
			}
		};
		cardSignerMock = sinon.mock(cardSigner);
		validCard = new ValidCard({}, {});
		responseFinisherFake = {};

		sut = new RsaSigner(validCard, cardSigner);

	});

	teardown(function() {
	});

	test('signCard should call ValidCard getCard', function() {
		validCardMock = sinon.mock(validCard);
		loginSignCardCallbackMock.expects('signed');
		expValidCardGetCard = validCardMock.expects('getCard').once().withArgs(userId, domain).callsArgWith(2,card);
		sut.signCard(userId, domain, loginSignCardCallback);
		expValidCardGetCard.verify();
	});

	test('signCard should call CardSigner sign twice', function() {
		sinon.stub(validCard, 'getCard', function(userId, domain, cb) {
			cb();
		});
		expCardSignerSign = cardSignerMock.expects('sign').twice();
		loginSignCardCallbackMock.expects('signed');
		sut.signCard(userId, domain, loginSignCardCallback);
		expCardSignerSign.verify();
	});

    test('signCard should call loginSignCardCallback signed with card and signature, minicard and minisignature', function() {
		sinon.stub(validCard, 'getCard', function(userId, domain, cb) {
			cb(card, minicard);
		});
		cardSignerMock.expects('sign').twice().returns(signature); //In this test both are returning signature instead of minisignatue
		expLoginSignCardCallback = loginSignCardCallbackMock.expects('signed').once().withExactArgs(card, signature, minicard, signature);
		sut.signCard(userId, domain, loginSignCardCallback);
		expLoginSignCardCallback.verify();
    });

    test('signCardForPrincipal should call ValidCard getCardForPrincipal', function() {
		validCardMock = sinon.mock(validCard);
		expValidCardGetCardForPrincipal = validCardMock.expects('getCardForPrincipal').once().withArgs(principal.principalId, sinon.match.func, principal).callsArgWith(1, card);
        sut.signCardForPrincipal(principal, loginSignCardCallback);
        expValidCardGetCardForPrincipal.verify();
    });

    test('signCardForPrincipal should call CardSigner sign twice', function() {
		sinon.stub(validCard, 'getCardForPrincipal', function(userId, cb) {
			cb(card, minicard);
		});
		var expCardSignerSign = cardSignerMock.expects('sign').twice().returns(signature);
        sut.signCardForPrincipal(principal, loginSignCardCallback);
        expCardSignerSign.verify();
    });

    test('signCardForPrincipal should call loginSignCardCallback signed with card and signature', function() {
		sinon.stub(validCard, 'getCardForPrincipal', function(userId, cb) {
			cb(card, minicard);
		});
		cardSignerMock.expects('sign').twice().returns(signature);
		expLoginSignCardCallback = loginSignCardCallbackMock.expects('signed').once().withExactArgs(card, signature, minicard, signature);
        sut.signCardForPrincipal(principal, loginSignCardCallback);
        expLoginSignCardCallback.verify();
    });

});
