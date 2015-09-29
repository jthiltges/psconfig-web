'use strict';

//this is just a sample

//contrib
var Sequelize = require('sequelize');
var winston = require('winston');

//mine
var config = require('../config/config');
var logger = new winston.Logger(config.logger.winston);

//for field types
//http://docs.sequelizejs.com/en/latest/api/datatypes/

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Admin', {
        sub: Sequelize.STRING, //as presented by auth service user id (jwt.sub)
    }, {
        classMethods: {
        },
        instanceMethods: {
        }
    });

}

