import { DynamoWrapper } from '../dynamo-wrapper';
import documentClient from './document-client';

const params = {
    TableName: "transactions",
};

// TODO pagination? we talk about pagination in the user stories but we
// didnt implemented here because the mockupsapi doesnt have pagination
const getTransactions = async () => {

    const scanResults = [];
    let items;
    let data;
    do {
        data = await documentClient.scan(params).promise();
        items = data.Items;
        scanResults.push(...items);
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    return scanResults;

};

const getTransactionById = async (id) => {

        params.Key = {
            transaction_id: id
        };
        const data = await documentClient.get(params).promise();
        return data.Item;

};

const getTransactionByOwnerId = async (ownerId) => {
    try {
        return DynamoWrapper.scan({
            tableName: params.TableName,
            filterExpression: "sender_id = :ownerId OR recipient_id = :ownerId",
            expressionAttributeValues: {
              ":ownerId": ownerId,
            },
          });
    } catch (error) {
        throw new Error(error);
    }
};

const saveNewWalletTransaction = async (newWalletTransaction) => {

    const { transactionId, userId, senderWalletId,
                 gasFee, gasAdvance, type, blockchainStatus, tagsJson } = newWalletTransaction;

    const insert = {
        TableName: params.TableName,
        Item: {
            transactionId,
            userId,
            senderWalletId,
            gasFee,
            gasAdvance,
            blockchainStatus,
            type,
            tagsJson,
            app_id,
            action_id,
            user_id
        }
    };

    return await documentClient.put(insert).promise();
};

export {
    getTransactions,
    getTransactionById,
    getTransactionByOwnerId,
    saveNewWalletTransaction
};