"use client"

import { useEffect, useState } from 'react';
import {
    Client,
    Wallet,
    xrpToDrops,
    TxResponse,
    PaymentChannelCreate,
    PaymentChannelFund,
    PaymentChannelClaim,
    signPaymentChannelClaim,
    verifyPaymentChannelClaim,
    AccountChannelsResponse
} from 'xrpl';

export const Test2 = () => {
    const [aliceWallet, setAliceWallet] = useState<Wallet | null>(null);
    const [aliceBalance, setAliceBalance] = useState<number>(0);
    const [aliceAmount, setAliceAmount] = useState<string>('22');

    const [bobWallet, setBobWallet] = useState<Wallet | null>(null);
    const [bobBalance, setBobBalance] = useState<number>(0);
    const [bobAmount, setBobAmount] = useState<string>('22');

    const [status, setStatus] = useState<string>('Wallet funding...');
    const [info, setInfo] = useState<any | null>(null);
    const [client] = useState(new Client('wss://testnet.xrpl-labs.com'));
    const [channelId, setChannelId] = useState<string | null>(null);
    const signet = Wallet.fromSeed(process.env.SEED!)

    useEffect(() => {
        setup();
    }, [client]);

    const setup = async () => {
        if (!client.isConnected()) await client.connect();
        if (!aliceWallet && !bobWallet) {
            const alice = await client.fundWallet();
            setAliceWallet(alice.wallet);
            setAliceBalance(alice.balance);
            const bob = await client.fundWallet();
            setBobWallet(bob.wallet);
            setBobBalance(bob.balance);
            setStatus('Wallets funded.');
        }
        await client.disconnect()
    };

    const createPaymentChannel = async (fromWallet: Wallet, toWallet: Wallet, amount: string) => {
        if (!client.isConnected()) await client.connect();
        setStatus(`Creating payment channel from ${fromWallet?.address} to ${toWallet?.address}`);
        const tx: PaymentChannelCreate = {
            TransactionType: 'PaymentChannelCreate',
            Account: fromWallet?.address!,
            Amount: xrpToDrops(amount),
            Destination: toWallet?.address!,
            SettleDelay: 86400, // 1 day
            PublicKey: signet?.publicKey!,
        };
        const submit: TxResponse = await client.submitAndWait(tx, {
            autofill: true,
            wallet: fromWallet,
        });
        if (submit.status === 'success') {
            setStatus(`Payment channel created successfully`);
            const response: AccountChannelsResponse = await client.request({
                command: 'account_channels',
                account: fromWallet.classicAddress,
            });
            if (response) {
                const channels = response.result.channels;
                console.log(channels)
                const channel_id = channels[0].channel_id;
                console.log("Channel_id: " + channel_id);
                setChannelId(channel_id);

                const newAliceBalance = await client.getXrpBalance(aliceWallet?.address!);
                const newBobBalance = await client.getXrpBalance(bobWallet?.address!);
                setAliceBalance(newAliceBalance);
                setBobBalance(newBobBalance);
                setInfo(submit.result);
            } else {
                setStatus('Payment channel creation failed.');
            }
        };
        await client.disconnect()
    }

    const fundPaymentChannel = async (fromWallet: Wallet, channelId: string, amount: string) => {
        if (!client.isConnected()) await client.connect();
        setStatus(`Funding payment channel ${channelId}`);
        const tx: PaymentChannelFund = {
            TransactionType: 'PaymentChannelFund',
            Account: fromWallet?.address!,
            Channel: channelId,
            Amount: xrpToDrops(amount),
        };
        const submit: TxResponse = await client.submitAndWait(tx, {
            autofill: true,
            wallet: fromWallet,
        });
        if (submit?.status === 'success') {
            setStatus(`Payment channel funded successfully`);
            const newAliceBalance = await client.getXrpBalance(aliceWallet?.address!);
            const newBobBalance = await client.getXrpBalance(bobWallet?.address!);
            setAliceBalance(newAliceBalance);
            setBobBalance(newBobBalance);
            setInfo(submit.result);
        } else {
            setStatus('Payment channel funding failed.');
        }
        await client.disconnect()
    };

    const signClaim = async (channelId: string, amount: string) => {
        const drops = xrpToDrops(amount);
        const signature = signPaymentChannelClaim(channelId, drops, signet.privateKey);
        return { amount: drops, signature };
    };

    const verifyClaim = async (channelId: string, amount: string, signature: string) => {
        const isValid = verifyPaymentChannelClaim(channelId, amount, signature, signet.publicKey);
        return isValid;
    };

    const claimPaymentChannel = async (fromWallet: Wallet, channelId: string, amount: string, signature: string) => {
        if (!client.isConnected()) await client.connect();
        setStatus(`Claiming payment from channel ${channelId}`);
        const tx: PaymentChannelClaim = {
            TransactionType: 'PaymentChannelClaim',
            Account: fromWallet?.address!,
            Channel: channelId,
            Amount: amount,
            Balance: amount,
            Signature: signature,
        };
        const submit: TxResponse = await client.submitAndWait(tx, {
            autofill: true,
            wallet: fromWallet,
        });
        if (submit.status === 'success') {
            setStatus(`Payment claimed successfully`);
            const newAliceBalance = await client.getXrpBalance(aliceWallet?.address!);
            const newBobBalance = await client.getXrpBalance(bobWallet?.address!);
            setAliceBalance(newAliceBalance);
            setBobBalance(newBobBalance);
            setInfo(submit.result);
        } else {
            setStatus('Payment claim failed.');
        }
        await client.disconnect()
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
                            {/* <br />
                            Seed: {aliceWallet?.seed} */}
                            <br />
                            Balance: {aliceBalance} XRP
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            createPaymentChannel(aliceWallet, bobWallet!, aliceAmount);
                        }} className="mx-auto join join-horizontal">
                            <input
                                className="input input-bordered join-item"
                                value={aliceAmount}
                                onChange={(e) => setAliceAmount(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary join-item">Create Channel</button>
                        </form>
                    </div>
                }
                {bobWallet &&
                    <div className='stat'>
                        <label>Bob</label>
                        <div className="my-4 truncate text-accent">
                            Address: {bobWallet?.address}
                            {/* <br />
                            Seed: {bobWallet?.seed} */}
                            <br />
                            Balance: {bobBalance} XRP
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const { amount, signature } = await signClaim(channelId!, bobAmount);
                            const isValid = await verifyClaim(channelId!, amount, signature);
                            if (isValid) {
                                await claimPaymentChannel(bobWallet, channelId!, amount, signature);
                            } else {
                                setStatus('Invalid claim signature.');
                            }
                        }} className="mx-auto join join-horizontal">
                            <input
                                className="input input-bordered join-item"
                                value={bobAmount}
                                onChange={(e) => setBobAmount(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary join-item">Claim Payment</button>
                        </form>
                    </div>
                }
            </div>
        </>
    );
}
