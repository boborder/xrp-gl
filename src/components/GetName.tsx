"use client"
import { useState } from 'react';
import { Payment } from './Payment';
import { AccountInfoResponse, Client } from 'xrpl';
import { useUser } from './UserProvider';

export const GetName = () => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [account, setAccount] = useState('');
    const [message, setMessage] = useState('');
    const [clear, setClear] = useState<boolean | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (!isValidASCII(name)) {
            setMessage('Invalid PayString. Only ASCII characters are allowed.');
            setClear(false)
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

        // XRPアドレスのバリデーション
        if (account.length < 25 || account.length > 35) {
            setMessage('Invalid XRP address. length');
            setClear(false)
        }
        if (!account.startsWith("r")) {
            setMessage('Invalid XRP address. r');
            setClear(false)
        }

        const client = new Client(user?.networkEndpoint || "wss://xrplcluster.com");
        await client.connect();
        const info: AccountInfoResponse = await client.request({
            command: "account_info",
            account: account,
        });
        if (info) {
            const data = info.result
            console.log(data)
        } else {
            setMessage('Invalid XRP address. info');
            setClear(false)
        }
        await client.disconnect()

        if (clear === null) {
            // ユーザーのバリデーション
            const get = await fetch(`/api/get?account=${account}&name=${name}`, {
                method: "GET",
            });
            if (get.status === 200) {
                const getData = await get.json()
                console.log(getData.result)
                if (getData.result.done === true) {
                    setMessage('Name cannot be empty.');
                } else {
                    setClear(true)
                }
            }
        }

        if (clear === true && account === user?.account) {
            const put = await fetch(`/api/${account}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${process.env.TOKEN}`,
                },
                body: JSON.stringify({ paystring: (name + "$" + "xrp.gl") })
            })
            if (put.status === 200) {
                const data = await put.json()
                console.log(data.result)
                setMessage(JSON.stringify(put.status));
            }
        }
        console.log(clear)
    }
    return (
        <>
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
                {message && (<label className='label-text'>{message}</label>)}

            </div>
            {clear && (<Payment name={name} />)}
        </>
    )
}
