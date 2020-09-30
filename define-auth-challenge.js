const { MAGIC_LINK_CLIENT_ID, GOOGLE_CLIENT_ID } = process.env;

module.exports.handler = async (event) => {
  if (event.callerContext.clientId === MAGIC_LINK_CLIENT_ID) {
    if (
      event.request.session &&
      event.request.session.length >= 3 &&
      event.request.session.slice(-1)[0].challengeResult === false
    ) {
      // The user provided a wrong answer 3 times; fail auth
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    } else if (
      event.request.session &&
      event.request.session.length &&
      event.request.session.slice(-1)[0].challengeResult === true
    ) {
      // The user provided the right answer; succeed auth
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else {
      // The user did not provide a correct answer yet; present challenge
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = "CUSTOM_CHALLENGE";
    }
  } else if (event.callerContext.clientId === GOOGLE_CLIENT_ID) {
    if (
      event.request.session &&
      event.request.session.length &&
      event.request.session.slice(-1)[0].challengeResult === true
    ) {
      console.log("google challenge - approved");
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else {
      console.log("google challenge - start");
      // The user did not provide a correct answer yet; present challenge
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = "CUSTOM_CHALLENGE";
    }
  }

  return event;
};
