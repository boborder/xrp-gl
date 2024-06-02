"use client"

import { useState } from "react";
import { convertHexToString } from "xrpl";

interface TomlResponse {
    account: Array<{
        address: string;
        desc: string;
    }>;
}

export const Domain = () => {
    const [toml, settToml] = useState<TomlResponse | null>(null);
    const [domain, setDomain] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const checkToml = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        try {
            const formData = new FormData(event.currentTarget);
            const domain = formData.get("domain");

            const response = await fetch("/api/toml", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ domain: domain }),
            });

            const data = await response.json();
            settToml(data);

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    const checkDomain = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const address = formData.get("address");

        try {
            const response = await fetch("/api/info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ account: address })
            });

            const data = await response.json();

            const domain = convertHexToString(data.account_data.Domain);
            setDomain(domain);

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stat">
            <label className="stat-title text-accent">
                Check Domain
            </label>
            <form onSubmit={checkToml} className="my-3 join join-vertical">
                <input
                    type="text"
                    name="domain"
                    id="domain"
                    placeholder="example.com"
                    className="input input-bordered w-full join-item"
                />
                <button className="stat-actions btn btn-primary join-item">Check toml ?</button>
            </form>
            <form onSubmit={checkDomain} className="my-3 join join-vertical">
                <input
                    type="text"
                    name="address"
                    id="address"
                    placeholder="r..."
                    className="input input-bordered w-full join-item"
                />
                <button className="btn btn-primary join-item">Domain ?</button>
            </form>

            {toml?.account && Array.isArray(toml.account) ? (
                <div className="text-left">
                    {toml?.account.map((account, index) => (
                        <dl key={index}>
                            <dt>address:</dt>
                            <dd className="text-success">{account.address}</dd>
                            <dt>desc:</dt>
                            <dd className="text-success">{account.desc}</dd>
                        </dl>
                    ))}
                </div>
            ) : (
                <div className="text-xs">NotFound File<br />xrp-ledger.toml</div>
            )}

            {domain && (<>
                <span>domain: </span>
                <p className="text-success">{domain} </p>
            </>)}

            {loading && (
                <div className="stat-value">
                    <span className="loading loading-infinity loading-lg"></span>
                    <span className="loading loading-infinity loading-lg"></span>
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            )}
        </div>
    );
}
