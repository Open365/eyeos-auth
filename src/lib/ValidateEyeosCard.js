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

var CardHasher = require('./CardHasher'),
	RsaVerifier = require('./RsaVerifier'),
	ExpirationChecker = require('./ExpirationChecker'),
    settings = require('./settings');

var EYEOS_DEVELOPMENT_MODE = settings.EYEOS_DEVELOPMENT_MODE;

var ValidateEyeosCard = function (cardHasher, rsaVerifier, expirationChecker) {
	this.cardHasher = cardHasher || new CardHasher();
	this.rsaVerifier = rsaVerifier || new RsaVerifier();
	this.expirationChecker = expirationChecker || new ExpirationChecker();
};

if (EYEOS_DEVELOPMENT_MODE) { // in development mode all cards are true, just check mandatory params
    ValidateEyeosCard.prototype.validate = function(card, signature) {
        if (!card || !signature) {
            return false;
        }
        return true;
    };
} else {
    ValidateEyeosCard.prototype.validate = function (card, signature) {
        if (!card || !signature) {
            return false;
        }
        var valid = this.expirationChecker.check(card);
        if (!valid) {
            return false;
        }
        var hash = this.cardHasher.getHash(card);
        return this.rsaVerifier.verify(hash, signature);
    };
}

module.exports = ValidateEyeosCard;
