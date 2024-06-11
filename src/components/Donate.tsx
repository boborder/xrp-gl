"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { convertStringToHex } from "xrpl";
import { createPayload } from "@/lib/payload";

export const Donate = () => {
  const { xumm, user } = useUser();
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

    const donate = async () => {
    const payload = await createPayload({
      TransactionType: 'Payment',
      Destination: "rQqqqqJyn6sKBzByJynmEK3psndQeoWdP",
      // Amount: String(123_456_789),
      Memos: [
        {
          Memo: {
            MemoData: convertStringToHex("Donate"),
            MemoFormat: "746578742F706C61696E",
            MemoType: convertStringToHex("Payment")
          }
        },
      ],
    });
    setQr(payload.qr)
    handlePayloadStatus(payload.uuid)
  };

  return (
    <>
      {user.account && (
        <>
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
            <div className="stat">
              <div className="text-accent text-xl">Donate</div>
              <button onClick={donate} className="mx-auto my-3">
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
