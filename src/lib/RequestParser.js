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

var log2out = require('log2out');

var RequestParser = function()  {
	this.logger = log2out.getLogger('RequestParser');
};

RequestParser.prototype.getCard = function(request, cardType) {
	cardType = cardType || 'card';
	var CardType = cardType.charAt(0).toUpperCase() + cardType.slice(1);
	if (!request.headers || (!request.headers[cardType] && !request.headers[CardType])) {
		this.logger.warn('Invalid headers');
		return null;
	}

	var card = null;
	try {
		card = JSON.parse(request.headers[cardType] || request.headers[CardType]);
	} catch (err) {
		this.logger.warn('Invalid JSON in request.headers.card:', request.headers[cardType]);
		this.logger.warn(err);
	}

	return card;
};

RequestParser.prototype.getSignature = function(request, signatureType) {
	signatureType = signatureType || 'signature';
	var SignatureType = signatureType.charAt(0).toUpperCase() + signatureType.slice(1);
	if (!request.headers || (!request.headers[signatureType] && !request.headers[SignatureType])) {
		this.logger.warn('Invalid headers');
		return '';
	}

	return request.headers[signatureType] || request.headers[SignatureType];
};

module.exports = RequestParser;
