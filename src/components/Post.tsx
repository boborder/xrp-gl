import React, { useState } from 'react';

export const Post = () => {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const response = await fetch("/api/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, value }),
        });

        const data = await response.json();
        console.log(data);
    };

    return (
        <div className='stat'>
            <div className="stat-title text-accent">POST</div>
            <form className="join join-vertical my-3" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='name'
                    className='input input-bordered w-full join-item'
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder='value'
                    className='input input-bordered w-full join-item'
                />
                <button className="btn btn-primary join-item">Post</button>
            </form>
        </div>
    );
}
