import FormData from "form-data";
import Mailgun, { MessageAttachment } from "mailgun.js";

const variables = {
  apiKey: "e49376b2ee240cb7ecdf790a33b13757-2b91eb47-6caf46b9",
  from: "Grace Cars Ltd <mailgun@sandboxffe215520c3e4b368d7f30122bc8e694.mailgun.org>",
};

export function sendMail(data: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: MessageAttachment;
}) {
  const mailGun = new Mailgun(FormData);

  const mg = mailGun.client({
    username: "api",
    key: variables.apiKey,
  });

  mg.messages
    .create("sandboxffe215520c3e4b368d7f30122bc8e694.mailgun.org", {
      from: variables.from,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
      attachment: data.attachments,
    })
    .then((data) => {
      console.log("success", data);
    })
    .catch((err) => {
      console.log("error", err);
    });
}
