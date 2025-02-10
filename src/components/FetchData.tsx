'use client'
import { Client, type FeeResponse } from "xrpl";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { Donate } from "./Donate";
import useSWR from 'swr';

const useXRPData = (user: any, xumm: any) => {
    const ws = user?.networkEndpoint || "wss://xrplcluster.com";
    const client = new Client(ws);

    const fee = () => async () => {
        if (!client.isConnected()) await client.connect();
        return await client.request({ command: "fee" }) as FeeResponse;
    };

    const fetchBalance = async () => {
        if (!client.isConnected()) await client.connect();
        return await client.getXrpBalance(user?.account);
    };

    const fetchRates = (currency: string) => async () => {
        return await xumm.helpers?.getRates(currency);
    };

    const { data: feeData } = useSWR(client ? 'fee' : null, fee(), { refreshInterval: 3333 });
    const { data: balanceData } = useSWR(user?.account ? `balance/${user.account}` : null, fetchBalance, { refreshInterval: 60000 });
    const { data: priceJPY } = useSWR(xumm ? 'price/JPY' : null, fetchRates('JPY'), { refreshInterval: 60000 });
    const { data: priceUSD } = useSWR(xumm ? 'price/USD' : null, fetchRates('USD'), { refreshInterval: 60000 });

    return { feeData, balanceData, priceJPY, priceUSD, ws };
};

export const FetchData = () => {
    const { xumm, user } = useUser();
    const { feeData, balanceData, priceJPY, priceUSD, ws } = useXRPData(user, xumm);

    return (
        <>
            <div className="stats stats-vertical sm:stats-horizontal">
                <div className="stat">
                    <div className="stat-title">LedgerIndex</div>
                    <div className="stat-value">
                        <span className="countdown font-mono text-3xl">{feeData?.result.ledger_current_index}</span>
                    </div>
                    <div className="stat-figure">
                        <Imag src="/ipfs/xrpl.png" width={78} height={78} alt="xrp" />
                        fee: {feeData?.result.drops.open_ledger_fee}
                    </div>
                    <div className="stat-desc text-accent">{ws}</div>
                </div>
                <Donate />
            </div>
            {user?.account && (
                <div className="stats stats-vertical sm:stats-horizontal">
                    <div className="stat">
                        <div className="stat-title">XRP Price</div>
                        <div className="stat-value">
                            <span className="countdown font-mono text-3xl">JPY ¥{priceJPY?.XRP.toFixed(2)}</span>
                        </div>
                        <div className="stat-value">
                            <span className="countdown font-mono text-3xl">USD ${priceUSD?.XRP.toFixed(3)}</span>
                        </div>
                    </div>
                        <div className="stat">
                            <div className="stat-title">Balance</div>
                            <div className="stat-value font-mono text-3xl">{balanceData}</div>
                            <div className="stat-desc text-xl">XRP</div>
                            <div className="stat-desc text-xs font-bold text-accent">{user?.account}</div>
                        </div>
                </div>
            )}
        </>
    );
};
