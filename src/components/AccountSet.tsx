"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { convertStringToHex, Transaction } from 'xrpl';

export const AccountSet = () => {
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
    const message = payload?.pushed ? (
      `Payload '${payload?.uuid}' pushed to your phone.`
    ) : (
      "Payload not pushed, opening payload..."
    )
    alert(message);
    if (!payload?.pushed) {
      window.open(payload?.next.always);
    }
  };


  const createPayload = async (Transaction: any) => {
    setTx(undefined);
    const payload = await xumm.payload?.create({
      ...Transaction,
      // Fee: 123,
    });
    await xumm.xapp?.openSignRequest(payload);
    setQr(payload?.refs.qr_png);
    push(payload);
    handlePayloadStatus(payload);
  };

  const accountSet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const domain = formData?.get("domain");
    const email = formData?.get("email");
    const flag = formData.get("flag");

    const domainHex = convertStringToHex(domain as string)

    const crypto = require('crypto')
    const md5hex = (str: string) => {
      const hash = crypto.createHash('md5').update(str, 'binary').digest('hex');
      return hash.toUpperCase();  // 大文字に変換
    }
    const emailhash = md5hex(email as string)

    // account set transaction
    flag ? (
      await createPayload({
        TransactionType: 'AccountSet',
        Domain: domainHex,
        EmailHash: emailhash
      })
    ) : (
      await createPayload({
        TransactionType: 'AccountSet',
        Domain: domainHex,
        EmailHash: emailhash,
        SetFlag: flag
      })
    )
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
                Account Set
              </label>
              <form onSubmit={accountSet} className="my-3 join join-vertical">
                <input
                  type="text"
                  name="domain"
                  id="domain"
                  placeholder="Domain"
                  className="input input-bordered w-full join-item"
                />
                <input
                  type="text"
                  name="email"
                  id="email"
                  placeholder="Email"
                  className="input input-bordered w-full join-item"
                />

                <select name="flag" className="select select-bordered join-item">
                  <option disabled value={undefined}>Set Flag</option>
                  <option value={undefined}>None</option>
                  <option value={8}>DefaultRippling</option>
                  <option value={1}>RequireDestTag</option>
                  <option value={9}>DepositeAuth</option>
                  <option value={4}>DisableMaster</option>
                </select>
                <button className="btn btn-primary join-item">Account Set</button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
};
