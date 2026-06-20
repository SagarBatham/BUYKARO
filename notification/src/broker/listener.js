const {sendEmail} = require("../email");
const{subscribeToQueue}=require("./broker")

module.exports=function(){
    subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED",async(data)=>{
        console.log(data.email);
        
       const emailHTMLTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background:#4f46e5;padding:30px;">
                            <h1 style="color:#ffffff;margin:0;">
                                Welcome to BuyKaro 🚀
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:40px 30px;">
                            <h2 style="color:#333;margin-top:0;">
                                Hi ${data.fullName.firstName} ${data.fullName.lastName || ""}
                            </h2>

                            <p style="font-size:16px;line-height:1.8;color:#555;">
                                Thank you for registering with <strong>BuyKaro</strong>.
                                We're thrilled to have you join our community.
                            </p>

                            <p style="font-size:16px;line-height:1.8;color:#555;">
                                You can now explore products, manage your account,
                                and enjoy a seamless shopping experience.
                            </p>

                            <div style="text-align:center;margin:35px 0;">
                                <a href="https://yourwebsite.com"
                                   style="background:#4f46e5;color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">
                                    Get Started
                                </a>
                            </div>

                            <p style="font-size:15px;color:#666;">
                                If you have any questions, feel free to reply to this email.
                                We're always happy to help.
                            </p>

                            <p style="font-size:16px;color:#333;margin-top:30px;">
                                Best Regards,<br>
                                <strong>BuyKaro Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background:#f8f9fa;padding:20px;color:#888;font-size:13px;">
                            © ${new Date().getFullYear()} BuyKaro. All rights reserved.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
`;

        await sendEmail(data.email,"Welcome to Our Service","Thank you for registering with us!",emailHTMLTemplate)
    }
)
    subscribeToQueue(
        "PAYMENT_NOTIFICATION.PAYMENT_COMPLETED",
        async (data) => {
            try {
                const html = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,sans-serif;">
                    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">

                        <div style="background:#16a34a;padding:25px;text-align:center;">
                            <h1 style="color:white;margin:0;">
                                Payment Successful ✅
                            </h1>
                        </div>

                        <div style="padding:30px;">
                            <h2>Hello ${data.userName || "Customer"},</h2>

                            <p>
                                Thank you for your purchase. Your payment has been
                                successfully verified and your order is now being processed.
                            </p>

                            <table style="width:100%;margin-top:20px;border-collapse:collapse;">
                                <tr>
                                    <td style="padding:10px;font-weight:bold;">Order ID</td>
                                    <td style="padding:10px;">${data.orderId}</td>
                                </tr>

                                <tr style="background:#f8fafc;">
                                    <td style="padding:10px;font-weight:bold;">Payment ID</td>
                                    <td style="padding:10px;">${data.paymentId}</td>
                                </tr>

                                <tr>
                                    <td style="padding:10px;font-weight:bold;">Amount</td>
                                    <td style="padding:10px;">
                                        ₹${data.amount} ${data.currency}
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top:25px;">
                                We appreciate your trust in BuyKaro.
                            </p>

                            <p>
                                Regards,<br>
                                <strong>BuyKaro Team</strong>
                            </p>
                        </div>

                        <div style="background:#f8fafc;padding:15px;text-align:center;color:#666;">
                            © ${new Date().getFullYear()} BuyKaro. All Rights Reserved.
                        </div>
                    </div>
                </body>
                </html>
                `;

                await sendEmail(
                    data.email,
                    "✅ Payment Successful - BuyKaro",
                    "Payment Successful",
                    html
                );

                console.log("Payment success email sent");
            } catch (err) {
                console.error(err);
            }
        }
    );

    // PAYMENT FAILED
    subscribeToQueue(
        "PAYMENT_NOTIFICATION.PAYMENT_FAILED",
        async (data) => {
            try {
                const html = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,sans-serif;">
                    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">

                        <div style="background:#dc2626;padding:25px;text-align:center;">
                            <h1 style="color:white;margin:0;">
                                Payment Failed ❌
                            </h1>
                        </div>

                        <div style="padding:30px;">
                            <h2>Hello Customer,</h2>

                            <p>
                                Unfortunately, we were unable to verify your payment.
                            </p>

                            <table style="width:100%;margin-top:20px;border-collapse:collapse;">
                                <tr>
                                    <td style="padding:10px;font-weight:bold;">Order ID</td>
                                    <td style="padding:10px;">${data.orderId}</td>
                                </tr>

                                <tr style="background:#f8fafc;">
                                    <td style="padding:10px;font-weight:bold;">Payment ID</td>
                                    <td style="padding:10px;">
                                        ${data.paymentId || "N/A"}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:10px;font-weight:bold;">Reason</td>
                                    <td style="padding:10px;">
                                        ${data.reason || "Payment Verification Failed"}
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top:25px;">
                                Please try again. If money was deducted, it will usually
                                be refunded automatically by your bank within a few days.
                            </p>

                            <p>
                                Regards,<br>
                                <strong>BuyKaro Team</strong>
                            </p>
                        </div>

                        <div style="background:#f8fafc;padding:15px;text-align:center;color:#666;">
                            © ${new Date().getFullYear()} BuyKaro. All Rights Reserved.
                        </div>
                    </div>
                </body>
                </html>
                `;

                await sendEmail(
                    data.email,
                    "❌ Payment Failed - BuyKaro",
                    "Payment Failed",
                    html
                );

                console.log("Payment failed email sent");
            } catch (err) {
                console.error(err);
            }
        }
    );
}