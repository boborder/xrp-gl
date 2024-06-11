"use client"

import { useEffect, useRef, useState } from 'react';
import { Client, convertHexToString, convertStringToHex } from 'xrpl';
import { useUser } from '@/components/UserProvider'
import { Imag } from './Imag';
import { createPayload } from "@/lib/payload";

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
    const { xumm, user } = useUser();
    const [qr, setQr] = useState<string | undefined>(undefined);
    const [tx, setTx] = useState<any | undefined>(undefined);
    const [info, setInfo] = useState<AccountNFTResponse | undefined>(undefined);
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [file, setFile] = useState<string | undefined>(undefined);
    const [cid, setCid] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const inputFile = useRef<HTMLInputElement>(null);
    const gateway = "https://ipfs.io/ipfs/"

    // XRPLからNFT情報を取得
    useEffect(() => {
        setup();
    }, [user.account]);

    useEffect(() => {
        fetchAllConvertedURIs();
    }, [info]);

    const setup = async () => {
        if (user.account) {
            const network = user.networkEndpoint
            const client = new Client(network!)
            await client.connect()
            const info = await client.request({
                command: "account_nfts",
                account: user.account,
            });
            // const json = { method: "account_nfts", params: [{ account: user.account }] };
            // const network = user.networkEndpoint?.replace("wss", "https").replace("51233", "51234")
            // console.log(network)
            // const response = await fetch((network || "https://xrplcluster.com"), {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(json),
            // });

            // const info: any = await response.json();
            setInfo(info.result as AccountNFTResponse);
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

    const handlePayloadStatus = async (payload?: any) => {
        const checkPayloadStatus = setInterval(async () => {
            const status: any = await xumm.payload?.get(payload?.uuid as string);
            if (status?.meta.resolved && !status?.meta.cancelled && (!tx || !status?.meta.cancelled)) {
                clearInterval(checkPayloadStatus);
                setTx(status);
                setQr(undefined);
            }
        }, 10000);
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
            handlePayloadStatus(payload.uuid);
            setQr(payload.qr);

            setup()
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <>
            {user.account && (
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
                            <details className="my-3 collapse collapse-arrow border border-base-300 bg-base-100">
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
                                    <details className="collapse collapse-arrow border border-base-300 bg-base-100">
                                        <summary className="collapse-title text-accent">
                                            {tx.response.resolved_at}
                                        </summary>
                                        <div className="collapse-content text-left">
                                            <pre className="text-success text-xs overflow-scroll">
                                                payload: {JSON.stringify(tx.payload, null, 2)}
                                            </pre>
                                        </div>
                                    </details>
                                </div>
                            }
                        </>
                    ) : (
                        <>
                            <div className="stat my-3">
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
