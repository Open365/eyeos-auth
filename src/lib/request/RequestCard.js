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

function RequestCard(cardJson) {
	this.cardHolder = cardJson;
}

function isInPermission(permission, base) {
	var baseSplit = base.split('.');
	var permissionSplit = permission.split('.');

	if (permissionSplit.length < baseSplit.length) {
		return false;
	}

	for (var i = 0; i < permissionSplit.length; i++) {
		if (baseSplit[i] === undefined) {
			return true;
		}
		if (baseSplit[i] !== permissionSplit[i] && baseSplit[i] !== "*") {
			return false;
		}
	}
	return true;
}

RequestCard.prototype.hasPermission = function (permission) {
	if (this.cardHolder == null || this.cardHolder.permissions == null) {
		return false;
	}

	const permissionArray = this.cardHolder.permissions;

	if (!permission ||
		Object.prototype.toString.call(permissionArray).indexOf('Array') === -1) {
		return false;
	} else if (permissionArray.indexOf(permission) > -1) {
		return true;
	} else if (permissionArray.indexOf("EYEOS_ADMINISTRATOR") > -1) {
		return true;
	}

	return permissionArray.some(isInPermission.bind(null, permission));
};

RequestCard.prototype.getApplicationsPermissions = function () {

	var appPermissions = [];

	if (this.cardHolder == null || this.cardHolder.permissions == null) {
		return appPermissions;
	}

	const permissionArray = this.cardHolder.permissions;

	appPermissions  = permissionArray.filter(function(item) {
		return item.indexOf('eyeos.application')?false:true;
	});

	return appPermissions;
};


module.exports = RequestCard;
