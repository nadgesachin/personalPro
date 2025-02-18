import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTP = async (phone: string): Promise<string> => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  phone = "+91" + phone;
  let response;
  if (process.env.NODE_ENV != "development") {
     response = await client.messages.create({
      body: `Your Speak Up verification code is: ${otp}`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
  }
  console.log("response: ", response);
  return otp;
};
