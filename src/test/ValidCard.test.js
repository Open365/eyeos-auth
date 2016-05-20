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
var ValidCard = require('../lib/ValidCard');
var settings = require('../lib/settings.js');
var PrincipalProvider = require('eyeos-principal').PrincipalProvider;

suite('ValidCard suite', function() {
	var sut, userId = 'user1', domain, principalProvider, principalProviderMock, expGetPrincipal;
	var expectedCard = {
		'expiration': sinon.match.number,
		'renewCardDelay': sinon.match.number,
		'username': userId,
		'domain': 'eyeos.com',
		'permissions': [
			"test"
		]
	};
	var principal;
	var PrincipalSingleton;

	setup(function() {
		var systemsGroupProviderFake = {
		};

		principal = {
			getPermissions: function() {}
		};
		domain = "domain";
		principalProvider = new PrincipalProvider({}, principal);
		principalProviderMock = sinon.mock(principalProvider);

		sut = new ValidCard(settings, principalProvider);
	});

	test('getCard should return a JSON Card with username and expiration', function() {
		_setExpectations();
		sut.getCard(userId, domain, function(result) {
			var spy = sinon.spy();
			spy(result);
			sinon.assert.calledWith(spy, sinon.match(expectedCard));
		});

	});

	test('getCardForPrincipal should return a correct expiration', function() {
		sut.getCardForPrincipal(userId, function(card) {
			assert.isNumber(card.expiration);
			assert.closeTo(card.expiration, settings.validCardExpirationSeconds + Math.floor(Date.now() / 1000), 1);
		}, principal);
	});

    test('getCardForPrincipal should call principal.getPermissions', function() {
        sut.getCardForPrincipal(userId, function(card) {
            sinon.assert.calledOnce(principal.getPermissions);
            sinon.assert.calledWithExactly(principal.getPermissions, sinon.match.func);

        }, principal);
    });

	test('getCardForPrincipal card includes renewCardDelay as expiration - renewCardSecondsBeforeExpiration', function() {
		sut.getCardForPrincipal(userId, function(card) {
			assert.isNumber(card.renewCardDelay);
			assert.closeTo(card.renewCardDelay, card.expiration - settings.renewCardSecondsBeforeExpiration - (Date.now() / 1000), 1);
		}, principal);
	});

	test('getCardForPrincipal card should call callback with the card and the minicard', function() {
		sut.getCardForPrincipal(userId, function(card, minicard) {
			assert.isArray(card.permissions);
			assert.isUndefined(minicard.permissions);
		}, principal);
	});

	test('getCard getCardForPrincipal.bind with this, userId and cb', function() {
		_setExpectations();
		var getCardForPpalBindSpỳ = sinon.spy(sut.getCardForPrincipal, 'bind');
		sut.getCard(userId, domain, function(){
			assert(getCardForPpalBindSpỳ.calledOnce);
			assert(getCardForPpalBindSpỳ.calledWith(sut, userId, sinon.match.function));
		});

	});

	test('getCard should call getPrincipal on PrincipalProvider with the correct user', function() {
		_setExpectations();
		sut.getCard(userId, domain, function() {

		});
		expGetPrincipal.verify();
	});

	function _setExpectations() {
		expGetPrincipal = principalProviderMock.expects('getPrincipalByIdAndDomain').once().withArgs(userId, domain).returns({permissions: ["test"]});
	}
});
