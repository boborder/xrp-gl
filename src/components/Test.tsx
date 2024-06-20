"use client"

import { ComponentProps, useState, useEffect } from "react";
import { Wallet, Client, xrpToDrops, getBalanceChanges, Transaction, convertStringToHex, AccountInfoResponse, TxResponse } from 'xrpl';

export const Test = () => {
    // ウォレットのデータを入れるstateを作成
    const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
    const [stats, setStats] = useState<string | undefined>("TxData");
    const [raw, setRaw] = useState<TxResponse | undefined>(undefined);
    const [info, setInfo] = useState<AccountInfoResponse | undefined>(undefined);

    const ws = "wss://s.devnet.rippletest.net:51233"
    // const ws = "wss://testnet.xrpl-labs.com"

    useEffect(() => {
        createAccount();
    }, []);

    // アカウントを作成する関数
    const createAccount = async () => {
        if (wallet === undefined) {
            const client = new Client(ws);
            await client.connect();
            // 新しいウォレットを作成
            const newWallet = (await client.fundWallet()).wallet;
            setWallet(wallet);

            const info: AccountInfoResponse = await client.request({
                command: "account_info",
                account: newWallet.address,
            });
            setInfo(info)

            // XRP Ledger Test Net との接続を解除
            await client.disconnect();
        }
    };

    // seedをを使い既存のウォレットを取得する関数
    const getWallet: ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();
        // 入力されたseedの文字列を使ってリクエストを送る
        const seed: string = event.currentTarget.seed.value;

        const client = new Client(ws);
        await client.connect();

        // seedで自身のアカウントを取得
        const myWallet = Wallet.fromSeed(seed);
        setWallet(myWallet);

        const info: AccountInfoResponse = await client.request({
            command: "account_info",
            account: myWallet.address,
        });
        setInfo(info)

        // XRP Ledger Test Net との接続を解除
        await client.disconnect();
    };


    const transfer: ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();
        // 送金金額
        const amount = event.currentTarget.amount.value;
        // 送金先
        const destination = event.currentTarget.destination.value;

        const client = new Client(ws);
        await client.connect();

        // トランザクションを準備
        const txForm: Transaction = await client.autofill({
            TransactionType: "Payment",
            Account: wallet!.address,
            Amount: xrpToDrops(amount),
            Destination: destination,
        });

        // 準備されたトランザクションに署名。
        const signed = wallet!.sign(txForm);

        //トランザクションを送信し、結果を待ちます。
        const tx: TxResponse = await client.submitAndWait(signed.tx_blob);
        // console.log(tx)
        setRaw(tx);

        let changeData;
        let stats;
        if (tx.result.meta !== undefined && typeof tx.result.meta !== "string") {
            changeData = JSON.stringify(getBalanceChanges(tx.result.meta), null, 2);
            stats = tx.result.meta.TransactionResult
        }
        console.log(changeData)
        setStats(stats!);

        const info: AccountInfoResponse = await client.request({
            command: "account_info",
            account: wallet!.address,
        });
        setInfo(info)

        await client.disconnect();
    };

    const DIDSet: ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();

        const dataHex = convertStringToHex(event.currentTarget.data.value)

        const client = new Client(ws);
        await client.connect();

        const id = `did:xrpl:0:${wallet!.address}`
        const document = {
            "@context": "https://www.w3.org/ns/did/v1",
            "id": id,
            "publicKey": [{
                "id": id,
                "type": "Secp256k1VerificationKey2018",
                "controller": id,
                "publicKeyHex": convertStringToHex(id)
            }],
            "assertionMethod": [id],
            "authentication": [id]
        }

        try {
            const text = JSON.stringify(document);
            const blob = new Blob([text], { type: "application/json" });
            const data = new FormData();
            data.append("file", blob, "document.json");

            const res = await fetch("/api/pinata", {
                method: "POST",
                body: data,
            });

            const cid = await res.json();
            const uri = convertStringToHex("ipfs:" + cid)

            // トランザクションを準備
            const txForm: Transaction = await client.autofill({
                TransactionType: "DIDSet",
                Account: wallet!.address, // 送金するの自身のウォレットアドレス
                URI: convertStringToHex(uri),
                Data: dataHex
            });

            // 準備されたトランザクションに署名。
            const signed = wallet!.sign(txForm);

            //トランザクションを送信し、結果を待ちます。
            const tx: TxResponse = await client.submitAndWait(signed.tx_blob);
            console.log(tx)
            setRaw(tx);

            let stats;
            if (tx.result.meta !== undefined && typeof tx.result.meta !== "string") {
                stats = tx.result.meta.TransactionResult
            }
            setStats(stats!);

            const info: AccountInfoResponse = await client.request({
                command: "account_info",
                account: wallet!.address,
            });
            setInfo(info)

            await client.disconnect();
        } catch (e) {
            console.log(e);
            alert("Trouble uploading document");
        }
    };

    const setRegularKey = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const setkey = event.currentTarget.key.value;
        const client = new Client(ws);
        await client.connect();

        // トランザクションを準備
        const txForm: Transaction = await client.autofill({
            TransactionType: 'SetRegularKey',
            Account: wallet!.classicAddress,
            RegularKey: setkey || "r44444Q525rRY3hiwgwjP9zN1R8Z8QQ7oc",
        });

        // 準備されたトランザクションに署名。
        const signed = wallet!.sign(txForm);

        //トランザクションを送信し、結果を待ちます。
        const tx: TxResponse = await client.submitAndWait(signed.tx_blob);
        console.log(tx)
        setRaw(tx);

        let stats;
        if (tx.result.meta !== undefined && typeof tx.result.meta !== "string") {
            stats = tx.result.meta.TransactionResult
        }
        setStats(stats!);

        const regWallet = Wallet.fromSeed("sEdVc2eVRWWzCSpe8UuxJHuuQa1yQDP")

        const sign: Transaction = await client.autofill({
            TransactionType: 'Payment',
            Account: wallet!.address,
            Amount: "12345678",
            Destination: "r44444Q525rRY3hiwgwjP9zN1R8Z8QQ7oc"
        });
        // 準備されたトランザクションに署名。
        const signedd = regWallet.sign(sign);

        //トランザクションを送信し、結果を待ちます。
        const submit: TxResponse = await client.submitAndWait(signedd.tx_blob, { wallet: regWallet });
        console.log(submit)
        setRaw(submit);

        if (submit.result.meta !== undefined && typeof submit.result.meta !== "string") {
            stats = submit.result.meta.TransactionResult
        }
        setStats(stats!);

        const info: AccountInfoResponse = await client.request({
            command: "account_info",
            account: wallet!.address,
        });
        setInfo(info)

        await client.disconnect();
    }
    return (
        <>
            <div className="stats stats-vertical sm:stats-horizontal w-full">
                {/* // アカウントを作成 /// */}
                {/* <div className="stat">
                    <label className="text-2xl text-accent">
                        Create Wallet
                    </label>
                    <label className="my-4">
                        Create a key pair for your account
                        <br />
                        and get a test net balance.
                    </label>
                    <button
                        onMouseDown={createAccount}
                        className="text-xl btn btn-primary">
                        Create
                    </button>
                </div> */}

                {/* シードから作成 */}
                <div className="stat">
                    <label className="text-2xl text-accent">
                        Account from seed
                    </label>
                    <label className="my-4">
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
                        <button className="text-xl btn btn-primary join-item">get</button>
                    </form>
                </div>

            </div>

            {wallet && (<>
                <div className="stats w-full">
                    <div className="stat">
                        <label className="text-2xl text-accent">
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
                            <dd className="text-accent"> {info?.result.account_data.Balance}</dd>
                        </dl>
                        {info && (
                            <details className="mt-4 collapse collapse-arrow border border-base-300 bg-base-100">
                                <summary className="collapse-title text-accent text-xl">
                                    Info
                                </summary>
                                <div className="collapse-content text-left">
                                    <pre className="text-success text-xs overflow-scroll">{JSON.stringify(info?.result, null, 2)}</pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>

                <div className="stats stats-vertical sm:stats-horizontal w-full">

                    <div className="stat">
                        <label className="text-2xl text-accent">
                            Send XRP
                        </label>
                        <form onSubmit={transfer} className="mt-4 join join-vertical">
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
                            <button className="text-xl btn btn-primary join-item">Send</button>
                        </form>
                    </div>

                    <div className="stat">
                        <label className="text-2xl text-accent">
                            DID Set
                        </label>
                        <form onSubmit={DIDSet} className="mt-4 join join-vertical">
                            <div>
                                <input
                                    type="text"
                                    name="data"
                                    id="data"
                                    placeholder="data"
                                    className="input input-bordered w-full join-item"
                                />
                            </div>
                            <button className="text-xl btn btn-primary join-item">Set</button>
                        </form>

                        {raw && (
                            <details className="mt-4 collapse collapse-arrow border border-base-300 bg-base-100">
                                <summary className="collapse-title text-xl text-accent">
                                    {stats}
                                </summary>
                                <div className="collapse-content text-left">
                                    <pre className="text-success text-xs overflow-scroll">{JSON.stringify(raw, null, 2)}</pre>
                                </div>
                            </details>
                        )}

                    </div>

                    <div className="stat">
                        <label className="text-accent text-xl">
                            RegularKey Set
                        </label>
                        <form onSubmit={setRegularKey} className="my-3 join join-vertical">
                            <input
                                type="text"
                                name="key"
                                id="key"
                                placeholder="address(r...)"
                                className="input input-bordered w-full join-item"
                            />
                            <button className="text-xl btn btn-primary join-item">setRegularKey</button>
                        </form>
                    </div>
                    
                </div>
            </>)}
        </>
    )
}
