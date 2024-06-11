"use client"

import { checkDomain, checkToml } from "@/actions/domain";
import { useState } from "react";
import { convertHexToString } from "xrpl";
interface TomlResponse {
    account: Array<{
        address: string;
        desc: string;
    }>;
}

export const Domain = () => {
    const [toml, setToml] = useState<TomlResponse | undefined>(undefined);
    const [domain, setDomain] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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

            const data: any = await response.json();
            setToml(data);
            if (!toml) { setMessage("NotFound File /.well-known/xrp-ledger.toml") }
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

            const data: any = await response.json();

            const domain = convertHexToString(data.account_data.Domain);
            setDomain(domain);
            if (!domain) { setMessage("NotFound Domain") }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stat">
            <label className="text-accent text-xl">
                Check Domain
            </label>
            <form
                onSubmit={checkToml}
                // action={async (formData) => {
                //     setLoading(true)
                //     const toml = await checkToml(formData)
                //     setToml(toml)
                //     if (!toml) {setMessage("NotFound File /.well-known/xrp-ledger.toml")}
                //     setLoading(false)
                // }}
                className="my-3 join join-vertical">
                <input
                    type="text"
                    name="domain"
                    id="domain"
                    placeholder="example.com"
                    className="input input-bordered w-full join-item"
                />
                <button className="text-xl btn btn-primary join-item">toml ?</button>
            </form>
            <form
                onSubmit={checkDomain}
                // action={async (formData) => {
                //     setLoading(true)
                //     const data = await checkDomain(formData)
                //     const domain = convertHexToString(data)
                //     setDomain(domain)
                //     if (!toml) {setMessage("NotFound Domain")}
                //     setLoading(false)
                // }}
                className="my-3 join join-vertical">
                <input
                    type="text"
                    name="address"
                    id="address"
                    placeholder="address(r...)"
                    className="input input-bordered w-full join-item"
                />
                <button className="text-xl btn btn-primary join-item">Domain ?</button>
            </form>
            {loading && (
                <div className="stat-value">
                    <span className="loading loading-infinity loading-lg"></span>
                    <span className="loading loading-infinity loading-lg"></span>
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            )}

            {domain && (<>
                <span>domain: </span>
                <p className="text-success">{domain} </p>
            </>)}

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
                <div className="text-xs">{message}</div>
            )}

        </div>
    );
}
