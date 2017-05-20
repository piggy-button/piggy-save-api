"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('./guid');

const putSetting = (organizationID, amount) =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                organizationID: {"S": organizationID},
                date: {"S": date.toString()},
                amount: {"S": amount.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "donate_settings"
        };
        dynamodb.putItem(params, (err, data)=>
        {
            log("putOrganization err:", err);
            log("putOrganization data:", data);
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    }); 
};

const listSettings = ()=>
{
    return new Promise((success, failure)=>
    {
        var params = {
            Limit: 25,
            Select: 'ALL_ATTRIBUTES',
            TableName: "donate_settings"
        };
        dynamodb.scan(params, (err, data)=>
        {
            if(err)
            {
                return failure(err);
            }
            const items = _.chain(data)
            .get('Items')
            .map(item =>
            {
                return {
                    id: _.get(item, 'id.S'),
                    organizationID: _.get(item, 'organizationID.S'),
                    amount: parseInt(_.get(item, 'amount.S')),
                    date: new Date(_.get(item, 'date.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

module.exports = {
    putSetting,
    listSettings
};