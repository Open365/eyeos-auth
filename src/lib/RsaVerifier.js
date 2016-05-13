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

var settings = require('./settings.js');
var log2out = require('log2out');

var RsaVerifier = function(publicPem) {
	this.logger = log2out.getLogger('RsaVerifier');
	this.publicPem = publicPem || new Buffer(settings.keys.publicPem, 'base64').toString("utf-8");
};

RsaVerifier.prototype.verify = function(hash, signature, verifierInjected) {
	if (settings.keys.publicPem) {
		this.logger.error("Incorrect public key, please provide a valid one.");
	}

	this.verifier = verifierInjected || require('crypto').createVerify('RSA-SHA256');
	this.verifier.update(hash);
	return this.verifier.verify(this.publicPem, signature, 'base64');
};

module.exports = RsaVerifier;
