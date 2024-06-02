"use client"

import { useState, useEffect, useContext, createContext } from "react";
import { Xumm } from "xumm";

const xumm = new Xumm(process.env.XUMMAPI!, process.env.XUMMSECRET!);

type UserInfoType = {
  account?: string;
  name?: string;
  domain?: string;
  picture?: string;
  //   // email?: string;
//   // networkEndpoint?: string;
//   // networkType?: string;
//   // source?: string;
//   // kycApproved?: boolean;
//   // token?: string;
};

type UserContextType = {
  userInfo: UserInfoType;
  xumm: typeof xumm;
  avatar?: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUserInfo] = useState({});
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const profile = xumm.user
      const user = {
        account: await profile.account,
        name: await profile.name,
        domain: await profile.domain,
        picture: await profile.picture,
        // email: await profile.email,
        // networkEndpoint: await profile.networkEndpoint,
        // networkType: await profile.networkType,
        // source: await profile.source,
        // kycApproved: await profile.kycApproved,
        // token: await profile.token
      };
      setUserInfo(user);

      if (user.account) {
        const response = await fetch("/api/info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ account: user.account })
        });

        const data = await response.json();
        const avatar = data.account_data.urlgravatar?.replace("http", "https");

        setAvatar(`${avatar}?s=300`)
      }
    };
    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, xumm, avatar }}>
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
