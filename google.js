const AWS = require("aws-sdk");

const randomPass = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const POOL_CLIENT_ID = process.env.POOL_CLIENT_ID;

function getPayload(token) {
  const base64Payload = token.split(".")[1];
  const payload = Buffer.from(base64Payload, "base64");
  return JSON.parse(payload.toString());
}

module.exports.handler = async (event) => {
  const cip = new AWS.CognitoIdentityServiceProvider();
  const body = JSON.parse(event.body);

  const payload = getPayload(body.googleToken);
  // TODO: validate token.

  console.log("payload", payload);

  try {
    // create user if doesnt exist.
    await cip
      .signUp({
        Username: payload.email,
        Password: randomPass() + "A1@",
        ClientId: POOL_CLIENT_ID,
      })
      .promise();
  } catch (e) {
    if (e.name !== "UsernameExistsException") {
      throw e;
    }
  }

  const res = await cip
    .initiateAuth({
      AuthFlow: "CUSTOM_AUTH",
      ClientId: POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: payload.email,
      },
    })
    .promise();

  const res2 = await cip
    .respondToAuthChallenge({
      ChallengeName: "CUSTOM_CHALLENGE",
      ClientId: POOL_CLIENT_ID,
      ChallengeResponses: {
        USERNAME: payload.email,
        ANSWER: body.googleToken,
      },
      Session: res.Session,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      idToken: res2.AuthenticationResult.IdToken,
      accessToken: res2.AuthenticationResult.AccessToken,
      refereshToken: res2.AuthenticationResult.RefreshToken,
    }),
  };
};
