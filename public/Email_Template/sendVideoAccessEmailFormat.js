const config = require("../../src/config/config");

const sendVideoAccessEmailFormat = ({
  accessUrl,
  expiryDate,
  packageName,
  payerName,
}) => {
  const greeting = payerName ? `Dear ${payerName},` : "Dear Friend,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Video Access</title>

<style>
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }

  .container {
    text-align: left;
    max-width: 650px;
    width: 100%;
    padding: 24px;
    background-color: #ffffff;
    border-radius: 6px;
  }

  h1, h3 {
    margin: 12px 0;
  }

  p {
    margin: 12px 0;
    font-size: 14px;
    line-height: 1.6;
  }

  a {
    color: #1a73e8;
    word-break: break-all;
  }

  .logo {
    margin-bottom: 20px;
  }

  .footer {
    margin-top: 30px;
    font-size: 13px;
  }

  @media (max-width: 600px) {
    body {
      align-items: flex-start;
    }

    .container {
      border-radius: 0;
    }
  }
</style>
</head>

<body>
  <div class="container">

  

    <h3>${greeting}</h3>

    <p>
      <strong>Thank you for purchasing/streaming the <em>Life Worth Living</em> film.</strong>
    </p>

    <p>
      Life Worth Living film was produced by the
      <strong>Euthanasia Prevention Coalition</strong> and
      <strong>“XS In The Sky Films”</strong> in response to Canada’s euthanasia law.
    </p>

    <p>This is a powerful film.</p>

    <p>
      We are currently working on a second film in response to the US assisted suicide laws.
    </p>

    <p>
      You can watch the film using your secure link below:
    </p>

    <p>
      👉 <a href="${accessUrl}" target="_blank">Watch Life Worth Living</a>
    </p>

    <p style="color:#b00020;">
      ⏳ <strong>This link expires on:</strong><br/>
      ${new Date(expiryDate).toDateString()}
    </p>

    <p>
      We encourage you to become a friend/member of the
      Euthanasia Prevention Coalition at
      <a href="https://www.epcc.ca" target="_blank">www.epcc.ca</a>
    </p>

    <div class="footer">
      <p>
        <strong>Alex Schadenberg</strong><br/>
        Executive Director – Euthanasia Prevention Coalition<br/>
        1-877-439-3348<br/>
        <a href="mailto:alex@epcc.ca">alex@epcc.ca</a>
      </p>
        
      <img
        src="https://api.lifeworthlivingfilm.com:3000/images/images-1770210499592.jpg"
        alt="Euthanasia Prevention Coalition"
        style="max-width:260px;"
      />
 
    </div>

  </div>
</body>
</html>
`;
};

module.exports = sendVideoAccessEmailFormat;
