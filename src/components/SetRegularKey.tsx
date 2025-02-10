"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { createPayload } from "@/lib/payload";
import { type AccountTxResponse, Client } from 'xrpl';

export const SetRegularKey = () => {
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
          setData(status.payload);
          setQr(undefined);
          if (status.meta.signed === true) {
            const client = new Client(user?.networkEndpoint!);
            await client.connect();
            const tx: AccountTxResponse = await client.request({
              command: "account_tx",
              account: user?.account!,
              ledger_index_max: -1,
              limit: 1,
              tx_type: "SetRegularKey",
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

  const setRegularKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const setKey = event.currentTarget.key.value;
    const payload = await createPayload({
      TransactionType: 'SetRegularKey',
      // Account: user.account,
      RegularKey: setKey,
    });
    if (payload) {
      setQr(payload.qr)
      handlePayloadStatus(payload.uuid)
    }
  }

  const setBlackHole = async () => {
    const payload = await createPayload({
      TransactionType: 'SetRegularKey',
      // Account: user.account,
      RegularKey: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
    });
    if (payload) {
      setQr(payload.qr)
      handlePayloadStatus(payload.uuid)
    }
  }

  return (
    <>
      {user?.account && (
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
                  <details className="stat-desc collapse collapse-arrow border border-primary bg-base-100">
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
