"use client"

import { useEffect, useRef, useState } from 'react';
import { AccountNFTsResponse, AccountTxResponse, Client, convertHexToString, convertStringToHex } from 'xrpl';
import { useUser } from '@/components/UserProvider'
import { Imag } from './Imag';
import { createPayload } from "@/lib/payload";

export const NFT = () => {
    const { xumm, user } = useUser();
    const [qr, setQr] = useState<string | undefined>(undefined);
    const [tx, setTx] = useState<any | undefined>(undefined);
    const [data, setData] = useState<any | undefined>(undefined);
    const [info, setInfo] = useState<AccountNFTsResponse | undefined>(undefined);
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [file, setFile] = useState<string | undefined>(undefined);
    const [cid, setCid] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const inputFile = useRef<HTMLInputElement>(null);
    const gateway = "https://ipfs.io/ipfs/"

    // XRPLからNFT情報を取得
    useEffect(() => {
        setup();
    }, [user?.account]);

    useEffect(() => {
        fetchAllConvertedURIs();
    }, [info]);

    const setup = async () => {
        if (user?.account) {
            const network = user?.networkEndpoint
            const client = new Client(network!)
            await client.connect()
            const info: AccountNFTsResponse = await client.request({
                command: "account_nfts",
                account: user.account,
            });
            setInfo(info);
            await client.disconnect()
        };
    }

    // IPFSのURIをHTTPSに変換
    const convertIpfsToHttps = (uri: string) => {
        return uri.replace("ipfs://", gateway);
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
        if (info?.result.account_nfts) {
            const allFetchedData = await Promise.all(
                info.result.account_nfts.map(async (nft) => {
                    if (nft.URI) {
                        const convertedURI = convertIpfsToHttps(convertHexToString(nft.URI));
                        return await fetchDataFromConvertedURI(convertedURI);
                    }
                })
            );
            setFetchedData(allFetchedData);
        }
    };

    const uploadFile = async (fileToUpload: any) => {
        try {
            setUploading(true);
            const data = new FormData();
            data.set("file", fileToUpload);

            const res = await fetch("/api/pinata", {
                method: "POST",
                body: data,
            });

            const resData: any = await res.json();
            setCid(resData);
            setFile(`${gateway}${await resData}`)
            setUploading(false);
        } catch (e) {
            console.log(e);
            setUploading(false);
            alert("Trouble uploading file");
        }
    };

    const handleChange = (e: any) => {
        setFile(e.target.files[0]);
        uploadFile(e.target.files[0]);
    };

    const handlePayloadStatus = async (uuid: string) => {
        if (uuid) {
            const checkPayloadStatus = setInterval(async () => {
                const status = await xumm.payload?.get(uuid);
                setTx(status);
                if (status?.meta.resolved) {
                    clearInterval(checkPayloadStatus);
                    setTx(status);
                    setData(status.payload)
                    setQr(undefined);
                    if (status.meta.signed === true) {
                    const client = new Client(user?.networkEndpoint!);
                    await client.connect();
                    const tx: AccountTxResponse = await client.request({
                        command: "account_tx",
                        account: user?.account!,
                        ledger_index_max: -1,
                        limit: 1,
                        tx_type: "NFTokenMint",
                    });
                    if (tx) {
                        const txData = tx.result.transactions[0].tx
                        // console.log(txData)
                        setData(txData)
                    }
                    await client.disconnect()
                }
            }
            }, 10000);
        }
    };

    const mint = async () => {
        const metadata =
        {
            "schema": "ipfs://bafkreidm5jupaz3mljjzqkbd62znrevyp24nigkokbt4t3iwcphfz5pcr4",
            "nftType": "art.v0",
            "name": "MyNFT",
            "description": "It's My NFT",
            "image": ("ipfs://" + cid)
        }
        try {
            const text = JSON.stringify(metadata);
            const blob = new Blob([text], { type: "application/json" });
            const data = new FormData();
            data.append("file", blob, "metadata.json");

            const res = await fetch("/api/pinata", {
                method: "POST",
                body: data,
            });

            const metaData = await res.json();
            const uri = convertStringToHex(`ipfs://${metaData}`)

            const payload = await createPayload({
                TransactionType: 'NFTokenMint',
                NFTokenTaxon: 0,
                Flags: 8,
                URI: uri
            });
            if (payload) {
                handlePayloadStatus(payload.uuid);
                setQr(payload.qr);
            }
            setup()
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <>
            {user?.account && (
                <div className='stats stats-vertical'>
                    {fetchedData && fetchedData.map((data: any, index: any) => (
                        <div className='stat' key={index}>
                            <label className='my-3 text-accent text-xl'>NFToken</label>
                            {data?.image &&
                                <Imag
                                    src={convertIpfsToHttps(data.image)}
                                    alt={`NFT ${index}`}
                                    width={256}
                                    height={256}
                                    className='mx-auto w-full'
                                />}
                            <details className="my-3 collapse collapse-arrow border border-primary bg-base-100">
                                <summary className="collapse-title text-accent text-xl">
                                    Metadata
                                </summary>
                                <div className="collapse-content text-left">
                                    <div>
                                        <pre className='text-success text-xs overflow-scroll'>
                                            {JSON.stringify(data, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </details>
                        </div>
                    ))}

                    {qr || tx ? (
                        <>
                            {qr &&
                                <div className="stat">
                                    <Imag
                                        src={qr}
                                        alt="QR"
                                        height={150}
                                        width={150}
                                        className='mx-auto w-full'
                                    />
                                </div>
                            }

                            {tx &&
                                <div className="stat">
                                    <details className="collapse collapse-arrow border border-primary bg-base-100">
                                        <summary className="collapse-title text-accent text-xl">
                                            {tx.response.resolved_at}
                                        </summary>
                                        <div className="collapse-content text-left">
                                            <pre className="text-success text-xs overflow-scroll">
                                                {JSON.stringify(data, null, 2)}
                                            </pre>
                                        </div>
                                    </details>
                                </div>
                            }
                        </>
                    ) : (
                        <>
                            <div className="stat my-3">
                                <label className="collapse-title text-xl">NFTokenMint</label>
                                <form className="join join-vertical">
                                    <input
                                        type="file"
                                        id="file"
                                        ref={inputFile}
                                        onChange={handleChange}
                                        className="pt-2 input input-bordered join-item w-full" />
                                    <button
                                        disabled={uploading}
                                        onClick={() => inputFile.current!.click()}
                                        className="btn btn-primary join-item text-xl">
                                        {uploading ? "Uploading..." : "Upload"}
                                    </button>
                                </form>
                            </div>
                            {file && (
                                <div className="stat my-3">
                                    <Imag
                                        src={file}
                                        alt="Image from IPFS"
                                        width={300}
                                        height={300}
                                        className="mx-auto w-[80%]"
                                    />
                                </div>
                            )}
                            {cid && (
                                <div className="stat my-3">
                                    <button className='btn btn-primary' onMouseDown={mint}>
                                        NFTokenMint
                                    </button>
                                    <div className="m-3 text-success text-xs overflow-scroll my-3">
                                        <div>
                                            CID: {cid}
                                        </div>
                                        <a
                                            href={`${gateway}${cid}`}
                                            className="block underline hover:text-primary [transition:0.3s]"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {`${gateway}${cid}`}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )
            }
        </>
    );
}
