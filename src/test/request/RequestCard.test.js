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

var sinon = require('sinon'),
	assert = require('chai').assert;

var RequestCard = require('../../lib/request/RequestCard');

suite("RequestCard", function () {
	suite("hasPermission", function () {

		function generateCard(forPermission) {
			return { permissions: forPermission };
		}

		[
			{ cardHolder: null, check: "papuki", expectedResult: false },
			{ cardHolder: generateCard([]), check: "papuki", expectedResult: false },
			{ cardHolder: generateCard(["papuki"]), check: "papuki", expectedResult: true },
			{ cardHolder: generateCard(["papuki"]), check: "papuki.pepe", expectedResult: true },
			{ cardHolder: generateCard(["papuki"]), check: "paputi", expectedResult: false },
			{ cardHolder: generateCard(["eyeos.*.admin"]), check: "eyeos.pepito.admin", expectedResult: true },
			{ cardHolder: generateCard(["eyeos.*.admin"]), check: "asd.pepito.admin", expectedResult: false },
			{ cardHolder: generateCard(["eyeos.*.admin.pepe"]), check: "eyeos.pepito.admin", expectedResult: false },
			{ cardHolder: generateCard(["eyeos.*.admin"]), check: "eyeos.pepito.admin.palotes", expectedResult: true },
			{ cardHolder: generateCard(["EYEOS_ADMINISTRATOR"]), check: "anything.will.return.true", expectedResult: true }
		].forEach(function (testCase) {
			test("it must return " + testCase.expectedResult + " on case " + JSON.stringify(testCase), function () {
				var sut = new RequestCard(testCase.cardHolder);
				assert.equal(sut.hasPermission(testCase.check), testCase.expectedResult, 'You don\'t have permissions to access to ' + testCase.check);
			});
		});






	});

	suite("getApplicationsPermissions", function () {

		function generateCard(forPermission) {
			return { permissions: forPermission };
		}

		[{ cardHolder: generateCard([
			"eyeos.schedule.admin",
			"eyeos.application.excel",
			"eyeos.application.word",
			"eyeos.vdi.exec"
		]), expectedResult: [
			"eyeos.application.excel",
			"eyeos.application.word"
		]},{ cardHolder: generateCard([
			"eyeos.schedule.admin",
			"eyeos.vdi.exec"
		]), expectedResult: []}, {
			cardHolder: generateCard([
			"eyeos.application.excel",
			"eyeos.application.word"
		]), expectedResult: [
			"eyeos.application.excel",
			"eyeos.application.word"
			]}
		].forEach(function(testCase) {
			test("it must return only applications permissions", function () {
				var sut = new RequestCard(testCase.cardHolder);
				assert.deepEqual(sut.getApplicationsPermissions(), testCase.expectedResult);
			});
		}) ;

	});
});
