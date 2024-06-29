'use client'

import { Wallet } from 'xrpl';
import { hash } from '@/lib/hash';
import { useUser } from './UserProvider';

export const Post = () => {
    const { store } = useUser();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData?.get("name") || await hash(crypto.randomUUID());
        const account = formData?.get("account") || (Wallet.generate().classicAddress);

        const res = await fetch(`/api/${account}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({...store, account: account, name: name })
        });
        if (res) {
            const data = await res.json()
            console.log(data.result);
        }
    };

    return (
        <div className='stat text-accent'>
            <div className="text-xl">POST</div>
            <form className="join join-vertical my-3" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder='name'
                    className='input input-bordered w-full join-item'
                />
                <input
                    type="text"
                    name="account"
                    placeholder='account'
                    className='input input-bordered w-full join-item'
                />
                <button className="btn btn-primary join-item text-xl">Post</button>
            </form>
        </div>
    );
}
