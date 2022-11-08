
import { TRANSACTION_TYPES_CONTRACT_METHOD } from "./constants";
import { nextId } from "./sharder";
import { publish } from "./sqs-handler";
import { saveNewWalletTransaction } from "./model/transaction";

export class TransactionService {


    constructor() {
        //TODO pick this variable from env
        const CONTRACT = "testnet";
        const QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue";

        const BLOCK_CHAIN_STATUS = {
            PENDING: "pending",
            SUCCESS: "success",
        }

    }


    async createTransaction(newTransaction) {

        switch (newTransaction.type) {

            case TRANSACTION_TYPES_CONTRACT_METHOD.CREATE_ACCOUNT:
                if (!newTransaction.newPublicKey) throw new Error("newPublicKey is required");
                return await this.createWallet(newTransaction, newTransaction.newPublicKey);
            default:
                return new Error("Invalid transaction type");
        }

    }


    //TODO i dont know but i think the user id should be retrieved from the auth token
    getUserIdFromToken(token) {
        return "user-id-from-token";
    }

    //body of the messages can be found here: https://github.com/nearcomponents/contracts-documentation#message-samples

    async createWallet(createWalletTransaction, newPublicKey) {

        createWalletTransaction.transactionId = nextId();
        createWalletTransaction.userId = this.getUserIdFromToken('');
        createWalletTransaction.type = TRANSACTION_TYPES_CONTRACT_METHOD.CREATE_ACCOUNT;
        createWalletTransaction.blockchainStatus = BLOCK_CHAIN_STATUS.PENDING;
        createWalletTransaction.tagsJson = {
            appId: createWalletTransaction.appId,
            actionId: createWalletTransaction.actionId,
            userId: createWalletTransaction.userId
        }

        delete createWalletTransaction.newPublicKey;


        await saveNewWalletTransaction(createWalletTransaction);

        const dataToPublish = {
            id: createWalletTransaction.transactionId,
            operation: "execute",
            contract: CONTRACT,
            method: CONTRACT_METHOD.CREATE_ACCOUNT,
            args: {
                new_account_id: transaction.senderWalletId,
                new_public_key: newPublicKey
            },
            sender: transaction.senderWalletId,
            tags: {
                app_id: transaction.appId,
                action_id: transaction.actionId,
            }
        }

        await publish(dataToPublish, QUEUE_URL);

    }


}