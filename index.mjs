
import path from "path";
import process from "process";
import fs from "fs";
import pg from "pg";
const { Pool } = pg;
import { keyData } from "./secretkey.mjs"
import { SNSClient, CreatePlatformEndpointCommand,PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: "ap-south-1" });

const PLATFORM_APPLICATION_ARN = {
  "android": "arn:aws:sns:ap-south-1:29108512345:app/GCM/notification_app",
};

async function registerDevice(userId, deviceToken,platform) {
 try{
  console.log("registerDevice : ",userId, deviceToken,platform)
  if (!PLATFORM_APPLICATION_ARN[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  const params = {
    PlatformApplicationArn:PLATFORM_APPLICATION_ARN[platform],
    Token: deviceToken
  };
  const response = await snsClient.send(new CreatePlatformEndpointCommand(params));
  const endpointArn = response.EndpointArn;
  console.log("result : ",endpointArn)
  return endpointArn;
 }catch(err){
  console.log("Error in registerplotform : ",err)
 }
}

// Send push notification to a list of endpoint ARNs
async function sendPushNotificationToEndpoints(endpointArns, courseName) {
  const message = {
    default: `${courseName} has been published to you.`,
    APNS: JSON.stringify({
      aps: {
        alert: `${courseName} has been published to you.`,
        sound: "default"
      }
    }),
    GCM: JSON.stringify({
      notification: {
        title: "New Course Published",
        body: `${courseName} has been published to you.`
      },
      data: {
        courseName: courseName
      }
    })
  };
  const params = {
    TargetArn: endpointArns,
    Message: JSON.stringify(message),
    MessageStructure: "json",
  };
  try {
    await snsClient.send(new PublishCommand(params));
    console.log(`Successfully sent notification to ${endpointArn}`);
  } catch (error) {
    console.error(`Failed to send notification to ${endpointArn}`, error);
  }

}

export const handler = async (event) => {
  try{
    let dc = 'cyqMqadoQ6uc1Kj0jELBjg:APA91bHNxzybGHvdC6Ke255RJn_r2rshgxdscigJMIWE2j-gtVyfikWFVWgJ6hBn1fL4VrH8HvO91h024nmLKC6AUprL1XLJdlkyG1NR4NEUyduP1FN4RvKI'
  let endpointArns = await registerDevice('Akrosh23',dc,'android');
  let sent = await sendPushNotificationToEndpoints(endpointArns,"DEMO")
  }catch(err){
    return err
  }
};


