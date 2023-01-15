import { Context, Validator } from 'hono'
import { IUsers } from '../../models/users';
import { getApplicationSettings } from '../../utils/application';
import { sendEmail } from '../../utils/email';
import { updateSession } from '../../utils/session';
import { generateEmailVerificationCode, generateUniqueId } from '../../utils/string';

interface ISendVerificationEmailParams {
    email: string;
    emailVerificationMethod: string;
    emailTemplateBody: string;
    emailTemplateSubject: string;
    senderEmail: string;
    emailVerificationCode: string;
    sessionId: string;
}

const sendVerificationEmail = async (
    c: Context,
    params: ISendVerificationEmailParams
) => {
    const { email, emailVerificationMethod, emailTemplateBody, emailTemplateSubject, senderEmail, emailVerificationCode, sessionId } = params;
    const code = emailVerificationMethod === 'link' ? `${c.env.VERIFY_EMAIL_ENDPOINT}/${c.env.API_VERSION}/confirm/email?code=${emailVerificationCode}&session_id=${sessionId}` : emailVerificationCode;
    const body = emailTemplateBody.replace("{{code}}", code);
    await sendEmail(c, email, emailTemplateSubject, body, senderEmail);
}

const emailValidationController = async (c: Context) => {
    try {
        const applicationId = c.get('applicationId') as string;
        const user: IUsers = c.get('user');
        const sessionId = c.get('sessionId') as string;
        const { email } = user;

        const {
            email_verification_enabled: emailVerificationEnabled,
            email_verification_method: emailVerificationMethod,
            email_template_body: emailTemplateBody,
            email_template_subject: emailTemplateSubject,
            sender_email: senderEmail
        } = await getApplicationSettings(
            c,
            applicationId,
            [
                'email_verification_enabled', 'expires_in', 'email_verification_method',
                'email_template_body', 'email_template_subject', 'sender_email'
            ]
        )
        if (!emailVerificationEnabled) {
            return c.text('Error during registration', 500)
        }
        const emailVerificationCode = generateEmailVerificationCode();

        await Promise.all([
            sendVerificationEmail(c, {
                email, emailVerificationMethod, emailTemplateBody, emailTemplateSubject, senderEmail, emailVerificationCode, sessionId
            }),
            updateSession(c, sessionId, { email_verify_code: emailVerificationCode, expiration_timestamp: Math.floor(Date.now() / 1000) + 180 })
        ])

        return c.json({
            email
        })
    } catch (err) {
        console.log(err)
        return c.text('Error during registration', 500)
    }
}

export default emailValidationController;
