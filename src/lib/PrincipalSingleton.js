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

var PrincipalSingleton = {
	Principal: null,

	getInstance: function() {
		if (this.Principal) {
			return this.Principal;
		}
		var mongoose = require('mongoose');
		var settings = require('./settings');
		var db_lnk  = 'mongodb://' + settings.mongoInfo.host + ':' + settings.mongoInfo.port + '/' + settings.mongoInfo.db;
		var db = mongoose.createConnection(db_lnk);

		var PrincipalSchema = require('./schema/PrincipalSchema');
		this.Principal = db.model('principals', PrincipalSchema);

		return this.Principal;
	}
};

module.exports = PrincipalSingleton;
