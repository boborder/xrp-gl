"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { createPayload } from "@/lib/payload";
import { Client, Wallet, signPaymentChannelClaim, verifyPaymentChannelClaim, } from 'xrpl'
import BigNumber from 'bignumber.js'

export const Payment = () => {
  const { xumm, user } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [channel, setChannel] = useState<string | undefined>(undefined);
  const [sign, setSign] = useState<string | undefined>(undefined);
  const [prog, setProg] = useState<boolean | null>(null);
  const signature = Wallet.fromSeed(process.env.SEED!);
  console.log(signature.privateKey + '/' + signature.publicKey)

  const handlePayloadStatus = async (uuid?: any) => {
    const checkPayloadStatus = setInterval(async () => {
      const status: any = await xumm.payload?.get(uuid as string);
      if (status?.meta.resolved && !status?.meta.cancelled) {
        clearInterval(checkPayloadStatus);
        setTx(status);
        setQr(undefined);
      }
    }, 10000);
  };

  const paychanCreate = async () => {
    const create = await createPayload({
      TransactionType: 'PaymentChannelCreate',
      Destination: "r44444Q525rRY3hiwgwjP9zN1R8Z8QQ7oc",
      Amount: String(12_345_678),
      SettleDelay: 86400,
      PublicKey: signature.publicKey,
    });
    setQr(create.qr)
    handlePayloadStatus(create.uuid)
    setProg(false)
  }
  const paychanSign = async () => {
    // ChannelIDの取得
    const client = new Client('wss://testnet.xrpl-labs.com')
    await client.connect();

    const response = await client.request({
      command: 'account_channels',
      account: user.account!,
    })
    console.log(response.result.channels[0].channel_id)
    const channel_id = response.result.channels[0].channel_id
    setChannel(channel_id)

    const amount = "12345678"
    // 送金人: オフレジャー支払いへの署名
    const paychanSignature = signPaymentChannelClaim(channel_id, amount, signature.privateKey)
    console.log(paychanSignature)
    setSign(paychanSignature)
    // 受取人: オフレジャー支払い情報の検証
    if (!verifyPaymentChannelClaim(channel_id, amount, paychanSignature, signature.publicKey)) {
      throw new Error('Invalid signature')
    }

    const response2 = await client.request({
      command: 'account_channels',
      account: user.account!,
    })
    console.log(response2.result)
    setProg(true)
    await client.disconnect()
  }
  const paychanClaim = async () => {
    const claim = await createPayload({
      TransactionType: 'PaymentChannelClaim',
      Channel: channel,
      Balance: String(12_345_678),
      Amount: String(12_345_678),
      Signature: sign,
      PublicKey: signature.publicKey,
    });
    setQr(claim.uuid)
    handlePayloadStatus(claim.uuid)
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
                <>
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
                  {(prog === true) ? (
                    <div className="stat">
                      <button onClick={paychanClaim} className="my-3 mx-auto btn btn-primary text-xl min-w-64" >
                        PaymentChannelClaim
                      </button>
                    </div>
                  ) : (
                    <div className="stat">
                      <button onClick={paychanSign} className="my-3 mx-auto btn btn-primary text-xl min-w-64">
                        PaymentChannelOffline
                      </button>
                    </div>
                  )}
                </>
              }
            </>
          ) : (
            <div className="stat">
              <button onClick={paychanCreate} className="my-3 mx-auto btn btn-primary text-xl min-w-64">
                PaymentChannelCreate
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};
