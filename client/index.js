const axios = require("axios").default;
const jsonwebtoken = require("jsonwebtoken");

const BASEURL = "https://p5fx10ftqa.execute-api.eu-west-1.amazonaws.com/dev";

async function magicLink(email) {
  let res = await axios.post(`${BASEURL}/magiclink/start`, { email });
  const { session } = res.data;

  res = await axios.post(`${BASEURL}/magiclink/complete`, {
    email,
    code: "112233", // this is hardcoded
    session,
  });

  console.log("token:", res.data.idToken);
}

async function google(email) {
  const googleToken = jsonwebtoken.sign({ email }, "secret"); // the token is not validated

  const res = await axios.post(`${BASEURL}/google`, { googleToken });
  console.log("token:", res.data.idToken);
}

// google("andrea.perizzato@digital.well.co.uk");
// magicLink("andrea.perizzato@digital.well.co.uk");
