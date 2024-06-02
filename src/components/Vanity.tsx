"use client"

import { useState } from "react";
import { Wallet } from "xrpl";

type VanityList = {
  address?: string;
  secret?: string;
};

export const Vanity = () => {
  const [vanity, setVanity] = useState<VanityList[]>([]);
  const [showSecrets, setShowSecrets] = useState<boolean[]>([false]);
  const [loading, setLoading] = useState<boolean>();

  const vanitySearch = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    try {
      const keyword: string[] = event.currentTarget.keyword.value.split(/[\s,]+/).map((k: string) => k.trim());
      const matchedAddresses = []; //レスポンスの配列
      const maxMatches = 1; //検索する最大数
      const re = "^(r)(" + keyword.join("|") + ")(.+)$"; // キーワードの配列を使って一つの正規表現を作成
      const regexp = new RegExp(re, "i");

      for (let i = 0; matchedAddresses.length < maxMatches; i++) {
        const account = Wallet.generate();
        const test = regexp.exec(account.address);

        if (test) {
          matchedAddresses.push({ address: account.address, secret: account.seed });
        }
      }
      // 最大数に達したらループを止めレスポンスを返す
      if (matchedAddresses.length > 0) {
        setVanity(matchedAddresses)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value.replace(/[^A-Za-z1-9,\s]|O|I|l/g, '');
    event.target.value = value;
  }
  const toggleSecret = (index: number) => {
    const newShowSecrets = [...showSecrets];
    newShowSecrets[index] = !newShowSecrets[index];
    setShowSecrets(newShowSecrets);
  }

  return (
    <div className="stat">

      <label className="stat-title text-accent">
        Vanity Address
      </label>

      <form onSubmit={vanitySearch} className="my-3 join join-vertical">
        <input
          type="text"
          name="keyword"
          id="keyword"
          placeholder="word1, word2 word3"
          className="input input-bordered w-full join-item"
          onChange={handleInputChange}
        />
        <button className="btn btn-primary join-item">Search</button>
      </form>

      {loading &&
        <div className="stat-value">
          <span className="loading loading-infinity loading-lg"></span>
          <span className="loading loading-infinity loading-lg"></span>
          <span className="loading loading-infinity loading-lg"></span>
        </div>
      }

      {vanity && (
        <>
          {Array.isArray(vanity) && vanity.map((vanityList, index) => (
            <dl className="stat-title truncate" key={index}>
              <dt>Address:</dt>
              <dd className="stat-desc text-success">{vanityList.address} </dd>
              <dt>Secret: </dt>
              <dd className="stat-desc text-success">{showSecrets[index] ? vanityList.secret : '***************'} </dd>
              <label className="label cursor-pointer">
                <span className="label-text mx-auto">show</span>
                <input
                  type="checkbox"
                  onChange={() => toggleSecret(index)}
                  checked={showSecrets[index] || false}
                  className="checkbox"
                />
              </label>
              <br />
            </dl>
          ))}
        </>
      )}

    </div>
  )
}
