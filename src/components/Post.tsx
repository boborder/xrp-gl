'use client'

import { Wallet } from 'xrpl';
import { hash } from '@/lib/hash';
import { useUser } from './UserProvider';

export const Post = () => {
    const { user, store } = useUser();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData?.get("name") || await hash(crypto.randomUUID());
        const account = formData?.get("account") || (Wallet.generate().classicAddress);

        const age = store?.age
        const avatar = store?.avatar
        const bio = store?.bio
        const currency = store?.currency
        const country = store?.country
        const did = store?.did
        const email = store?.email
        const gender = store?.gender
        const job = store?.job
        const lang = store?.lang
        const locate = store?.locate
        const paystring = store?.paystring
        const url = store?.url
        const tel = store?.tel
        const sns = store?.sns
        // const name = store?.name
        // const account = user.account

        const data = await fetch(`/api/${account}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                age,
                avatar,
                bio,
                currency,
                country,
                did,
                email,
                gender,
                job,
                lang,
                locate,
                paystring,
                url,
                tel,
                sns,
            }),
        });
        if (data) {
            const res = await data.json()
            console.log(res.result);
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
