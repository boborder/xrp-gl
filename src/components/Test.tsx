"use client"

import { ComponentProps, useState, useEffect } from "react";
import { Wallet, Client, xrpToDrops, getBalanceChanges, Transaction } from "xrpl";

type WalletData = {
    address: string;
    publicKey: string;
    privateKey: string;
    seed: string;
    balance: number;
};

export const Test = () => {
    // 初期値
    const initialWallet = {
        address: "",
        publicKey: "",
        privateKey: "",
        seed: "",
        balance: 0,
    };

    // ウォレットのデータを入れるstateを作成
    const [wallet, setWallet] = useState<WalletData>(initialWallet);
    const [stats, setStats] = useState<string | undefined>("TxData");
    const [raw, setRaw] = useState<string | undefined>(undefined);
    const [info, setInfo] = useState<string | undefined>(undefined);

    useEffect(() => {
        createAccount();
    }, []);

    // アカウントを作成する関数
    const createAccount = async () => {

        const client = new Client("wss://testnet.xrpl-labs.com");
        await client.connect();

        // 新しいウォレットを作成
        const wallet = (await client.fundWallet()).wallet;

        // 残高を取得
        const balance = await client.getXrpBalance(wallet.address);

        // 表示するウォレットのデータを定義
        const newWallet = {
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            seed: wallet.seed!,
            balance: balance,
        };

        const info = await client.request({
            command: "account_info",
            account: wallet.address,
        });

        // XRP Ledger Test Net との接続を解除
        await client.disconnect();

        setWallet(newWallet);
        setInfo(JSON.stringify(info, null, 2))
    };

    // seedをを使い既存のウォレットを取得する関数
    const getWallet: ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();
        // 入力されたseedの文字列を使ってリクエストを送る
        const seed: string = event.currentTarget.seed.value;

        // XRP Ledger Test Net に接続
        const client = new Client("wss://testnet.xrpl-labs.com");
        await client.connect();

        // seedで自身のアカウントを取得
        const wallet = Wallet.fromSeed(seed);

        // 残高を取得
        const balance = await client.getXrpBalance(wallet.address);

        // 表示するウォレットのデータを定義
        const currentWallet = {
            address: wallet.address,
            seed: seed,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            balance,
        };
        setWallet(currentWallet);

        const info = await client.request({
            command: "account_info",
            account: wallet.address,
        });
        setInfo(JSON.stringify(info, null, 2))

        // XRP Ledger Test Net との接続を解除
        await client.disconnect();
    };
    // XRPを送金する関数
    const transfer: ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();

        // 送金金額を定義
        const amount = event.currentTarget.amount.value;

        // 送金先のアドレスを定義
        const destination = event.currentTarget.destination.value;

        // XRP Ledger Test Net に接続
        const client = new Client("wss://testnet.xrpl-labs.com");
        await client.connect();

        // seedで自身のアカウントを取得
        const mywallet = Wallet.fromSeed(wallet.seed);

        // トランザクションを準備
        const txForm: Transaction = await client.autofill({
            TransactionType: "Payment",
            Account: mywallet.address, // 送金するの自身のウォレットアドレス
            Amount: xrpToDrops(amount), // 送金金額
            Destination: destination, // 送信先のウォレットアドレス
        });

        // 準備されたトランザクションに署名。
        const signed = mywallet.sign(txForm);

        //トランザクションを送信し、結果を待ちます。
        const tx = await client.submitAndWait(signed.tx_blob);
        // console.log(tx)
        setRaw(JSON.stringify(tx, null, 2));

        // トランザクションによって生じた変更を取得
        let changeData;
        let stats;
        if (tx.result.meta !== undefined && typeof tx.result.meta !== "string") {
            changeData = JSON.stringify(getBalanceChanges(tx.result.meta), null, 2);
            stats = tx.result.meta.TransactionResult
        }
        console.log(changeData)
        setStats(stats!);

        // 送金後残高
        const balance = await client.getXrpBalance(mywallet.address);
        setWallet({ ...wallet, balance: balance });

        const info = await client.request({
            command: "account_info",
            account: wallet.address,
        });
        setInfo(JSON.stringify(info, null, 2))

        await client.disconnect();
    };

    const DIDSet: ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();

        const url = event.currentTarget.url.value;

        // XRP Ledger Test Net に接続
        const client = new Client("wss://testnet.xrpl-labs.com");
        await client.connect();

        const mywallet = Wallet.fromSeed(wallet.seed);

        // トランザクションを準備
        const txForm: Transaction = await client.autofill({
            TransactionType: "DIDSet",
            Account: mywallet.address, // 送金するの自身のウォレットアドレス
            URI: url,
        });

        // 準備されたトランザクションに署名。
        const signed = mywallet.sign(txForm);

        //トランザクションを送信し、結果を待ちます。
        const tx = await client.submitAndWait(signed.tx_blob);
        console.log(tx)
        setRaw(JSON.stringify(tx, null, 2));

        let stats;
        if (tx.result.meta !== undefined && typeof tx.result.meta !== "string") {
            stats = tx.result.meta.TransactionResult
        }
        setStats(stats!);

        // XRP Ledger Test Net との接続を解除
        await client.disconnect();
    };

    return (
        <>
            <div className="stats stats-vertical sm:stats-horizontal w-full">
                {/* // アカウントを作成 /// */}
                <div className="stat">
                    <label className="stat-title text-accent">
                        Create Wallet
                    </label>
                    <label className="stat-desc my-4">
                        Create a key pair for your account
                        <br />
                        and get a test net balance.
                    </label>
                    <button
                        onMouseDown={createAccount}
                        className="stat-actions btn btn-primary">
                        Create
                    </button>
                </div>

                {/* シードから作成 */}
                <div className="stat">
                    <label className="stat-title text-accent">
                        Seed to account
                    </label>
                    <label className="stat-desc my-4">
                        Get an existing account (r...)
                        <br />
                        by entering seed.(s...)
                    </label>
                    <form onSubmit={getWallet} className="form-control join join-vertical">
                        {/* <label htmlFor="seed">seed</label> */}
                        <input
                            type="text"
                            name="seed"
                            id="seed"
                            placeholder="s..."
                            className="input input-bordered w-full join-item"
                        />
                        <button className="stat-actions btn btn-primary join-item">get</button>
                    </form>
                </div>

            </div>

            {wallet.address && (<>
                <div className="stats w-full">
                    <div className="stat">
                        <label className="stat-title text-accent">
                            Account Info
                        </label>
                        <dl className="text-left text-sm truncate">
                            <dt className="font-medium">address:</dt>
                            <dd className="text-accent"> {wallet?.address}</dd>
                            <dt className="font-medium">seed:</dt>
                            <dd className="text-accent"> {wallet?.seed}</dd>
                            <dt className="font-medium">publicKey:</dt>
                            <dd className="text-accent"> {wallet?.publicKey}</dd>
                            <dt className="font-medium">privateKey:</dt>
                            <dd className="text-accent"> {wallet?.privateKey}</dd>
                            <dt className="font-medium">balance:</dt>
                            <dd className="text-accent"> {wallet?.balance}</dd>
                        </dl>
                        <details className="mt-4 collapse collapse-arrow border border-base-300 bg-base-100">
                            <summary className="collapse-title text-accent text-xl">
                                Info
                            </summary>
                            <div className="collapse-content text-left">
                                <pre className="text-success text-xs overflow-scroll">{info}</pre>
                            </div>
                        </details>
                    </div>
                </div>

                <div className="stats stats-vertical sm:stats-horizontal w-full">

                    <div className="stat">
                        <label className="stat-title text-accent">
                            Send XRP
                        </label>
                        <form onSubmit={transfer} className="mt-4 form-control join join-vertical">
                            <input
                                type="text"
                                name="destination"
                                id="destination"
                                placeholder="Destination (r...)"
                                className="input input-bordered w-full join-item"
                            />
                            <input
                                type="number"
                                name="amount"
                                placeholder="XRP Amount"
                                id="amount"
                                className="input input-bordered w-full join-item"
                            />
                            <button className="stat-actions btn btn-primary join-item">Send</button>
                        </form>
                        <details className="mt-4 collapse collapse-arrow border border-base-300 bg-base-100">
                            <summary className="collapse-title text-xl text-accent">
                                {stats}
                            </summary>
                            <div className="collapse-content text-left">
                                <pre className="text-success text-xs overflow-scroll">{raw}</pre>
                            </div>
                        </details>
                    </div>

                    <div className="stat">
                        <label className="stat-title text-accent">
                            DID Set
                        </label>
                        <form onSubmit={DIDSet} className="mt-4 form-control join join-vertical">
                            <div>
                                <input
                                    type="text"
                                    name="uri"
                                    id="uri"
                                    className="input input-bordered w-full join-item"
                                />
                            </div>
                            <button className="stat-actions btn btn-primary join-item">Set</button>
                        </form>
                        <details className="stat-desc mt-4 collapse collapse-arrow border border-base-300 bg-base-100">
                            <summary className="collapse-title text-xl text-accent">
                                {stats}
                            </summary>
                            <div className="collapse-content text-left">
                                <pre className="text-success text-xs overflow-scroll">{raw}</pre>
                            </div>
                        </details>
                    </div>

                </div>
            </>)}
        </>
    )
}
