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

var CardHasher = require('./CardHasher');
var settings = require('./settings.js');
var log2out = require('log2out');

var CardSigner = function(privatePem, cardHasher) {
	this.logger = log2out.getLogger('CardSigner');
	if (settings.keys.privatePem === "" && !privatePem){
		this.logger.error("Incorrect private key, please provide a valid one.");
	} else {
		this.privatePem = privatePem || new Buffer(settings.keys.privatePem, 'base64').toString("utf-8");
	}
	this.cardHasher = cardHasher || new CardHasher();
};

CardSigner.prototype.sign = function(card, signerInjected) {
	var hash = this.cardHasher.getHash(card);
	this.signer = signerInjected || require('crypto').createSign('RSA-SHA256');
	this.signer.update(hash);
	return this.signer.sign(this.privatePem, 'base64');
};

module.exports = CardSigner;
