"use client"

import { useContext, createContext } from "react";
import useSWR from 'swr';
import { Xumm } from "xumm";
import sdk from '@crossmarkio/sdk';
import { hash } from '@/lib/hash';
import { dig } from "@/lib/dig";
import { AccountInfoResponse, AccountObject, AccountTxTransaction } from "xrpl";

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
  token?: string | null;
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

type Account = {
  info?: AccountInfoResponse;
  tx?: AccountTxTransaction[];
  obj?: AccountObject[];
}

type UserContextType = {
  xumm: typeof xumm;
  user?: UserType;
  store?: UserProfile;
  account?: Account;
  gravatar?: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const fetchUserData = async () => {
  await sdk.sync.connect();
  if (!sdk.sync.isConnected) {
    console.log(sdk.sync.signIn());
  }

  if (!xumm.user) {
    return null;
  }

  const user = xumm.user;
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

  const id = await hash(userData.account);
  const ws = `${userData.networkEndpoint || "wss://xrplcluster.com"}`;
  const getStorePromise = xumm.userstore?.get(id);
  const getAccountPromise = fetch(`/api/get?account=${userData.account}`, { method: "GET" });
  const getDataPromise = dig(userData.account!, ws, 'info', 'obj', 'tx');
  const [getStore, getAccount, getData] = await Promise.all([getStorePromise, getAccountPromise, getDataPromise]);

  if (!getStore?.account) {
    await xumm.userstore?.set(id, { account: userData.account });
  }

  if (getAccount) {
    const profile = await getAccount.json();
    if (profile === "{}" || !profile.result) {
      await fetch(`/api/${userData.account}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.TOKEN}`,
        }
      });
    }
  }

  const gravatar = getData?.info.result.account_data.EmailHash;

  // const rpc = await fetch("/api/info", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ account: userData.account, network: ws })
  // })
  // console.log(await rpc.json())
  return {
    userData,
    store: getStore,
    account: {
      info: getData?.info,
      tx: getData?.tx,
      obj: getData?.obj
    },
    gravatar: gravatar ? `https://gravatar.com/avatar/${gravatar.toLowerCase()}?s=256` : undefined
  };
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSWR('userData', fetchUserData);

  return (
    <UserContext.Provider value={{xumm, user: data?.userData, store: data?.store, account: data?.account, gravatar: data?.gravatar }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
