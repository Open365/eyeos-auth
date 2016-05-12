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

// Class duplicated with the one called AuthenticationChecker in PrincipalService
// but it uses EyeosAuth as a own class instead of a external library

var log2out = require('log2out');
var EyeosAuth = require('./EyeosAuth');

var AuthenticationExpressMiddleware = function(eyeosAuth) {
    /* FIXME: Having the require of EyeosAuth here is a HACK.
     *
     * Historically eyeos-auth is exporting just EyeosAuth class
     * We want to export other things such as this AuthenticationExpressMiddleware
     * For that reason, EyeosAuth is requiring AuthenticationExpressMiddleware and
     * AuthenticationExpressMiddleware is requiring EyeosAuth (we have a circular dependency)
     * to avoid the code breaking, we delay the require of EyeosAuth
     * here to the last possible moment.
     */

    this.eyeosAuth = eyeosAuth || new EyeosAuth();
    this.logger = log2out.getLogger('AuthenticationExpressMiddleware');
};

AuthenticationExpressMiddleware.prototype.check = function(req, res, next) {
    this.logger.debug('Checking request with card:', req.headers && req.headers.card);
    var cardIsValid = this.eyeosAuth.verifyRequest(req);
    if (!cardIsValid) {
        this.logger.debug('Invalid card:', req.headers && req.headers.card);
        return res.send(401);
    }
    next();
};

AuthenticationExpressMiddleware.prototype.getMiddleware = function getMiddleware() {
    return this.check.bind(this);
};

module.exports = AuthenticationExpressMiddleware;
