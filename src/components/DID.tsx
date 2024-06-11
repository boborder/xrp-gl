"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { convertStringToHex } from 'xrpl';
import { createPayload } from "@/lib/payload";

export const DID = (profile?: any) => {
  const { xumm, user } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [duc, setDuc] = useState<any | undefined>(undefined);

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

  const didSet = async () => {
    if (user.account) {
      const id = `did:xrpl:0:${user.account}`
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
      }
      setDuc(JSON.stringify(document, null, 2))

      try {
        const text = JSON.stringify(document);
        const blob = new Blob([text], { type: "application/json" });
        const data = new FormData();
        data.append("file", blob, "document.json");

        const res = await fetch("/api/pinata", {
          method: "POST",
          body: data,
        });

        const cid = await res.json();
        const uri = convertStringToHex(`ipfs://${cid}`)
        const userdata = convertStringToHex(profile)
        const payload = await createPayload({
          TransactionType: 'DIDSet',
          URI: uri,
          Data: userdata,
        })
        setQr(payload.qr)
        handlePayloadStatus(payload.uuid)
      } catch (e) {
        console.log(e);
        alert("Trouble uploading document");
      }
    }
  }

  const didDelete = async () => {
    const payload = await createPayload({
      TransactionType: 'DIDDelete',
    })
    setQr(payload.qr)
    handlePayloadStatus(payload.uuid)
  }

  return (
    <>
      {user.account && (
        <>
          {duc && (
            <div className="stat">
              <details className="collapse collapse-arrow border border-base-300 bg-base-100">
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
