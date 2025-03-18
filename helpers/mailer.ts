import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import User from '@/lib/models/user.model';
import { useToast } from "@/components/ui/use-toast"

export const sendEmail = async({email, emailType, userId}:any) => {
    try {
        // create a hased token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, 
                {verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000})
        } else if (emailType === "RESET"){
            await User.findByIdAndUpdate(userId, 
                {forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000})
        }

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "16b51dc2e5ef04",
              pass: "0544113220a38e"
              // pass this to env
            }
          });

        const mailOptions = {
            from: 'coppergroupstudio@gmail.com',
            to: email,
            subject: emailType === "VERIFY" ? "Лист підтвердження" : "Зміна пароля",
            text:emailType === "VERIFY" ?
`Підтвердження вашої електронної пошти на "Santehvan"

Доброго дня!
Дякуємо, що зареєструвались на нашому інтернет-магазині "Santehvan". 
Для завершення процесу реєстрації, будь ласка, підтвердьте свою електронну пошту, натиснувши на кнопку нижче:`
:
`Зміна пароля

Доброго дня!
Ми отримали запит на зміну пароля для вашого акаунту на нашому сайті. Якщо ви не робили цей запит, будь ласка, проігноруйте цей лист або зв'яжіться з нашою службою підтримки.
Щоб змінити ваш пароль, натисніть на посилання нижче:

`

,
            html: `<a style="color:#fff; background-color:#000; padding:5px 15px; border-radius:10px" href="${process.env.DOMAIN}/${emailType === "VERIFY" ? `verifyemail?token=${hashedToken}` : `newPass?token=${hashedToken}`}";>Підтвердити</a>`
        }
//
        const mailresponse = await transport.sendMail
        (mailOptions);
        return mailresponse;

    } catch (error:any) {
        throw new Error(error.message);
    }
}