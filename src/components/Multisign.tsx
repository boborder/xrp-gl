"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";

export const Multisign = () => {
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
      await createPayload({
        TransactionType: 'SignerListSet',
        SignerQuorum: 2,
        SignerEntries: signerEntries,
      });
    } else {
      console.log("有効なアドレスが提供されていません。");
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
