import { AccountChannelsResponse, AccountCurrenciesResponse, AccountInfoResponse, AccountNFTsResponse, AccountObjectsResponse, AccountTxResponse, Client } from "xrpl";

export const websocket = async (account: string, ws: string) => {
    if (account && ws) {
        const client = new Client(ws);
        await client.connect();

        const infoData: AccountInfoResponse = await client.request({
          command: "account_info",
          account: account,
        });
        const info = infoData.result

        const txData: AccountTxResponse = await client.request({
          command: "account_tx",
          account: account,
          ledger_index_max: -1,
          limit: 1,
          tx_type: "DIDSet"
        });
        const tx = txData.result.transactions

        const objData: AccountObjectsResponse = await client.request({
          command: "account_objects",
          account: account,
          type: "did",
        });
        const obj = objData.result.account_objects

        const nftData: AccountNFTsResponse = await client.request({
          command: "account_nfts",
          account: account,
        });
        const nft = nftData.result.account_nfts

        const currencyData: AccountCurrenciesResponse = await client.request({
          command: "account_currencies",
          account: account,
        });
        const currency = currencyData.result.receive_currencies

        const channelData: AccountChannelsResponse = await client.request({
          command: "account_channels",
          account: account,
        });
        const channel = channelData.result.channels

        await client.disconnect()
        return { info, tx, obj, nft, channel, currency}
    }
};
