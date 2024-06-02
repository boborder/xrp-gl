"use client";
import { useState, useRef } from "react";
import { Imag } from "./Imag";

export const Pin = () => {
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputFile = useRef<HTMLInputElement>(null);
  const gateway = "https://ipfs.io/ipfs/"

  const uploadFile = async (fileToUpload: any) => {
    try {
      setUploading(true);
      const data = new FormData();
      data.set("file", fileToUpload);

      const res = await fetch("/api/ipfs", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      setCid(resData.IpfsHash);
      setFile(`${gateway}${resData.IpfsHash}`)
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: any) => {
    setFile(e.target.files[0]);
    uploadFile(e.target.files[0]);
  };

  return (
    <>

      <form className="m-4 w-full join join-vertical">
        <input
          type="file"
          id="file"
          ref={inputFile}
          onChange={handleChange}
          className="pt-2 input input-bordered join-item w-[90%]"/>
        <button
          disabled={uploading}
          onClick={() => inputFile.current!.click()}
          className="btn btn-primary join-item w-[90%]">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {file && (
        <Imag
          src={file}
          alt="Image from IPFS"
          width={300}
          height={300}
          className="mx-auto w-[90%] mt-4"
        />
      )}

      {cid && (
        <div className="text-success text-xs overflow-scroll my-3">
          <div>
            CID: {cid}
          </div>
          <a
            href={`${gateway}${cid}`}
            className="block underline hover:text-primary [transition:0.3s]"
            target="_blank"
            rel="noopener noreferrer"
            >
            {`${gateway}${cid}`}
          </a>
        </div>
      )}

    </>
  );
}
