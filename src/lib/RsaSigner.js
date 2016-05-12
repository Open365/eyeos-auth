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

var ValidCard = require('./ValidCard'),
	CardSigner = require('./CardSigner');

var RsaSigner = function(validCard, cardSigner) {
	this.validCard = validCard || new ValidCard();
	this.cardSigner = cardSigner || new CardSigner();
};

RsaSigner.prototype.signCard = function(userId, loginSignCardCallback) {
	var self = this;
	this.validCard.getCard(userId, function(card, minicard) {
		var signature = self.cardSigner.sign(card);
		var minisignature = self.cardSigner.sign(minicard);
		loginSignCardCallback.signed(card, signature, minicard, minisignature);
	});
};

RsaSigner.prototype.signCardForPrincipal = function(principal, loginSignCardCallback) {
    var self = this;
    this.validCard.getCardForPrincipal(principal.principalId, function(card, minicard) {
            var signature = self.cardSigner.sign(card);
            var minisignature = self.cardSigner.sign(minicard);
            loginSignCardCallback.signed(card, signature, minicard, minisignature);
        }, principal);
};

RsaSigner.prototype.getFakeAuth = function(userId, permissions) {
	var fakeTime = Date.now() + 1000;
	var fakeCard = {
		'expiration': fakeTime,
        'renewCardDelay': fakeTime,
        'username': userId,
        'permissions': permissions || []
	};
	var signature = this.cardSigner.sign(fakeCard);
	return {
		card: fakeCard,
		signature: signature
	};
};

module.exports = RsaSigner;
