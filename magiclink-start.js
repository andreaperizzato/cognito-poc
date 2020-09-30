const AWS = require("aws-sdk");

const randomPass = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const POOL_CLIENT_ID = process.env.POOL_CLIENT_ID;

module.exports.handler = async (event) => {
  const cip = new AWS.CognitoIdentityServiceProvider();
  const body = JSON.parse(event.body);

  try {
    // create user if doesnt exist.
    await cip
      .signUp({
        Username: body.email,
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
        USERNAME: body.email,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      session: res.Session,
    }),
  };
};
