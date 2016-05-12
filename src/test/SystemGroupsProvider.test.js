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

var SystemGroupsProvider = require('../lib/SystemGroupsProvider');

suite('SystemGroupsProvider', function () {
    var sut, systemGroup, systemGroupMock, systemGroupNotifierMock, id, name, permissions, callback;

    var id = '54b6a896be9690765b628cc2';
    var name = 'a group name';
    var permissions = [
        'esto.aquello.admin',
        'lootro.esto.admin'
    ];
    var error = 'error';
    var condition = '';
    var card = 'a card';
    var signature = 'a signature';
    var fakeMongoSettings = {
        host: 'a host',
        port: 27017,
        db:'testdb'
    };
    var fakeStompSettings = {
        host: 'a host',
        port: 61613,
        login: 'login',
         passcode: 'pass'
    };

    var SystemGroupSingleton = {
        getInstance: function() {
            return systemGroup;
        }
    };
    var systemGroupNotifier = {
        sendDoRenewCard: function() {},
        sendDoRenewCardForEach: function () {}
    };

    setup(function () {
        callback = sinon.spy();
        systemGroup = function(){return systemGroup};
        systemGroup.findById = function() {};
        systemGroup.find = function() {};
        systemGroup.update = function() {};
        systemGroup.save = function() {};
        systemGroupNotifierMock = sinon.mock(systemGroupNotifier);
    });

    teardown(function() {
        systemGroupNotifierMock.restore();
    });

    suite('create', function () {

        test('Should call save with correct params', function(){
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expSave = systemGroupMock.expects('save').once().withArgs(sinon.match.func);
            sut.create(name, permissions, callback);
            expSave.verify();
        });
    });


    suite('update', function () {

        test('Should call update with correct params', function(){
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expUpdate = systemGroupMock.expects('update').once().withArgs({_id: id}, {
                name: name,
                permissions: permissions
            }, sinon.match.func);
            sut.update(id, name, permissions, card, signature, callback);
            expUpdate.verify();
        });

        test('Should call systemGroupsNotifier sendDoRenewCard with correct params', function(){
            systemGroup = {
                update: function(id, condition, callback) {
                    callback.call(sut, null);
                }
            };
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            var expSendRenewCard = systemGroupNotifierMock.expects('sendDoRenewCard').once().withArgs(id);
            sut.update(id, name, permissions, card, signature, callback);
            expSendRenewCard.verify();
        });

    });

    suite('get', function () {

        test('if id is provided should call findById', function(){
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expSave = systemGroupMock.expects('findById').once().withArgs(id, callback);
            sut.get(id, callback);
            expSave.verify();
        });

        test('if no id is provided should call find', function(){
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expSave = systemGroupMock.expects('find').once().withArgs({}, callback);
            sut.get(null, callback);
            expSave.verify();
        });

    });

    suite('getAllIn', function () {

        test('should call find when arrayOfIds has elements', function () {
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expSave = systemGroupMock.expects('find').once().withArgs(sinon.match.object.and(sinon.match.has('_id')), sinon.match.func);
            sut.getAllIn(['a'], callback);
            expSave.verify();
        });

        test('should not call find when arrayOfIds has no elements', function () {
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expSave = systemGroupMock.expects('find').never();
            sut.getAllIn([], callback);
            expSave.verify();
        });

        test('should not call find when arrayOfIds is null', function () {
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            systemGroupMock = sinon.mock(systemGroup);
            var expSave = systemGroupMock.expects('find').never();
            sut.getAllIn(null, callback);
            expSave.verify();
        });
    });

    suite('delete', function () {

        test('Should call remove', function(){
            systemGroup = {
                remove: function() {}
            };
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            var foundSystemGroupMock = sinon.mock(systemGroup);
            var expRemove = foundSystemGroupMock.expects('remove').once().withArgs({_id: id}, sinon.match.func);
            sut.delete(id, card, signature, callback);
            expRemove.verify();
        });

        test('Should call systemGroupsNotifier sendDoRenewCard with correct params', function(){
            systemGroup = {
                remove: function(id, callback) {
                    callback.call(sut, null);
                }
            };
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            var expSendRenewCard = systemGroupNotifierMock.expects('sendDoRenewCard').once().withArgs(id);
            sut.delete(id, card, signature, callback);
            expSendRenewCard.verify();
        });

    });

    suite('notify', function () {

        test('Should delegate to systemGroupNotifier', function(){
            var systemGroupsArr = ['a', 'b', 'c'];
            sut = new SystemGroupsProvider(fakeMongoSettings, fakeStompSettings, SystemGroupSingleton, systemGroupNotifier);
            var expSendRenewCardForEach = systemGroupNotifierMock.expects('sendDoRenewCardForEach').once().withArgs(systemGroupsArr);

            sut.notify(systemGroupsArr);

            expSendRenewCardForEach.verify();

        });
    });
});
