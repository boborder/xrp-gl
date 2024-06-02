"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { convertStringToHex } from "xrpl";

export const Donate = () => {
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

    const donate = async () => {
    await createPayload({
      TransactionType: 'Payment',
      Destination: "rQqqqqJyn6sKBzByJynmEK3psndQeoWdP",
      Memos: [
        {
          Memo: {
            MemoData: convertStringToHex("Donate"),
            MemoFormat: "746578742F706C61696E",
            MemoType: convertStringToHex("Donate For You")
          }
        },
      ],
    });
  };

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
              <div className="stat-title text-accent">Donate</div>
              <button onClick={donate} className="mx-auto">
                <Imag
                  src={"/ipfs/donate-with-xumm.png"}
                  width={240}
                  height={100}
                  alt="sign"
                />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};
