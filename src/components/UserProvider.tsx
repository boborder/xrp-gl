"use client"

import { useState, useEffect, useContext, createContext } from "react";
import { Xumm } from "xumm";
import { hash } from '@/lib/hash';
import { AccountInfoResponse, AccountObjectsResponse, AccountTxResponse, Client } from "xrpl";

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

    const info: AccountInfoResponse = await client.request({
      command: "account_info",
      account: userData.account!,
    });
    const data = info.result
    setAccount(data)

    const tx: AccountTxResponse = await client.request({
      command: "account_tx",
      account: userData.account!,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 10,
    });
    const txData = tx.result
    // console.log(txData)

    const obj: AccountObjectsResponse = await client.request({
      command: "account_objects",
      account: userData.account!,
      type: "did",
    });
    const objData = obj.result
    // console.log(objData)

    const gravatar = data.account_data.EmailHash;
    if (gravatar) {
      setGravatar(`https://gravatar.com/avatar/${gravatar.toLowerCase()}?s=256`)
    }

    await client.disconnect()
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
