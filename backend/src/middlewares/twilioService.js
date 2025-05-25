import {config} from "../config/config.js";
import twilio from 'twilio'

const client = twilio(config.twilioSid, config.twilioAuthToken);

const sendSMS = async (number, message) => {
    try {
        console.log("im under thw water") // Corrected typo: "the water"
        // Validate number and message here if necessary
        if (!number || !message) {
            console.error("SMS number or message is missing.");
            // Decide on error handling: throw error, return specific status, etc.
            return null; // Or throw new Error("SMS number or message is missing.");
        }
        const res = await client.messages.create({
            body: message,
            from: config.twilioNumber,
            to: number // Ensure 'number' is in E.164 format for Twilio
        });
        console.log("working twilio",res.sid);
        return res;
    } catch (error) {
        console.log("Error sending SMS via Twilio:", error); // Enhanced logging
        // Rethrow or handle error as appropriate for your application
        // For example, throw error; so the caller can handle it.
        throw error; // Or return null / specific error object
    }
};

export default sendSMS;