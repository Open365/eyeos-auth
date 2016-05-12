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

var SystemGroupsNotifier = require('../lib/SystemGroupsNotifier');

suite('SystemGroupsNotifier', function () {
    var sut, stompFireAndForgetClientMock;

    var stompFireAndForgetClient = {
        send: function() {}
    };
    var fakeStompSettings = {
        host: 'a host',
        port: 61613,
        login: 'login',
        passcode: 'pass'
    };
    var systemGroupId = '54b6ac495c002aa75c1c511a';
    var card = 'a card';
    var signature = 'a signature';

    setup(function () {
        stompFireAndForgetClientMock = sinon.mock(stompFireAndForgetClient);
        sut = new SystemGroupsNotifier(fakeStompSettings, stompFireAndForgetClient);
    });

    teardown(function() {
        stompFireAndForgetClientMock.restore();
    });

    suite('sendDoRenewCard', function () {

        test('Should call send with correct params', function(){
            var expectedDestination = '/topic/systemgroup.' + systemGroupId;
            var expectedMsg = {
                type: "doRenewCard",
                data: {}
            };
            var expSend = stompFireAndForgetClientMock.expects('send').once().withArgs(expectedDestination, expectedMsg);
            sut.sendDoRenewCard(systemGroupId);
            expSend.verify();
        });

    });


    suite('sendDoRenewCardForEach', function () {
        var sendDoRenewCardSpy;

        setup(function(){
            sendDoRenewCardSpy = sinon.spy(sut, 'sendDoRenewCard');
        });

        teardown(function(){
            sut.sendDoRenewCard.restore();
        });

        test('Should call sut.sendDoRenewCard for each element in the Array parameter', function(){
            
            var systemGroupIdsArray = ['a', 'b', 'c', 'd'];

            sut.sendDoRenewCardForEach(systemGroupIdsArray);

            assert.equal(sendDoRenewCardSpy.callCount, systemGroupIdsArray.length);

            sendDoRenewCardSpy.args.forEach(function(argsArray){
                assert.include(systemGroupIdsArray, argsArray[0], "sendDoRenewCard parameter: " + argsArray[0] + " not found in: "+systemGroupIdsArray);
            });
        });

        test('Should NOT call sut.sendDoRenewCard when passed null', function(){

            sut.sendDoRenewCardForEach(null);

            assert.isFalse(sendDoRenewCardSpy.called);
        });


        test('Should NOT call sut.sendDoRenewCard when passed a non-Array', function(){

            sut.sendDoRenewCardForEach('abcdef');

            assert.isFalse(sendDoRenewCardSpy.called);

            sut.sendDoRenewCardForEach(2345);

            assert.isFalse(sendDoRenewCardSpy.called);

            sut.sendDoRenewCardForEach({a:1, b:2});

            assert.isFalse(sendDoRenewCardSpy.called);
        });

    });

});
