import {
	AccountChannelsResponse,
	AccountCurrenciesResponse,
	AccountInfoResponse,
	AccountLinesResponse,
	AccountNFTsResponse,
	AccountObjectsResponse,
	AccountTxResponse,
	AccountTxTransaction,
	AccountObject,
	AccountNFToken,
	AccountLinesTrustline,
	Channel,
	Client,
} from 'xrpl';

export const dig = async (
	account: string,
	ws?: string,
	...options: Array<
		'info' | 'tx' | 'obj' | 'nft' | 'currency' | 'line' | 'channel'
	>
) => {
	if (!account) {
		console.log('account is not set');
		return;
	}
	const client = new Client(ws || 'wss://xrplcluster.com');
	await client.connect();

	// デフォルトで全ての情報を取得するように設定
	const finalOptions = {
		info: options.length === 0 || options.includes('info'),
		tx: options.length === 0 || options.includes('tx'),
		obj: options.length === 0 || options.includes('obj'),
		nft: options.length === 0 || options.includes('nft'),
		currency: options.length === 0 || options.includes('currency'),
		line: options.length === 0 || options.includes('line'),
		channel: options.length === 0 || options.includes('channel'),
	};

	const results: {
		info?: AccountInfoResponse;
		tx?: AccountTxTransaction[];
		obj?: AccountObject[];
		nft?: AccountNFToken[];
		currency?: string[];
		line?: AccountLinesTrustline[];
		channel?: Channel[];
	} = {};

	if (finalOptions.info) {
		const infoData: AccountInfoResponse = await client.request({
			command: 'account_info',
			account: account,
		});
		results.info = infoData;
	}

	if (finalOptions.tx) {
		const txData: AccountTxResponse = await client.request({
			command: 'account_tx',
			account: account,
			ledger_index_max: -1,
			limit: 1,
			tx_type: 'DIDSet',
		});
		results.tx = txData.result.transactions;
	}

	if (finalOptions.obj) {
		const objData: AccountObjectsResponse = await client.request({
			command: 'account_objects',
			account: account,
			type: 'did',
		});
		results.obj = objData.result.account_objects;
	}

	if (finalOptions.nft) {
		const nftData: AccountNFTsResponse = await client.request({
			command: 'account_nfts',
			account: account,
		});
		results.nft = nftData.result.account_nfts;
	}

	if (finalOptions.currency) {
		const currencyData: AccountCurrenciesResponse = await client.request({
			command: 'account_currencies',
			account: account,
		});
		results.currency = currencyData.result.receive_currencies;
	}

	if (finalOptions.line) {
		const lineData: AccountLinesResponse = await client.request({
			command: 'account_lines',
			account: account,
		});
		results.line = lineData.result.lines;
	}

	if (finalOptions.channel) {
		const channelData: AccountChannelsResponse = await client.request({
			command: 'account_channels',
			account: account,
		});
		results.channel = channelData.result.channels;
	}

	await client.disconnect();
	return results;
};
