const { MAGIC_LINK_CLIENT_ID, GOOGLE_CLIENT_ID } = process.env;

module.exports.handler = async (event) => {
  if (event.callerContext.clientId === MAGIC_LINK_CLIENT_ID) {
    const expectedAnswer =
      event.request.privateChallengeParameters.secretLoginCode;
    if (event.request.challengeAnswer === expectedAnswer) {
      event.response.answerCorrect = true;
    } else {
      event.response.answerCorrect = false;
    }
    return event;
  }

  if (event.callerContext.clientId === GOOGLE_CLIENT_ID) {
    const token = event.request.challengeAnswer;
    console.log("token", token);
    // TODO: Validate the token with google.
    event.response.answerCorrect = true;
    return event;
  }
};
