const nodemailer = require ('nodemailer');
const inLineCss = require('nodemailer-juice')
require('dotenv').config();

module.exports = async function autoEmailer(email, subject, text, content) {
    
let testAccount = await nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
    //name: 'ethereal.email',
    //host: 'smtp.ethereal.email',
    //port: 587,
    //secure: false,
    service: 'gmail',
    auth:{
        user: 'volliview@gmail.com', //testAccount.user,
        pass: NODEMAILER_PASSWORD//testAccount.pass,
    }
})

transporter.use('compile', inLineCss())


    let Info = await transporter.sendMail({

        from: 'Edudigitals',
        to: email,
        subject: subject,
        text: text,
        html: content
    
    })

    

    console.log('message sent: ' + Info.messageId)
    console.log('message url:' + nodemailer.getTestMessageUrl(Info))

}


