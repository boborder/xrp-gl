"use server"

import { Wallet } from "xrpl";

export const runtime = "edge";

export const vanitySearch = async (formData: FormData) => {
  try {
    const data: any = formData.get("keyword")
    const keyword: string[] = data.split(/[\s,]+/).map((k: string) => k.trim());
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
      return matchedAddresses
    }
  } catch (error) {
    console.log(error)
  }
}
