"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { AccountTxResponse, Client, convertStringToHex } from "xrpl";
import { createPayload } from "@/lib/payload";

export const Donate = () => {
  const { xumm, user } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [data, setData] = useState<any | undefined>(undefined);

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
              tx_type: "Payment",
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
    if (payload) {
      setQr(payload.qr)
      handlePayloadStatus(payload.uuid)
    }
  };

  return (
    <>
      {user?.account && (
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
            <div className="stat">
              <div className="text-accent text-xl">Donate</div>
              <button onClick={donate} className="btn-ghost mx-auto my-3">
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
