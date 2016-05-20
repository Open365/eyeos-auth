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
var EyeosAuth = require('../lib/EyeosAuth'),
	ValidateEyeosCard = require('../lib/ValidateEyeosCard'),
	RequestParser = require('../lib/RequestParser'),
	RsaSigner = require('../lib/RsaSigner');

suite('EyeosAuth suite', function() {
	var sut, validateEyeosCard, validateEyeosCardMock, request, card, signature, userId, domain,
		cardCallback, cardCallbackMock, expectedResult, requestParser, requestParserMock, rsaSigner, rsaSignerMock;
	var expEyeosCardValidate, expParserGetCard, expParserGetSignature, expCallbackUnSigned;
	var expRsaSignCard, expRsaSignCardForPrincipal, verifyRequestStub;
    var principal;

	setup(function() {
		permission = 'eyeos.group.547735f1e4fce0231df5ce22.administrator';
		cardCallback = {
			unSigned: function() {}
		};
        principal= {
            userId: userId,
            systemGroups: []
        };
		userId = "user1";
		domain = "test";
		cardCallbackMock = sinon.mock(cardCallback);
		requestParser = new RequestParser();
		requestParserMock = sinon.mock(requestParser);
		expectedResult = true;
		card = {
			'username': userId,
			'domain': domain,
			'expiration': 3600
		};
		request = {
			headers: {
				'Card': JSON.stringify(card),
				'Signature': signature
			}
		};
		rsaSigner = new RsaSigner({});
		rsaSignerMock = sinon.mock(rsaSigner);
		validateEyeosCard = new ValidateEyeosCard();
		validateEyeosCardMock = sinon.mock(validateEyeosCard);
		sut = new EyeosAuth(validateEyeosCard, requestParser, rsaSigner);
	});

	function setVerifyRequestExpectations() {
		expEyeosCardValidate = validateEyeosCardMock.expects('validate')
			.once().withExactArgs(card, signature).returns(expectedResult);
		expParserGetCard = requestParserMock.expects('getCard')
			.once().withExactArgs(request).returns(card);
		expParserGetSignature = requestParserMock.expects('getSignature')
			.once().withExactArgs(request).returns(signature);
	}

	function setRenewCardExpectations(valid) {
		verifyRequestStub = sinon.stub(sut, 'verifyRequest', function() {
			return valid;
		});
		if (valid) {
			expRsaSignCard = rsaSignerMock.expects('signCard')
				.once().withExactArgs(userId, domain, cardCallback);
			expParserGetCard = requestParserMock.expects('getCard')
				.once().withExactArgs(request).returns(card);
		} else {
			expRsaSignCard = rsaSignerMock.expects('signCard').never();
			expCallbackUnSigned = cardCallbackMock.expects('unSigned').once().withExactArgs();
		}
	}

	test('verifyRequest should call RequestParser getCard', function() {
		setVerifyRequestExpectations();
		sut.verifyRequest(request);
		expParserGetCard.verify();
	});

	test('verifyRequest should call RequestParser getSignature', function() {
		setVerifyRequestExpectations();
		sut.verifyRequest(request);
		expParserGetSignature.verify();
	});

	test('verifyRequest should call ValidateEyeosCard validate with card and signature', function() {
		setVerifyRequestExpectations();
		sut.verifyRequest(request);
		expEyeosCardValidate.verify();
	});

	test('verifyRequest should return expectedResult', function() {
		setVerifyRequestExpectations();
		var result = sut.verifyRequest(request);
		assert.equal(expectedResult, result);
	});

	function setVerifyRequestWithMiniExpectations() {
		expEyeosCardValidate = validateEyeosCardMock.expects('validate')
			.once().withExactArgs(card, signature).returns(expectedResult);
		expParserGetCard = requestParserMock.expects('getCard')
			.once().withExactArgs(request, 'minicard').returns(card);
		expParserGetSignature = requestParserMock.expects('getSignature')
			.once().withExactArgs(request, 'minisignature').returns(signature);
	}

	test('verifyRequestWithMini should call RequestParser getCard', function() {
		setVerifyRequestWithMiniExpectations();
		sut.verifyRequestWithMini(request);
		expParserGetCard.verify();
	});

	test('verifyRequestWithMini should call RequestParser getSignature', function() {
		setVerifyRequestWithMiniExpectations();
		sut.verifyRequestWithMini(request);
		expParserGetSignature.verify();
	});

	test('verifyRequestWithMini should call ValidateEyeosCard validate with card and signature', function() {
		setVerifyRequestWithMiniExpectations();
		sut.verifyRequestWithMini(request);
		expEyeosCardValidate.verify();
	});

	test('verifyRequestWithMini should return expectedResult', function() {
		setVerifyRequestWithMiniExpectations();
		var result = sut.verifyRequestWithMini(request);
		assert.equal(expectedResult, result);
	});

	test('signCard should call rsaSigner signCard with userId, domain, and callback', function() {
		expRsaSignCard = rsaSignerMock.expects('signCard')
			.once().withExactArgs(userId, domain, cardCallback);
		sut.signCard(userId, domain, cardCallback);
		expRsaSignCard.verify();
	});

    test('signCardForPrincipal should call rsaSigner signCardForPrincipal with principal and callback', function() {
        expRsaSignCardForPrincipal = rsaSignerMock.expects('signCardForPrincipal')
            .once().withExactArgs(principal, cardCallback);
        sut.signCardForPrincipal(principal, cardCallback);
        expRsaSignCardForPrincipal.verify();
    });

	test('renewCard should call validateEyeosCard validate', function() {
		setRenewCardExpectations();
		sut.renewCard(request, cardCallback);
		assert(verifyRequestStub.calledWith(request));
	});

	test('renewCard should call rsaSigner signCard if valid request', function() {
		setRenewCardExpectations(true);
		sut.renewCard(request, cardCallback);
		expRsaSignCard.verify();
	});

	test('renewCard should not call rsaSigner signCard if not valid request', function() {
		setRenewCardExpectations(false);
		sut.renewCard(request, cardCallback);
		expRsaSignCard.verify();
	});

	test('renewCard should call renewCardCallback unSigned if not a valid request', function() {
		setRenewCardExpectations(false);
		sut.renewCard(request, cardCallback);
		expCallbackUnSigned.verify();
	});

	function setExpectationsForHasPermission() {
		verifyRequestStub = sinon.stub(sut, 'verifyRequest', function() {
			return true;
		});
		expParserGetCard = requestParserMock.expects('getCard')
			.once().withExactArgs(request).returns(card);
	}

	test('hasPermission should return true if permission is in card', function() {
		card = {
			'username': 'user1',
			'expiration': 3600,
			'permissions': [permission]
		};
		setExpectationsForHasPermission();
		var result = sut.hasPermission(request, permission);
		assert.isTrue(result);
	});

	test('hasPermission should return false if permission not in card', function() {
		card = {
			'username': 'user1',
			'expiration': 3600,
			'permissions': []
		};
		setExpectationsForHasPermission();
		var result = sut.hasPermission(request, permission);
		assert.isFalse(result);
	});

	test('hasPermission should return false if request is not valid', function () {
		var result = sut.hasPermission({}, permission);
		assert.isFalse(result);
	});

	suite('#getExpressMiddlewareAuth', function(){
		test('Should return a middleware function (3 params)', function(){
			var middleware = EyeosAuth.getAuthenticationExpressMiddleware(sut);

			assert.isFunction(middleware);
			assert.lengthOf(middleware, 3);
		});
	});

	suite('#getFakeAuth', function () {
		test('should call to getFakeAuth', function () {
			var getFakeAuthStub = sinon.stub(rsaSigner, 'getFakeAuth'),
				userId = 'fakeUser',
				permissions = 'fake permissions';
			sut.getFakeAuth(userId, permissions);
			sinon.assert.calledWithExactly(getFakeAuthStub, userId, permissions);
		});
	});
});
