"use client"

import { useEffect, useState } from 'react';
import { convertHexToString } from 'xrpl';
import { useUser } from '@/components/UserProvider'
import { Imag } from './Imag';

interface NFT {
    Flags: number;
    Issuer: string;
    NFTokenID: string;
    NFTokenTaxon: number;
    TransferFee: number;
    URI: string;
    nft_serial: number;
}

interface AccountNFTResponse {
    account: string;
    account_nfts: NFT[];
    ledger_current_index: number;
    validated: boolean;
    _nodepref: string;
}
export const NFT = () => {
    const { userInfo } = useUser();

    const [info, setInfo] = useState<AccountNFTResponse | undefined>(undefined);
    const [fetchedData, setFetchedData] = useState<any>(null);

    // XRPLからNFT情報を取得
    useEffect(() => {
        setup();
    }, [userInfo.account]);

    useEffect(() => {
        fetchAllConvertedURIs();
    }, [info]);

    const setup = async () => {
        if (userInfo.account) {
            const json = { method: "account_nfts", params: [{ account: userInfo.account }] };

            const response = await fetch("https://xrplcluster.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(json),
            });

            const info = await response.json();
            setInfo(info.result as AccountNFTResponse);
            // setInfo(response.result as AccountNFTResponse);
        };
    }

    // IPFSのURIをHTTPSに変換
    const convertIpfsToHttps = (uri: string) => {
        return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    };

    // 各NFTのメタデータを取得
    const fetchDataFromConvertedURI = async (convertedURI: string) => {
        const response = await fetch(convertedURI);
        if (response.ok) {
            return await response.json();
        } else {
            return null;
        }
    };

    // 全てのNFTのメタデータを取得
    const fetchAllConvertedURIs = async () => {
        if (info?.account_nfts) {
            const allFetchedData = await Promise.all(
                info.account_nfts.map(async (nft) => {
                    const convertedURI = convertIpfsToHttps(convertHexToString(nft.URI));
                    return await fetchDataFromConvertedURI(convertedURI);
                })
            );
            setFetchedData(allFetchedData as any);
        }
    };

    return (
        <>
            {fetchedData && fetchedData.map((data: any, index: any) => (
                <div className="stat" key={index}>
                    <label className='mb-2 text-accent stat-title'>NFToken</label>
                    {data?.image &&
                        <Imag
                            src={convertIpfsToHttps(data.image)}
                            alt={`NFT ${index}`}
                            width={150}
                            height={150}
                            className='mx-auto w-auto'
                        />}
                    <details className="mt-2 collapse collapse-arrow border border-base-300 bg-base-100">
                        <summary className="collapse-title text-accent stat-title">
                            Metadata
                        </summary>
                        <div className="collapse-content text-left stat-desc">
                            <div>
                                <pre className='text-success text-xs overflow-scroll'>
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </details>
                </div>
            ))}
        </>
    );
}
