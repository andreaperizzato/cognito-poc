const AWS = require("aws-sdk");

const POOL_CLIENT_ID = process.env.POOL_CLIENT_ID;

module.exports.handler = async (event) => {
  const cip = new AWS.CognitoIdentityServiceProvider();
  const body = JSON.parse(event.body);

  const res = await cip
    .respondToAuthChallenge({
      ChallengeName: "CUSTOM_CHALLENGE",
      ClientId: POOL_CLIENT_ID,
      ChallengeResponses: {
        USERNAME: body.email,
        ANSWER: body.code,
      },
      Session: body.session,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      idToken: res.AuthenticationResult.IdToken,
      accessToken: res.AuthenticationResult.AccessToken,
      refereshToken: res.AuthenticationResult.RefreshToken,
    }),
  };
};
