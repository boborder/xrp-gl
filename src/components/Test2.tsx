"use client"

import { useEffect, useState } from 'react';
import { Client, Wallet, xrpToDrops, Transaction } from 'xrpl';

export function Test2() {
    const [aliceWallet, setAliceWallet] = useState<Wallet | null>(null);
    const [aliceBalance, setAliceBalance] = useState<number>(0);
    const [aliceAmount, setAliceAmount] = useState<string>('22');

    const [bobWallet, setBobWallet] = useState<Wallet | null>(null);
    const [bobBalance, setBobBalance] = useState<number>(0);
    const [bobAmount, setBobAmount] = useState<string>('42');

    const [status, setStatus] = useState<string>('Wallet funding...');
    const [info, setInfo] = useState();
    const [client] = useState(new Client('wss://testnet.xrpl-labs.com'));

    useEffect(() => {
        setup();
    }, [client]);

    const setup = async () => {
        await client.connect();
        const alice = await client.fundWallet();
        const bob = await client.fundWallet();
        setAliceWallet(alice.wallet);
        setAliceBalance(alice.balance);
        setBobWallet(bob.wallet);
        setBobBalance(bob.balance);
        setStatus('Wallets funded.');
    };

    const sendPayment = async (fromWallet: Wallet, toWallet: Wallet, amount: string) => {
        setStatus(`Sending ${amount} XRP from ${fromWallet?.address} to ${toWallet?.address}`);
        const tx: Transaction = {
            TransactionType: 'Payment',
            Account: fromWallet?.address || '',
            Amount: xrpToDrops(amount),
            Destination: toWallet?.address || '',
        };
        const result: any = await client.submitAndWait(tx, {
            autofill: true,
            wallet: fromWallet,
        });
        if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
            setStatus(`Successfully sent ${amount} XRP`);
            const newAliceBalance = await client.getXrpBalance(aliceWallet?.address || '');
            const newBobBalance = await client.getXrpBalance(bobWallet?.address || '');
            setAliceBalance(newAliceBalance);
            setBobBalance(newBobBalance);
            // アカウントの現在の情報を取得
            const account_info: any = await client.request({
                command: "account_info",
                account: fromWallet?.address
            })
            setInfo(account_info.result.account_data.PreviousTxnID);
            // await client.disconnect();
        } else {
            setStatus('Transaction failed.');
        }
    };
    return (
        <>
            <div className="stat text-center">
                <label className='text-4xl text-accent mb-4'>
                    TEST
                </label>
                {status}
                {info && (
                    <pre className="m-2 truncate text-accent">
                        TxnID: {JSON.stringify(info, null, 2)}
                    </pre>
                )}
            </div>

            <div className="stats stats-vertical md:stats-horizontal">
                {aliceWallet &&
                    <div className='stat'>
                        <label>Alice</label>
                        <div className="my-4 truncate text-accent">
                            Address: {aliceWallet?.address}
                            <br />
                            Seed: {aliceWallet?.seed}
                            <br />
                            Balance: {aliceBalance} XRP
                        </div>
                        <form className="mx-auto join join-horizontal">
                            <input
                                className="input input-bordered join-item"
                                value={aliceAmount}
                                onChange={(e) => setAliceAmount(e.target.value)}
                            />
                            <button className="btn btn-primary join-item" onClick={() => sendPayment(aliceWallet!, bobWallet!, aliceAmount)}>Send</button>
                        </form>
                    </div>
                }
                {bobWallet &&
                    <div className='stat'>
                        <label>Bob</label>
                        <div className="my-4 truncate text-accent">
                            Address: {bobWallet?.address}
                            <br />
                            Seed: {bobWallet?.seed}
                            <br />
                            Balance: {bobBalance} XRP
                        </div>
                        <form className="mx-auto join join-horizontal">
                            <input
                                className="input input-bordered join-item"
                                value={bobAmount}
                                onChange={(e) => setBobAmount(e.target.value)}
                            />
                            <button className="btn btn-primary join-item" onClick={() => sendPayment(bobWallet!, aliceWallet!, bobAmount)}>Send</button>
                        </form>
                    </div>
                }
            </div>
        </>
    );
}
