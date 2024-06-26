"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { createPayload } from '../lib/payload';
import { AccountTxResponse, Client } from "xrpl";

export const Multisign = () => {
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
              tx_type: "SignerListSet",
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

  const Multisign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const signerEntries = [];

    for (let i = 0; i < 2; i++) {
      const account = formData.get(`list${i}`) as string;
      if (account && account.startsWith('r')) {
        signerEntries.push({
          SignerEntry: {
            Account: account,
            SignerWeight: 1,
          },
        });
      }
    }

    if (signerEntries.length > 0) {
      const payload = await createPayload({
        // Flags: 0,
        TransactionType: 'SignerListSet',
        // Account: user.account,
        SignerQuorum: 2,
        SignerEntries: signerEntries,
      })
      if (payload) {
        setQr(payload.qr)
        handlePayloadStatus(payload.uuid);
      }
    } else {
      console.log("有効なアドレスが提供されていません。");
    }
  }

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
                  <details className="stat-desc collapse collapse-arrow border border-primary bg-base-100">
                    <summary className="collapse-title text-accent">
                      {tx.response.resolved_at}
                    </summary>
                    <div className="collapse-content text-left text-xl">
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
              <label className="stat-title text-accent">
                SignerList Set
              </label>
              <form onSubmit={Multisign} className="my-3 join join-vertical">
                <input
                  type="text"
                  name="list0"
                  id="list0"
                  placeholder="r..."
                  className="input input-bordered w-full join-item"
                />
                <input
                  type="text"
                  name="list1"
                  id="list1"
                  placeholder="r..."
                  className="input input-bordered w-full join-item"
                />
                <button className="btn btn-primary join-item">SignerList Set</button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
};
