import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Context } from 'hono';

export async function sendEmail(c: Context, to: string, subject: string, body: string, sender: string = 'auth@authc1.com') {
    const client = new SESClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId: c.env.ACCESS_KEY_ID,
            secretAccessKey: c.env.SECRET_ACCESS_KEY
        }
    });
    try {
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: body
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject,
                },
            },
            Source: sender,
        });
        await client.send(command);
        console.log("Email sent!");
    } catch (err) {
        console.log("Error sending email", err);
    }
}
