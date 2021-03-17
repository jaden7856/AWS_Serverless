'use strict';

var AWS = require('aws-sdk');

var elasticTranscoder = new AWS.ElasticTranscoder({
    region: 'us-east-1'
});

exports.handler = function(event, context, callback){
    console.log('Welcome');
    
    var key = event.Records[0].s3.object.key;
    var sourceKey = decodeURIComponent(key.replace(/\+/g, " "));
    var outputKey = sourceKey.split('.')[0];
    console.log('key:', key, sourceKey, outputKey);

    var params = {
        PipelineId: '1615427812753-h3sde8',
        Input: {
            Key: sourceKey
        },
        Outputs: [
            {
                Key: outputKey + '-1080p' + '.mp4',
                PresetId: '1351620000001-000001'
            },
            {
                Key: outputKey + '-720p' + '.mp4',
                PresetId: '1351620000001-000010'
            },
            {
                Key: outputKey + '-web-720p' + '.mp4',
                PresetId: '1351620000001-100070'
            }
        ]
    };
    elasticTranscoder.createJob(params, function(error, data){
        if (error){
            callback(error);
        }
    });
};