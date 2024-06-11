"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { convertStringToHex } from 'xrpl';
import { createPayload } from "@/lib/payload";

export const AccountSet = () => {
  const { xumm, user } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [clear, setClear] = useState<boolean>(false);

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

  const accountSet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const domain = formData?.get("domain");
    const email = formData?.get("email");
    const flag = formData?.get("flag");

    const transaction: any = {};
    transaction.TransactionType = 'AccountSet';
    if (domain) {
      const domainHex = convertStringToHex(domain as string);
      transaction.Domain = domainHex;
    }
    if (email) {
      const crypto = require('crypto');
      const md5hex = (str: string) => {
        const hash = crypto.createHash('md5').update(str, 'binary').digest('hex');
        return hash.toUpperCase();  // 大文字に変換
      };
      const emailhash = md5hex(email as string);
      transaction.EmailHash = emailhash;
    }
    if (flag !== "None") {
      if (clear) {
        transaction.ClearFlag = flag;
      } else {
        transaction.SetFlag = flag;
      }
    }

    const payload = await createPayload(transaction)
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
                  <option disabled>Set Flag</option>
                  <option value={undefined!}>None</option>
                  <option value={1}>RequireDestTag</option>
                  <option value={2}>RequireAuth</option>
                  <option value={3}>DisallowXRP</option>
                  <option value={4}>DisableMaster</option>
                  <option value={6}>NoFreeze</option>
                  <option value={7}>GlobalFreeze</option>
                  <option value={8}>DefaultRippling</option>
                  <option value={9}>DepositeAuth</option>
                  <option value={10}>AuthorizedNFTokenMinter</option>
                  <option value={16}>AllowTrustLineClawback</option>
                </select>
                <label tabIndex={0} className="btn btn-ghost swap join-item">
                  <input type="checkbox" checked={clear} onChange={() => setClear(!clear)} />
                  <div className="swap-on">ClearFlag: on  ❤️</div>
                  <div className="swap-off">ClearFlag: off ♡</div>
                </label>
                <button className="text-xl btn btn-primary join-item">AccountSet</button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
};
