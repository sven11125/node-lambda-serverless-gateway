import AWS from 'aws-sdk';

let documentClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.REGION,
});

if(process.env.IS_OFFLINE && process.env.STAGE === 'local') {
    documentClient = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    });
}

export default documentClient;