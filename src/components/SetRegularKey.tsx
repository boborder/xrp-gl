"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { createPayload } from "@/lib/payload";
import { convertStringToHex } from 'xrpl';

export const SetRegularKey = () => {
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

  const setRegularKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const setkey = event.currentTarget.key.value;
    const keyhex = convertStringToHex(setkey)
    const payload = await createPayload({
      // Flags: 0,
      TransactionType: 'SetRegularKey',
      // Account: user.account,
      RegularKey: setkey,
      // RegularKey: keyhex
    });
    setQr(payload.qr)
    handlePayloadStatus(payload.uuid)
  }

  const setBlackHole = async () => {
    const payload = await createPayload({
            // Flags: 0,
      TransactionType: 'SetRegularKey',
          // Account: user.account,
      RegularKey: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
    });
    setQr(payload.qr)
    handlePayloadStatus(payload.uuid)
  }

  return (
    <>
      {user.account && (
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
              <label className="text-accent text-xl">
                RegularKey Set
              </label>
              <form onSubmit={setRegularKey} className="my-3 join join-vertical">
                <input
                  type="text"
                  name="key"
                  id="key"
                  placeholder="address(r...)"
                  className="input input-bordered w-full join-item"
                />
                <button className="text-xl btn btn-primary join-item">setRegularKey</button>
                <button
                  type="button"
                  onClick={setBlackHole}
                  className="text-xl btn btn-secondary join-item">
                  BlackHole
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
};
