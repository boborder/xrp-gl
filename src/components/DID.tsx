"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";

export const DID = () => {
  const { xumm, userInfo } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);

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

  const push = async (payload?: any) => {
    const message = payload?.pushed
      ? `Payload '${payload?.uuid}' pushed to your phone.`
      : "Payload not pushed, opening payload...";
    alert(message);
    if (!payload?.pushed) {
      window.open(payload?.next.always);
    }
  };

  const createPayload = async (Payload: any) => {
    setTx(undefined);
    const payload = await xumm.payload?.create({
      ...Payload,
      // Fee: 123,
    });
    await xumm.xapp?.openSignRequest(payload);
    setQr(payload?.refs.qr_png);
    push(payload);
    handlePayloadStatus(payload);
  };

  const didSet = async () => {
    if (userInfo.account) {
      const document = {
        "@context":
          [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/secp256k1-2019/v1"
          ],
        "id": `did:xrpl:0:${userInfo.account}`,

        "authentication":
          [{
            "id": `did:xrpl:0:${userInfo.account}`,
            "type": "secp256k1",
            "controller": `did:xrpl:0:${userInfo.account}`
          }]
      }

      try {
        const text = JSON.stringify(document);
        const blob = new Blob([text], { type: "application/json" });
        const data = new FormData();
        data.append("file", blob, "document.json");

        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: data,
        });

        const resData = await res.json();
        const cid = resData.IpfsHash

        await createPayload({
          TransactionType: 'DIDSet',
          // URI: `ipfs://${cid}`
          // URI: "",
          // Data: document,
          Data: "",
        })
      } catch (e) {
        console.log(e);
        alert("Trouble uploading document");
      }
    }
  }

  return (
    <>
      {userInfo.account && (
        <>
          {qr || tx ? (
            <>
              {qr &&
                <div className="stat xs:w-64">
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
                <div className="stat xs:w-64">
                  <details className="stat-desc collapse collapse-arrow border border-base-300 bg-base-100">
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
            <div className="stat">
              <label className="stat-title text-accent">
                DID Set
              </label>
              <button
                onClick={didSet}
                className="my-3 btn btn-primary">
                DID Set
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};
