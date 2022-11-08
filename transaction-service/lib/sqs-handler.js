import { SQS } from 'aws-sdk'

export const publish = (data, queueUrl) => {
    try {
        const sqs = new SQS({
            region: process.env.REGION
        });
        const response = await sqs.sendMessage({
            MessageBody: JSON.stringify(data),
            QueueUrl: queueUrl
        }).promise();
    } catch (e) {
        console.log('Exception on queue', e);
    }
}