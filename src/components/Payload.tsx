"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { Imag } from "./Imag";
import { useRouter } from "next/navigation";
import { createPayload } from "@/lib/payload";

export const Payload = () => {
  const { xumm, user, info } = useUser();
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const router = useRouter()

  const handlePayloadStatus = async (uuid: string) => {
    if (uuid) {
      const checkPayloadStatus = setInterval(async () => {
        const status = await xumm.payload?.get(uuid);
        if (status?.meta.resolved) {
          clearInterval(checkPayloadStatus);
          setTx(status);
          setQr(undefined);
          console.log(status)
        }
      }, 10000);
    }
  };

  const payload = async () => {
    const payload = await createPayload({
      TransactionType: 'SignIn',
    });
    if (payload) {
      setQr(payload.qr);
      handlePayloadStatus(payload.uuid);
    }
  };

  const Signin = async () => {
    await xumm.authorize();
    window.location.reload()
    router.push(`/profile/${user.account || "user"}`)
  };

  const logout = async () => {
    await xumm.logout();
    window.location.reload()
    router.push("/")
  };
  return (
    <>
      {user.account ? (
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
            <>
              <div className="stat">

                <div className="text-accent text-xl">Sign</div>
                <button onClick={payload} className="mx-auto min-w-56 my-3">
                  <Imag
                    src={"/ipfs/sign-in-with-xumm.png"}
                    width={360}
                    height={100}
                    alt="sign"
                  />
                </button>

                {info && (
                  <details className="my-3 collapse collapse-arrow border border-primary bg-base-100">
                    <summary className="collapse-title text-accent text-xl">
                      Account Info
                    </summary>
                    <div className="collapse-content text-left">
                      <pre className="text-success text-xs overflow-scroll">
                        {JSON.stringify(info, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}

                <div className="text-accent text-xl">Logout</div>
                <button className="text-xl btn btn-primary mx-auto min-w-52 my-3" onClick={logout}>
                  logout
                </button>

              </div>
            </>
          )}
        </>
      ) : (
        <div className="stat">
          <div className="text-accent text-xl">Sign In</div>
          <div onClick={Signin} className="mx-auto min-w-56 my-3">
            <Imag
              src={"/ipfs/sign-in-with-xumm.png"}
              width={360}
              height={100}
              alt="sign"
            />
          </div>
        </div>
      )}
    </>
  );
};
