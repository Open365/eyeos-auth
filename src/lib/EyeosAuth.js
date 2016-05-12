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

var ValidateEyeosCard = require('./ValidateEyeosCard'),
	RequestParser = require('./RequestParser'),
	RsaSigner = require('./RsaSigner');
	RequestCard = require('./request/RequestCard'),
    ValidCard = require('./ValidCard');

var EyeosAuth = function(validateEyeosCard, requestParser, rsaSigner) {
	this.validateEyeosCard = validateEyeosCard || new ValidateEyeosCard();
	this.requestParser = requestParser || new RequestParser();
	this.rsaSigner = rsaSigner || new RsaSigner();
};


EyeosAuth.prototype.verifyRequest = function(request) {
	var card = this.requestParser.getCard(request);
	var signature = this.requestParser.getSignature(request);
	return this.validateEyeosCard.validate(card, signature);
};

EyeosAuth.prototype.verifyRequestWithMini = function(request) {
	var card = this.requestParser.getCard(request, 'minicard');
	var signature = this.requestParser.getSignature(request, 'minisignature');
	return this.validateEyeosCard.validate(card, signature);
};

EyeosAuth.prototype.signCard = function(userId, signCardCallback) {
	this.rsaSigner.signCard(userId, signCardCallback);
};

EyeosAuth.prototype.signCardForPrincipal = function(principal, signCardCallback) {
    this.rsaSigner.signCardForPrincipal(principal, signCardCallback);
};

EyeosAuth.prototype.renewCard = function(request, renewCardCallback) {
	var valid = this.verifyRequest(request);
	if (valid) {
		var card = this.requestParser.getCard(request);
		this.rsaSigner.signCard(card.username, renewCardCallback);
	} else {
		renewCardCallback.unSigned();
	}
};

EyeosAuth.prototype.hasPermission = function(request, permission) {
	var valid = this.verifyRequest(request);
	if (!valid) {
		return false;
	}

	var card = new RequestCard(this.requestParser.getCard(request));
	return card.hasPermission(permission);
};

EyeosAuth.prototype.getApplicationsPermissions = function(request) {
	var valid = this.verifyRequest(request);
	if (!valid) {
		throw new Error("Invalid or expired card.");
	}

	var card = new RequestCard(this.requestParser.getCard(request));
	return card.getApplicationsPermissions();
};

EyeosAuth.prototype.getServiceCard = function (serviceId) {
	return this.getFakeAuth(serviceId, ['EYEOS_ADMINISTRATOR']);
};

// gets a fake auth for a user -> for component-test only
EyeosAuth.prototype.getFakeAuth = function(userId, permissions) {
	return this.rsaSigner.getFakeAuth(userId, permissions);
};

EyeosAuth.createRsaSigner = function (principalProvider, settings) {
    if (!principalProvider) {
        throw new Error("principalProvider is a mandatory argument (1st).");
    }
    return new RsaSigner(new ValidCard(settings, principalProvider));
};

EyeosAuth.getAuthenticationExpressMiddleware = function getAuthenticationExpressMiddleware(eyeosAuthInstance) {
	var AuthenticationExpressMiddleware = require('./AuthenticationExpressMiddleware');
	return new AuthenticationExpressMiddleware(eyeosAuthInstance).getMiddleware();
};

var PrincipalSchema = require('./schema/PrincipalSchema');
var SystemGroupSchema = require('./schema/SystemGroupSchema');

EyeosAuth.schemas = {
    PrincipalSchema: PrincipalSchema,
    SystemGroupSchema: SystemGroupSchema
};

module.exports = EyeosAuth;
