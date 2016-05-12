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

var PrincipalProvider = require('eyeos-principal').PrincipalProvider;

var ValidCard = function(settings, principalProvider) {
	this.settings = settings || require('./settings');
	this.principalProvider = principalProvider || new PrincipalProvider();
};

ValidCard.prototype.getCardForPrincipal = function(userId, callback, principal) {
	//both expiration and renewCardDelay are expressed in seconds.
	var nowSeconds =  Math.floor(Date.now() / 1000);
	var expiration = nowSeconds + this.settings.validCardExpirationSeconds;
	var renewCardDelay = this.settings.validCardExpirationSeconds - this.settings.renewCardSecondsBeforeExpiration;
    var renewCardAt = expiration - renewCardDelay;
    var userDomain = principal.domain || this.settings.defaultDomain;
    principal.getPermissions(function(error, permissions){
        callback({
            'expiration': expiration,
            'renewCardDelay': renewCardDelay,
            'renewCardAt': renewCardAt,
            'username': userId,
            'domain': userDomain,
            'permissions': permissions
        }, {
            'expiration': expiration,
            'renewCardDelay': renewCardDelay,
            'username': userId,
            'domain': userDomain
        });
    })
};

ValidCard.prototype.getCard = function(userId, cb) {
    var self = this;
	this.principalProvider.getPrincipalById(userId, function (err, principal) {
        if (err) {
            console.error(err);
            return cb(err, null);
        }
        self.getCardForPrincipal(userId, cb, principal);
    });
};

module.exports = ValidCard;
