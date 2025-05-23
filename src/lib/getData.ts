import sdk from '@crossmarkio/sdk';
import { hash } from "./hash";
import { dig } from "./dig";
import { Xumm } from "xumm";

const apiKey = process.env.XUMMAPI;
const secret = process.env.XUMMSECRET;
if (!apiKey) {
  throw new Error("API is not set");
}
const xumm = new Xumm(apiKey, secret);
const user = xumm.user;

export const getData = async () => {
  // await sdk.sync.connect();
  // if (!sdk.sync.isConnected) {
    // console.log(sdk.sync.signIn());
  // }
  // console.log(sdk.session);

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

  if (!userData.account) {
    console.log("account is undefined")
    return;
  }

  const id = await hash(userData.account);
  const ws = `${userData.networkEndpoint || "wss://xrplcluster.com"}`;
  const getDataPromise = dig(userData.account, ws, 'info', 'obj', 'tx');

  const getStorePromise = xumm.userstore?.get(id);
  const getAccountPromise = fetch(`/api/get?account=${userData.account}`, { method: "GET" });

  const [getStore, getAccount, getData] = await Promise.all([
    getStorePromise,
    getAccountPromise,
    getDataPromise
  ]);

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

  const gravatar = getData?.info?.result?.account_data?.EmailHash ? `https://gravatar.com/avatar/${getData?.info?.result?.account_data?.EmailHash.toLowerCase()}?s=256` : undefined;

  return {
    userData,
    store: getStore,
    account: {
      info: getData?.info,
      tx: getData?.tx,
      obj: getData?.obj
    },
    gravatar: gravatar
  };
};
