import jwt from "jsonwebtoken";

const cookieOptions = {
  maxAge:
    Number(process.env.JWT_COOKIE_EXPIRES_IN ?? "7") * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV.trim() === "production" ? true : false,
  sameSite: process.env.NODE_ENV.trim() === "production" ? "none" : "lax",
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return res
    .status(code)
    .cookie("StealthyNoteToken", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
    });
};

export default sendToken;
