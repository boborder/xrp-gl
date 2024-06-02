'use client'
import { useEffect, useState } from "react";
import { Client } from "xrpl";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { Donate } from "./Donate";

export const FetchData = () => {
    const { xumm, userInfo } = useUser();

    const [data, setData] = useState()
    const [fee, setFee] = useState("")
    const [priceY, setPriceY] = useState<{ XRP: number; }>();
    const [priceD, setPriceD] = useState<{ XRP: number; }>();
    const [balance, setBalance] = useState<number>()

    const ws = "wss://xrplcluster.com"
    const client = new Client(ws);

    useEffect(() => {
        fetchData();
        fetchPrice();
        const fetchDataInterval = setInterval(fetchData, 3333);
        const priceInterval = setInterval(fetchPrice, 60000);
        return () => {
            clearInterval(fetchDataInterval);
            clearInterval(priceInterval);
        };
    }, [userInfo.account]);

    const fetchData = async () => {
        if (!client.isConnected()) {
            await client.connect();
        }

        const fetchFee = async () => {
            try {
                const fee: any = await client.request({ command: "fee" });
                const ledger = fee.result.ledger_current_index;
                const openLedgerFee = fee.result.drops.open_ledger_fee;
                setData(ledger);
                setFee(openLedgerFee);
            } catch (error) {
                console.error("Error fetching fee:", error);
            }
        };

        const fetchBalance = async () => {
            if (userInfo.account) {
                try {
                    const balance = await client.getXrpBalance(userInfo.account);
                    setBalance(balance);
                } catch (error) {
                    console.error("Error fetching balance:", error);
                }
            }
        };

        await Promise.all([fetchFee(), fetchBalance()]);
    };

    const fetchPrice = async () => {
        if (userInfo.account) {
            const priceJPY: any = await xumm.helpers?.getRates('JPY');
            const priceUSD: any = await xumm.helpers?.getRates('USD');
            setPriceY(priceJPY);
            setPriceD(priceUSD);
        }
    };

    return (
        <>
            <div className="stats stats-vertical sm:stats-horizontal">

                <div className="stat">
                    <div className="stat-title">LedgerIndex</div>
                    <div className="stat-value">
                        <span className="countdown font-mono text-3xl">{data}</span>
                    </div>
                    <div className="stat-figure">
                        <Imag
                            src="/ipfs/xrpl.png"
                            width={78}
                            height={78}
                            alt="xrp"
                        />
                        fee: {fee}
                    </div>
                    <div className="stat-desc text-accent">{ws}</div>

                </div>

                {/* <Post /> */}
                <Donate />

            </div>
            {userInfo.account && (
                <div className="stats stats-vertical sm:stats-horizontal">
                    <div className="stat">
                        <div className="stat-title">XRP Price</div>
                        <div className="stat-value">
                            <span className="countdown font-mono text-3xl">JPY ¥{priceY?.XRP.toFixed(2)}</span>
                        </div>
                        <div className="stat-value">
                            <span className="countdown font-mono text-3xl">USD ${priceD?.XRP.toFixed(3)}</span>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-title">Balance</div>
                        <div className="stat-value font-mono text-3xl">{balance}</div>
                        <div className="stat-desc text-xl">XRP</div>
                        <div className="stat-desc text-xs font-bold text-accent">{userInfo.account}</div>
                    </div>
                </div>
            )}
        </>
    );
};
