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
var SystemGroup = require('./schema/SystemGroupSchema');
var SystemGroupsNotifier = require('./SystemGroupsNotifier');

var SystemGroupsProvider = function(mongoSettings, stompSettings, SystemGroupsSingleton, systemGroupsNotifier) {
    this.logger = log2out.getLogger('SystemGroupsProvider');
    this.mongoSettings = mongoSettings;
    this.systemGroupsSingleton = SystemGroupsSingleton || require('./SystemGroupsSingleton.js');
    this.systemGroupsNotifier = systemGroupsNotifier || new SystemGroupsNotifier(stompSettings);
    this.systemGroupPrefix = 'eyeos.systemgroup.';
};

SystemGroupsProvider.prototype.create = function(name, permissions, callback) {
    var self = this;
    var SystemGroup = this.systemGroupsSingleton.getInstance(this.mongoSettings);
    var systemGroup = new SystemGroup();
    systemGroup.name = name;
    systemGroup.permissions = permissions;
    this.logger.debug('Creating systemGroup:', systemGroup);
    systemGroup.save(function (err, savedSystemGroup) {
        self.logger.debug("Updating systemGroup permissions: inserting self permission");
        savedSystemGroup.update({$push: {permissions: self.systemGroupPrefix + savedSystemGroup._id}}, callback);
    });
};

SystemGroupsProvider.prototype.update = function(id, name, permissions, card, signature, callback) {
    var self = this;
    var systemGroup = this.systemGroupsSingleton.getInstance(this.mongoSettings);
    systemGroup.update({_id: id},
        {
            name: name,
            permissions: permissions
        }, function(err) {
            if (!err) {
                self.systemGroupsNotifier.sendDoRenewCard(id);
            }
            callback(err);
        });
};

SystemGroupsProvider.prototype.get = function(id, callback) {
    var systemGroup = this.systemGroupsSingleton.getInstance(this.mongoSettings);
    if (id) {
        systemGroup.findById(id, callback);
    } else {
        systemGroup.find({}, callback);
    }
};

SystemGroupsProvider.prototype.getAllIn = function(arrayOfIds, callback) {
    if (arrayOfIds && arrayOfIds.length) {
        var SystemGroups = this.systemGroupsSingleton.getInstance(this.mongoSettings);
        SystemGroups.find({_id: {$in: arrayOfIds}}, callback);
    } else {
        callback(null, []);
    }
};


SystemGroupsProvider.prototype.delete = function(id, card, signature, callback) {
    var self = this;
    var systemGroup = this.systemGroupsSingleton.getInstance(this.mongoSettings);
    systemGroup.remove({_id: id}, function(err) {
        if (!err) {
            self.systemGroupsNotifier.sendDoRenewCard(id);
        }
        callback(err);
    });
};

SystemGroupsProvider.prototype.notify = function(systemGroups) {
        this.systemGroupsNotifier.sendDoRenewCardForEach(systemGroups);
};


module.exports = SystemGroupsProvider;
