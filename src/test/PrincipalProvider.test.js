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

var sinon = require('sinon');
var assert = require('chai').assert;

var PrincipalProvider = require('../lib/PrincipalProvider');
var SystemGroupsNotifier = require('../lib/SystemGroupsNotifier');
var shelljs = require('shelljs');

var USER_ID = "a user id";
var USER_FIRST_NAME = "user first name";
var USER_LAST_NAME = "user last name";


suite('PrincipalProvider', function () {
	var sut, principal, principalMock, expFindOne, userId = 'testUser';
	var query, action, callback;

	//a fake user to return from mongoose mock
	var fakeUser;
	var userDoc;
	var PrincipalSingleton;
	var systemsGroupProviderFake;
	var systemsGroupProviderMock;
	var systemGroupsArray = ['a', 'b'];
	var systemGroups;

	var systemsGroupProviderFake = {
		getAllIn: function(arr, cb){cb(null, [])}
	};

	setup(function () {
		PrincipalSingleton = {
			getInstance: function () {
				return principal;
			}
		};

		//the doc to be used when calling findOne
		function returnUserDoc() {
			return userDoc;
		};

		systemGroups = ['54b6ac495c002aa75c1c511d','54b78dedbde2c3d7090a199d'];
		query = null;
		action = null;
		callback = null;
		fakeUser = {
			'permissions': ['test'],
			toObject: function(){return fakeUser;},
			systemGroups: systemGroupsArray
		};

		userDoc = {
			principalId: userId,
			toObject: returnUserDoc
		};

		systemsGroupProviderFake = {
			getAllIn: function(arr, cb){cb(null, [])},
			notify: function(x){}
		};
	});

    suite.skip('createPrincipal', function() {
        setup(function() {
            executeMongoQuery("db.principals.remove({})");
        });
        test("called with user, should persist user", function(done) {
            //GUARD ASSERTION
            assert.isTrue(executeMongoQuery('db.principals.find({},{_id:0, __v:0}).shellPrint()').length == 0, "incorrect database should be empty");
            sut = new PrincipalProvider(null, systemsGroupProviderFake);
            var user = {
                principalId: USER_ID,
                firstName: USER_FIRST_NAME,
                lastName: USER_LAST_NAME,
                systemGroups: [],
                permissions: []

            };
            sut.createPrincipal(user, function() {
                var query = executeMongoQuery('db.principals.find({},{_id:0, __v:0}).shellPrint()');
                assert.isTrue(query.length == 1, "incorrect, database length should be one");
                assert.deepEqual(user, query[0], "incorrect, user should have same value");
                done();
            });
        });
    });

	suite('getPrincipal', function () {
		//setup(generalSetup);

		test('Should check if the user exists before creating it', function(){
			principal = {
				findOne: function() {}
			};
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);
			var principalMock = sinon.mock(principal);
			expFindOne = principalMock.expects('findOne').once().withArgs(sinon.match.has('principalId'));
			sut.getPrincipal(userId);
			expFindOne.verify();
			principalMock = null;
		});

		test('Should return the user, if it exists', function(done){
			principal = {
				findOne: function(query, cb) {cb(false,fakeUser)}
			};
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);
			sut.getPrincipal(userId, function(ret) {
				assert.deepEqual(ret, fakeUser);
				done();
			});
		});

		test('Should call PrincipalSingleton getInstance', function() {
			principal = {
				findOne: function() {}
			};
			var expectPpalSingletonGetInstance = sinon.mock(PrincipalSingleton).expects('getInstance')
				.once().withExactArgs().returns(principal);
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);
			sut.getPrincipal(userId);
			expectPpalSingletonGetInstance.verify();
			expectPpalSingletonGetInstance.reset();
		});

		test('Should call systemGroupsProvider.getAllIn to get all systemgroups details', function(){
			principal = {
				findOne: function(query, cb) {cb(false,fakeUser)}
			};
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);
			systemsGroupProviderMock = sinon.mock(systemsGroupProviderFake);
			var expectSystGroupProvGetAllIn = systemsGroupProviderMock.expects('getAllIn').once().withExactArgs(systemGroupsArray, sinon.match.func);

			sut.getPrincipal(userId);

			expectSystGroupProvGetAllIn.verify();
		});
	});

	suite('addSystemGroups', function () {
		test('Should call Principal update with correct values', function() {
			principal = {
				update: function(providedQuery, providedAction, providedCallback) {
					query = providedQuery;
					action = providedAction;
					callback = providedCallback;
					if (providedCallback){
						providedCallback(false);	
					} 
				}
			};
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);
			sut.addSystemGroups(userId, systemGroups);
			assert.deepEqual(query, {principalId: userId});
			assert.deepEqual(action, {$addToSet: {systemGroups: {$each: systemGroups}}});
		});

		test('Should notify on systemgroups addition', function(){
			principal = {
				update: function(providedQuery, providedAction, providedCallback) {
					query = providedQuery;
					action = providedAction;
					callback = providedCallback;
					if (providedCallback){
						providedCallback(false);	
					} 
				}
			};
			systemsGroupProviderMock = sinon.mock(systemsGroupProviderFake);
			var expectSystemGroupProviderNotify = systemsGroupProviderMock.expects('notify').once().withExactArgs(systemGroups);
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);

			sut.addSystemGroups(userId, systemGroups);

			expectSystemGroupProviderNotify.verify();
		});
	});

	suite('removeSystemGroups', function () {
		test('Should call Principal update with correct values', function () {
			principal = {
				update: function (providedQuery, providedAction, providedCallback) {
					query = providedQuery;
					action = providedAction;
					callback = providedCallback;
				}
			};
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);
			sut.removeSystemGroups(userId, systemGroups);
			assert.deepEqual(query, {principalId: userId});
			assert.deepEqual(action, {$pullAll: {systemGroups: systemGroups}});

		});

		test('Should notify on systemgroups removal', function(){
			principal = {
				update: function(providedQuery, providedAction, providedCallback) {
					query = providedQuery;
					action = providedAction;
					callback = providedCallback;
					if (providedCallback){
						providedCallback(false);	
					} 
				}
			};
			systemsGroupProviderMock = sinon.mock(systemsGroupProviderFake);
			var expectSystemGroupProviderNotify = systemsGroupProviderMock.expects('notify').once().withExactArgs(systemGroups);
			sut = new PrincipalProvider(PrincipalSingleton, systemsGroupProviderFake);

			sut.removeSystemGroups(userId, systemGroups);

			expectSystemGroupProviderNotify.verify();
		});
	});

	suite('setAndUpdateSystemGroupsFromDb', function () {
		test('Should call toObject to object found in Mongo.', function(){
			var principalfromDBFake = {
				toObject: function() {}
			};

			var expToObject = sinon.mock(principalfromDBFake).expects('toObject').once().withExactArgs().returns({});
			sut.setAndUpdateSystemGroupsFromDb(principalfromDBFake, function() {});

			expToObject.verify();

		});

		test('Should call the callback function with the principalObject.', function(){
			var principalfromDBFake = {
				toObject: function() {return {}}
			};

			var callbackStub = sinon.stub();
			sut.setAndUpdateSystemGroupsFromDb(principalfromDBFake, callbackStub);

			assert(callbackStub.calledOnce);
			assert(callbackStub.calledWithExactly(sinon.match({})));
		});

		test('Should not save the object if the system groups match', function(){
			var principalfromDBFake = {
				toObject: function() {return {}},
				save: function() {},
				systemGroups: systemGroupsArray
			};

			var expNeverSave = sinon.mock(principalfromDBFake).expects('save').never();
			sut.setAndUpdateSystemGroupsFromDb(principalfromDBFake, function() {}, null, systemGroupsArray);

			expNeverSave.verify();
		});

		test('Should save the object if the system groups are different', function(){
			var principalfromDBFake = {
				toObject: function() {return {}},
				save: function() {},
				systemGroups: systemGroupsArray
			};

			var expDoSave = sinon.mock(principalfromDBFake).expects('save').once();
			sut.setAndUpdateSystemGroupsFromDb(principalfromDBFake, function() {}, null, []);

			expDoSave.verify();
		});
	});
});

function executeMongoQuery(query) {
    var result = "["+shelljs.exec("mongo eyeos --quiet --eval \""+query+"\"").output+"]";
    try{
        result = JSON.parse(result);
    } catch(e) {
        result = [];
    }
    return result;
}
