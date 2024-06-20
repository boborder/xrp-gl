"use client"

import { useState, useEffect, useContext, createContext } from "react";
import { Xumm } from "xumm";
import { hash } from '@/lib/hash';
import { websocket } from "@/lib/websocket";

const xumm = new Xumm(process.env.XUMMAPI!, process.env.XUMMSECRET!);
// const xumm = new Xumm(process.env.XUMMAPI!);

type UserType = {
  account?: string;
  name?: string;
  domain?: string;
  picture?: string;
  networkEndpoint?: string;
  networkType?: string;
  source?: string;
  kycApproved?: boolean;
  token?: string;
};

export type UserProfile = {
  account?: string | null;
  age?: number | null;
  avatar?: string | null;
  bio?: string | null;
  currency?: string | null;
  country?: string | null;
  create_at?: string | null;
  done?: boolean | null;
  did?: string | null;
  email?: string | null;
  gender?: string | null;
  job?: string | null;
  lang?: string | null;
  locate?: string | null;
  name?: string | null;
  paystring?: string | null;
  sns?: string | null;
  tel?: string | null;
  url?: string | null;
  uuid?: string | null;
};

type UserContextType = {
  user: UserType;
  xumm: typeof xumm;
  store?: UserProfile;
  info: any;
  tx: any;
  obj: any;
  gravatar?: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({})
  const [store, setStore] = useState<UserProfile | undefined>(undefined);
  const [info, setInfo] = useState({});
  const [tx, setTx] = useState({});
  const [obj, setObj] = useState({});
  const [gravatar, setGravatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    getUser()
  }, []);

  const getUser = async () => {
    const user = xumm.user
    const userData = {
      account: await user.account,
      name: await user.name,
      domain: await user.domain,
      picture: await user.picture,
      networkEndpoint: await user.networkEndpoint,
      networkType: await user.networkType,
      source: await user.source,
      kycApproved: await user.kycApproved,
      token: await user.token
    };
    setUser(userData);

    //初回ログイン時にuserstoreに追加
    const id = await hash(userData.account)
    const getStore = await xumm.userstore?.get(id)
    // console.log(getStore)
    if (getStore?.account) setStore(getStore)
    else {
      const set = await xumm.userstore?.set(id, { account: userData.account })
      console.log(set)
    }

    //初回ログイン時にdbに追加
    const getAccount = await fetch(`/api/get?account=${userData.account}`, {method: "GET",})
    if (getAccount) {
      const profile = await getAccount.json()
      // console.log(profile?.result)
      if (profile.result === undefined) {
        const get = await fetch(`/api/${userData.account}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.TOKEN}`,
          }
        })
        const data = await get.json()
        console.log(data)
      }
    }

    const ws = `${userData.networkEndpoint || "wss://xrplcluster.com"}`
    const data = await websocket(userData.account!, ws)
    // console.log(data)
    if (data) {
      setInfo(data?.info)
      setTx(data?.tx)
      setObj(data?.obj)
      const gravatar = data.info.account_data.EmailHash;
      if (gravatar) setGravatar(`https://gravatar.com/avatar/${gravatar.toLowerCase()}?s=256`)
    }
    // const rpc = await fetch("/api/info", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ account: userData.account, network: ws })
    // })
    // console.log(await rpc.json())
  }

  return (
    <UserContext.Provider value={{ user, xumm, store, info, tx, obj, gravatar }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
