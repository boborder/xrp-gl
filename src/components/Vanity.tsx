"use client"

import { useState } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { vanitySearch } from "@/actions/vanity";
import { Wallet } from "xrpl";

type VanityList = {
  address?: string;
  secret?: string;
};

export const Vanity = () => {
  const [vanity, setVanity] = useState<VanityList[]>([]);
  const [showSecrets, setShowSecrets] = useState<boolean[]>([false]);
  const [loading, setLoading] = useState<boolean>(false);

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

      <label className="text-accent text-xl">
        Vanity Address
      </label>

      <form
          onSubmit={vanitySearch}
        // action={async (formData) => {
        //   setLoading(true)
        //   const account = await vanitySearch(formData)
        //   setVanity(account as any)
        //   setLoading(false)
        // }}
        className="my-3 join join-vertical">
        <input
          type="text"
          name="keyword"
          id="keyword"
          placeholder="word1, word2 word3"
          className="input input-bordered w-full join-item"
          onChange={handleInputChange}
        />
        <button className="btn btn-primary join-item text-xl">Search</button>
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
            <dl className="truncate" key={index}>
              <dt>Address:</dt>
              <dd className="text-success truncate">{vanityList.address} </dd>
              <dt>Secret: </dt>
              <dd className="text-success truncate">{showSecrets[index] ? vanityList.secret : '***************'} </dd>
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
