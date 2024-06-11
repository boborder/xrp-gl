"use client"

import { useState, useEffect, useContext, createContext } from "react";
import { Xumm } from "xumm";
import { hash } from '@/lib/hash';
import { Client } from "xrpl";

const xumm = new Xumm(process.env.XUMMAPI!, process.env.XUMMSECRET!);

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
  account?: string;
  age?: number;
  avatar?: string;
  bio?: string;
  currency?: string;
  country?: string;
  did?: string;
  email?: string;
  gender?: string;
  job?: string;
  name?: string;
  lang?: string;
  locate?: string;
  paystring?: string;
  sns?: string;
  tel?: string;
  url?: string;
  uuid?: string;
};

type UserContextType = {
  user: UserType;
  xumm: typeof xumm;
  store?: UserProfile;
  account: any;
  gravatar?: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({})
  const [store, setStore] = useState<UserProfile | undefined>(undefined);
  const [account, setAccount] = useState({});
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

    const id = await hash(userData.account)
    const getUser = await xumm.userstore?.get(id)
    setStore(getUser)

    const ws = `${userData.networkEndpoint || "wss://xrplcluster.com"}`
    const client = new Client(ws);
    await client.connect();

    const info = await client.request({
      command: "account_info",
      account: userData.account!,
    });
    const data: any = info.result

    const tx = await client.request({
      command: "account_tx",
      account: userData.account!,
      ledger_index_min: -1,
      ledger_index_max: -1,
    });
    const txData: any = tx.result

    const obj = await client.request({
      command: "account_objects",
      account: userData.account!,
    });
    const objData: any = obj.result

    // const json = { method: "account_info", params: [{ account: userData.account }] };
    // const info = await fetch(`${userData.networkEndpoint?.replace("wss", "https").replace("51233", "51234") || "https://xrplcluster.com"}`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(json),
    // });

    // const data = await info.json();
    setAccount(data)
    await client.disconnect()

    const gravatar = data.account_data?.urlgravatar;
    if (gravatar) {
      setGravatar(`${gravatar.replace("http", "https")}?s=256`)
    }

  }

  return (
    <UserContext.Provider value={{ user, xumm, store, account, gravatar }}>
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
