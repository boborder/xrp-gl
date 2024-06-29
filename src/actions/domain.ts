"use server"

export const runtime = "edge";

export const checkToml = async (formData: FormData) => {
  try {
    const domain = formData.get("domain");

    const response = await fetch(`${process.env.API}/toml`, {
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
    const response = await fetch(`${process.env.API}/info`, {
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
