"use client";

import { useState } from "react";
import { UserProfile, useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { AccountTxResponse, Client, convertStringToHex } from 'xrpl';
import { createPayload } from "@/lib/payload";
import { hash } from '../lib/hash';
import { useRouter } from "next/navigation";

export const DID = (profile?: any) => {
  const { xumm, user } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [data, setData] = useState<any | undefined>(undefined);
  const [duc, setDuc] = useState<any | undefined>(undefined);
  const router = useRouter()

  const handlePayloadStatus = async (uuid: string) => {
    if (uuid) {
      const checkPayloadStatus = setInterval(async () => {
        const status = await xumm.payload?.get(uuid);
        if (status?.meta.resolved) {
          clearInterval(checkPayloadStatus);
          setTx(status);
          setData(status.payload)
          setQr(undefined);
          if (status.meta.signed === true) {

            const client = new Client(user.networkEndpoint!);
            await client.connect();
            const tx: AccountTxResponse = await client.request({
              command: "account_tx",
              account: user.account!,
              ledger_index_max: -1,
              limit: 1,
            });
            if (tx) {
              const txData = tx.result.transactions[0].tx
              // console.log(txData)
              setData(txData)
            }
            await client.disconnect()

            const put = await fetch(`/api/${user.account}`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${process.env.TOKEN}`,
              },
              body: JSON.stringify({ did: ("did:xrpl:0" + user.account) })
            })
            if (put.status === 200) {
              const data = await put.json()
              const setData = data.result

              Object.keys(setData).forEach(key => {
                const typedKey = key as keyof UserProfile;
                if (setData[typedKey] === null) {
                  setData[typedKey] = undefined;
                }
              });
              await xumm.userstore?.set(await hash(user.account), data.result)
            }
            // window.location.reload()
            router.refresh()
          }
        }
      }, 10000);
    }
  };

  const uploadToIPFS = async (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, fileName);
    const response = await fetch("/api/pinata", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to upload ${fileName}`);
    }
    return response.json();
  };

  const didSet = async () => {
    const id = `did:xrpl:0:${user.account}`;
    const document = {
      "@context": "https://www.w3.org/ns/did/v1",
      "id": id,
      "publicKey": [{
        "id": id,
        "type": "Secp256k1VerificationKey2018",
        "controller": id,
        "publicKeyHex": convertStringToHex(id)
      }],
      "assertionMethod": [id],
      "authentication": [id]
    };

    setDuc(JSON.stringify(document, null, 2));

    try {
      const docCid = await uploadToIPFS(document, "document.json");
      const uri = convertStringToHex(`ipfs://${docCid}`);

      const profCid = await uploadToIPFS(profile, "profile.json");
      const data = convertStringToHex(`ipfs://${profCid}`);

      const payload = await createPayload({
        TransactionType: 'DIDSet',
        URI: uri,
        Data: data,
      });
      if (payload) {
        setQr(payload.qr)
        handlePayloadStatus(payload.uuid)
      }
    } catch (e) {
      console.error(e);
      alert("Trouble uploading document or profile");
    }
  };

  const didDelete = async () => {
    const payload = await createPayload({
      TransactionType: 'DIDDelete',
    })
    if (payload) {
      setQr(payload.qr)
      handlePayloadStatus(payload.uuid)
    }
  }

  return (
    <>
      {user.account && (
        <>
          {duc && (
            <div className="stat">
              <details className="collapse collapse-arrow border border-primary bg-base-100">
                <summary className="collapse-title text-accent text-xl">
                  document.json
                </summary>
                <div className="collapse-content text-left">
                  <pre className="text-success text-xs overflow-scroll">
                    {duc}
                  </pre>
                </div>
              </details>
            </div>
          )}
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
            <div className="stat max-w-xl">
              <div className="my-3 join join-vertical lg:join-horizontal mx-auto">
                <button
                  onClick={didSet}
                  className="text-xl btn btn-primary join-item min-w-72">
                  DID Set
                </button>
                <button
                  onClick={didDelete}
                  className="text-xl btn btn-secondary join-item min-w-72">
                  DID Delete
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
