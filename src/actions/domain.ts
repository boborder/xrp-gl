"use server"

export const runtime = "edge";

const host = "http://127.0.0.1:3000"
// const host = "https://xrp.gl"

export const checkToml = async (formData: FormData) => {
  try {
    const domain = formData.get("domain");

    const response = await fetch(`${host}/api/toml`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain: domain }),
    });

    const data = await response.json();
    return data ;
  } catch (error) {
    console.log(error);
  }
};

export const checkDomain = async (formData: FormData) => {
  try {
    const address = formData.get("address");
    const response = await fetch(`${host}/api/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account: address }),
    });

    const data: any = await response.json();
    return (data.account_data.Domain);
  } catch (error) {
    console.log(error);
  }
};
