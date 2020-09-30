const { MAGIC_LINK_CLIENT_ID, GOOGLE_CLIENT_ID } = process.env;

module.exports.handler = async (event) => {
  if (event.callerContext.clientId === MAGIC_LINK_CLIENT_ID) {
    let secretLoginCode;
    if (!event.request.session || !event.request.session.length) {
      secretLoginCode = "112233";
      // TODO: send email
    } else {
      // There's an existing session. Don't generate new digits but
      // re-use the code from the current session. This allows the user to
      // make a mistake when keying in the code and to then retry, rather
      // the needing to e-mail the user an all new code again.
      const previousChallenge = event.request.session.slice(-1)[0];
      secretLoginCode = previousChallenge.challengeMetadata.match(
        /CODE-(\d*)/
      )[1];
    }

    // This is sent back to the client app
    event.response.publicChallengeParameters = {
      email: event.request.userAttributes.email,
    };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = { secretLoginCode };

    // Add the secret login code to the session so it is available
    // in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `CODE-${secretLoginCode}`;

    return event;
  } else if (event.callerContext.clientId === GOOGLE_CLIENT_ID) {
    console.log("google challenge - all good");
    event.response.publicChallengeParameters = {
      email: event.request.userAttributes.email,
    };
    event.response.privateChallengeParameters = { google: "true" };
    event.response.challengeMetadata = "google";
    return event;
  }
};
