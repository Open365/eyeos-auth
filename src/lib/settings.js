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

var environment = process.env;
var log2out = require("log2out");

var logger = log2out.getLogger("Settings");
if (environment.EYEOS_RENEW_CARD_MINUTES_BEFORE_EXPIRATION !== undefined) {
	logger.warn("Using deprecated (and incorrect) setting EYEOS_RENEW_CARD_MINUTES_BEFORE_EXPIRATION.");
	logger.warn("Please use EYEOS_RENEW_CARD_SECONDS_BEFORE_EXPIRATION which uses the correct units.");

	environment.EYEOS_RENEW_CARD_SECONDS_BEFORE_EXPIRATION = environment.EYEOS_RENEW_CARD_MINUTES_BEFORE_EXPIRATION;
}
var settings = {
    EYEOS_DEVELOPMENT_MODE: environment.EYEOS_DEVELOPMENT_MODE === 'true' || false,
	validCardExpirationSeconds: parseInt(environment.EYEOS_EXPIRATION_CARD, 10) || (10 * 60 * 60), // 10 hours in seconds
	renewCardSecondsBeforeExpiration: parseInt(environment.EYEOS_RENEW_CARD_SECONDS_BEFORE_EXPIRATION, 10) || (30 * 60), //half hour in seconds,
	defaultDomain: environment.DEFAULT_DOMAIN || "open365.io",
	mongoInfo: {
		host: environment.EYEOS_AUTHENTICATION_MONGOINFO_HOST || 'mongo.service.consul',
		port: environment.EYEOS_AUTHENTICATION_MONGOINFO_PORT || 27017,
		db: environment.EYEOS_AUTHENTICATION_MONGOINFO_DB || 'eyeos'
	},
	server: {
		port: 4101,
		skipAuthentication: environment.EYEOS_AUTH_API_SERVER_SKIP_AUTH === 'true' || false
	},
	stompServer: {
		host: environment.EYEOS_VDI_SERVICE_USERQUEUE_HOST || 'rabbit.service.consul',
		port: environment.EYEOS_VDI_SERVICE_USERQUEUE_PORT || 61613,
		login: environment.EYEOS_BUS_MASTER_USER || 'guest',
		passcode: environment.EYEOS_BUS_MASTER_PASSWD || 'somepassword'
	},
	keys: {
		privatePem: environment.EYEOS_PRIVATE_PEM || "",
		publicPem: environment.EYEOS_PUBLIC_PEM || ""
	}
};


module.exports = settings;
