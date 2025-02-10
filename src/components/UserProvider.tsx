"use client"

import { useContext, createContext, useEffect } from "react";
import useSWR from 'swr';
import { getData } from "../lib/getData";
import { Xumm } from "xumm";
import type { AccountInfoResponse, AccountObject, AccountTxTransaction } from "xrpl";

const apiKey = process.env.XUMMAPI;
const secret = process.env.XUMMSECRET;
if (!apiKey || !secret) {
	throw new Error("API or SECRET is not set");
}
const xumm = new Xumm(apiKey, secret);

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

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const { data, mutate } = useSWR('user', getData);

  // useEffect(() => {
  //   if (data) {
  //     mutate();
  //   }
  // }, [data, mutate]);

  return (
    <UserContext.Provider value={
      {
        xumm,
        user: data?.userData,
        store: data?.store,
        account: data?.account,
        gravatar: data?.gravatar
      }}>
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
