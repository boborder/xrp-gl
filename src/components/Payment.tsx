"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { createPayload } from "@/lib/payload";
import { AccountChannelsResponse, AccountTxResponse, Client, Transaction, TxResponse, Wallet, getBalanceChanges, signPaymentChannelClaim, verifyPaymentChannelClaim, } from 'xrpl'
import { useRouter } from "next/navigation";
import { Decode, Encode } from "xrpl-tagged-address-codec";
import { hash } from "@/lib/hash";

export const Payment = (name?: any) => {
  const { xumm, user } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [data, setData] = useState<any | undefined>(undefined);
  const [channel, setChannel] = useState<string | undefined>(undefined);
  const [prog, setProg] = useState<boolean>(false);
  const signature = Wallet.fromSeed(process.env.SEED!);
  const router = useRouter()

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
            console.log(status.response.txid)
            const client = new Client(user?.networkEndpoint!)
            await client.connect();
            const tx: AccountTxResponse = await client.request({
              command: "account_tx",
              account: user?.account!,
              ledger_index_max: -1,
              limit: 1,
            });
            if (tx) {
              const txData = tx.result.transactions[0].tx
              console.log(tx)
              setData(txData)

              if (tx.status === "tesSUCCESS") {
                const success = await fetch(`/api/${user?.account}`, {
                  method: "PUT",
                  body: JSON.stringify({
                    account: user?.account,
                    paystring: (name + "$xrp.gl"),
                    done: true
                  })
                })
                const data = await success.json()
                console.log(tx.status + "!!" + data.done)
              }

            }
          }

          //   const response: AccountChannelsResponse = await client.request({
          //     command: 'account_channels',
          //     account: user.account!,
          //   });
          //   if (response) {
          //     // channels配列の最後の要素を取得
          //     const channels = response.result.channels;
          //     console.log(channels)
          //     const channel_id = channels[channels.length - 1].channel_id;
          //     console.log("Channel_id: " + channel_id);
          //     setChannel(channel_id);
          //     await client.disconnect()
          //     setProg(true)
          //   }
          // }
        }
      }, 10000);
    }
  };

  const channelCreate = async () => {
    const rip = await hash(user?.account!)
    const hashInt = BigInt("0x" + rip)
    const hashtag = hashInt % BigInt(1234567890)

    const tagged = Encode({ account: 'rTTPiTzEy729zHn3MFvEELL5e54fr13ub', tag: hashtag.toString() })
    console.log(tagged)
    const untagged = Decode(tagged)
    console.log(untagged)

    const payload = await createPayload({
      TransactionType: 'PaymentChannelCreate',
      Destination: "rTTPiTzEy729zHn3MFvEELL5e54fr13ub",
      DestinationTag: hashtag.toString(),
      Amount: String(12_345_678),
      SettleDelay: 86400,
      PublicKey: signature.publicKey,
    });
    if (payload) {
      handlePayloadStatus(payload.uuid)
      setQr(payload.qr)
    }
  }

  const channelAuth = async () => {
    // ChannelIDの取得
    const amount = "12345678"
    // 送金人: オフレジャー支払いへの署名
    if (channel) {
      const paychanSignature = signPaymentChannelClaim(channel, amount, signature.privateKey)
      console.log("Signature: " + paychanSignature)

      // 受取人: オフレジャー支払い情報の検証
      if (!verifyPaymentChannelClaim(channel, amount, paychanSignature, signature.publicKey)) {
        throw new Error('Invalid signature')
      }

      const client = new Client(user?.networkEndpoint!)
      await client.connect();
      const wallet = Wallet.fromSeed("sEd7ufdKWHmduLNzudXRZXKC2xPL4T2")

      // トランザクション
      const txForm: Transaction = await client.autofill({
        TransactionType: 'PaymentChannelClaim',
        Account: wallet.classicAddress,
        Channel: channel,
        Balance: amount,
        Amount: amount,
        // Signature: paychanSignature,
        PublicKey: signature.publicKey,
      });

      // トランザクションに署名。
      const signed = wallet.sign(txForm);

      //トランザクションを送信し、結果を待ちます。
      const data: TxResponse = await client.submitAndWait(signed.tx_blob);
      let status
      if (data.result.meta !== undefined && typeof data.result.meta !== "string") {
        console.log(data)
        status = data.result.meta.TransactionResult
        setData(data);
      }
      console.log(status)
      await client.disconnect();

      if (status === "tesSUCCESS") {
        const success = await fetch(`/api/${user?.account}`, {
          method: "PUT",
          body: JSON.stringify({
            account: user?.account,
            paystring: (name + "$xrp.gl"),
            done: true
          })
        })
        const data = await success.json()
        console.log(status + "!!" + data.done)
      }
    }
  }

  const pay = async () => {
    const rip = await hash(user?.account!)
    const hashInt = BigInt("0x" + rip)
    const hashtag = hashInt % BigInt(1234567890)

    const tagged = Encode({ account: 'rTTPiTzEy729zHn3MFvEELL5e54fr13ub', tag: hashtag.toString() })
    console.log(tagged)
    const untagged = Decode(tagged)
    console.log(untagged)

    const payload = await createPayload({
      TransactionType: 'Payment',
      Destination: untagged.account,
      DestinationTag: untagged.tag,
      Amount: String(12_345_678),
    });
    if (payload) {
      handlePayloadStatus(payload.uuid)
      setQr(payload.qr)
    }
  }

  const Signin = async () => {
    await xumm.authorize();
    router.push(`/profile/${user?.account || "user"}`)
  };

  return (
    <>
      {user?.account ? (
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
                    <details className="collapse collapse-arrow border border-primary bg-base-100">
                      <summary className="collapse-title text-accent">
                        {tx.response.resolved_at}
                      </summary>
                      <div className="collapse-content text-left">
                        <pre className="text-success text-xs overflow-scroll">
                          {JSON.stringify(data, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                  {/* {prog && (
                    <div className="stat">
                      <button onClick={channelAuth} className="my-3 mx-auto btn btn-primary text-xl">
                        ChannelAuthorize
                      </button>
                    </div>
                  )} */}
                </>
              }
            </>
          ) : (
            // <div className="stat">
            //   <button onClick={channelCreate} className="my-3 mx-auto btn btn-primary text-xl">
            //     PaymentChannelCreate
            //   </button>
            // </div>
            <div className="stat">
            <button onClick={pay} className="my-3 mx-auto btn btn-primary text-xl">
              Payment
            </button>
          </div>
          )}
        </>
      ) : (
        <div className="stat">
          <div onClick={Signin} className="mx-auto my-3">
            <Imag
              src={"/ipfs/sign-in-with-xumm.png"}
              width={360}
              height={100}
              alt="sign"
            />
          </div>
        </div>
      )
      }
    </>
  );
};
