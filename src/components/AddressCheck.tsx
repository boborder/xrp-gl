"use client"
import { useState } from 'react';

export const AddressCheck = () => {
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        if (!isValidASCII(username)) {
            setMessage('Invalid PayString. Only ASCII characters are allowed.');
        }
    };
    const isValidASCII = (str: string) => {
        return /^[\x00-\x7F]*$/.test(str);
    }

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(e.target.value);
    };

    const validateInputs = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const user = await fetch(`/api/get?name=${username}`, {
            method: "GET",
        });

        if (user) {
            setMessage('Username cannot be empty.');
        }
        // XRPアドレスのバリデーション
        const info = await fetch("/api/info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ account: address })
        })
        if (info) {
            setMessage('Invalid XRP address.');
        }

        if (user && info) {
            setMessage('Both username and XRP address are valid.');
        }
    };

    return (
        <div className="stat">
            <label className="stat-title text-accent">
                Get Name
            </label>
            <form onSubmit={validateInputs} className="my-3 join join-vertical">
                {/* <label className='stat-title'>User Name: </label> */}
                <input
                    type="text"
                    className="input input-bordered w-full join-item"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="name"
                />
                <button className="btn btn-primary join-item">Name</button>
            </form>
            <form onSubmit={validateInputs}  className="my-3 join join-vertical">
                {/* <label className='stat-title'>XRP Address: </label> */}
                <input
                    type="text"
                    className="input input-bordered w-full join-item"
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="r..."
                />
                <button className="btn btn-primary join-item">Address</button>
            </form>
            <label className='stat-desc'>{message}</label>
        </div>
    )
}
