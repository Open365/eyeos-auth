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

var CardHasher = function(crypto, stringify) {
	this.crypto = crypto || require('crypto');
	this.stringify = stringify || require('./OrderedStringify');
};

CardHasher.prototype.getHash = function(card) {
	var stringCard = this.stringify(card);
	var md5 = this.crypto.createHash('md5');
	var md5Updated = md5.update(stringCard);
	return md5Updated.digest('hex');
};

module.exports = CardHasher;
