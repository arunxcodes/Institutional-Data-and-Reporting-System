const Official = require("../models/Official");

const findValidOfficial = async (email) => {
  if (!email) {
    return {
      success: false,
      statusCode: 400,
      message: "Official email is required",
    };
  }

  const officialEmail = email.toLowerCase().trim();

  const official = await Official.findOne({
    email: officialEmail,
  });

  if (!official) {
    return {
      success: false,
      statusCode: 404,
      message: "Official email not found",
    };
  }

  if (official.accountStatus !== "ACTIVE") {
    return {
      success: false,
      statusCode: 403,
      message: "This official is not active",
    };
  }

  if (official.registrationStatus === "REGISTERED") {
    return {
      success: false,
      statusCode: 409,
      message: "This official is already registered",
    };
  }

  return {
    success: true,
    official,
  };
};

module.exports = {
  findValidOfficial,
};
