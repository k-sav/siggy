import { program } from "commander";

export default async function writeResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    // console.log(text);
    try {
      const errObj =JSON.parse(text);
      if (errObj.error) {
        console.error(errObj.error)
      } else if (errObj.message) {
        console.error(errObj.message);
        if (errObj.errors) {
          console.error(errObj.errors);
        }
      } else {
        console.error(text);
      }
    } catch (e) {
      console.error(text);
    }
    return -1;
  }

  const responseObj = await response.json();
  if (responseObj.data) {
    console.log(JSON.stringify(responseObj.data, null, 2));
  } else if (responseObj.message) {
    console.log(responseObj.message);
  } else {
    console.log(JSON.stringify(responseObj, null, 2));
  }
  return 0;
}