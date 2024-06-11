"use client"
import { useState } from 'react';
import { Payment } from './Payment';
import { hash } from '@/lib/hash';
import { Wallet } from 'xrpl';
import { useUser } from './UserProvider';

export const GetName = () => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [account, setAccount] = useState('');
    const [message, setMessage] = useState('');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (!isValidASCII(name)) {
            setMessage('Invalid PayString. Only ASCII characters are allowed.');
        }
    };
    const isValidASCII = (str: string) => {
        return /^[\x00-\x7F]*$/.test(str);
    }

    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccount(e.target.value);
    };

    const validateInputs = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (account.length < 25 || account.length > 35) setMessage('Invalid XRP address.');
        if (!account.startsWith("r")) setMessage('Invalid XRP address.');
        // XRPアドレスのバリデーション
        const info = await fetch("/api/info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([{ account: account }])
        })
        if (info.status !== 200) setMessage('Invalid XRP address.');

        // ユーザーのバリデーション
        const get = await fetch(`/api/get?account=${account}&name=${name}`, {
            method: "GET",
        });

        if (get === undefined) setMessage('Name cannot be empty.');

        const insert = await fetch(`/api/${account || (Wallet.generate().address)}?name=${name || await hash(crypto.randomUUID())}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.TOKEN}`,
            }
        })
        setMessage(JSON.stringify(insert.status));
    };

    return (
        <div className="stat">
            <label className="text-accent text-xl">
                Get Name
            </label>
            <form onSubmit={validateInputs} className="my-3 join join-vertical">
                <input
                    type="text"
                    className="input input-bordered join-item"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="name"
                />
                <input
                    type="text"
                    className="input input-bordered join-item"
                    value={account}
                    onChange={handleAccountChange}
                    placeholder="address(r...)"
                />
                <button className="text-gl btn btn-primary join-item">GetName</button>
            </form>
            <label className='label-text'>{message}</label>
            {message === "200" && (
                <Payment />
            )}
        </div>
    )
}
