// /functions/contact.ts
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const formData = await request.formData();

  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const message = formData.get("message")?.toString();
  const token = formData.get("cf-turnstile-response")?.toString();

  if (!name || !email || !message || !token) {
    return new Response("Missing required fields", { status: 400 });
  }

  // ✅ Verify Turnstile
  const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: env["turnstile-key"],
      response: token,
    }),
  }).then(res => res.json());

  if (!turnstileRes.success) {
    return new Response("Turnstile verification failed", { status: 403 });
  }

  // ✅ Send email via Resend
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env["resend-token"]}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Contact Form <info@vaughncybergroup.com>", // Must match verified domain
      to: ["info@vaughncybergroup.com"],
      subject: `New Contact from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    }),
  });

  //debugging  
  console.log("Received POST to /contact");

    if (!name || !email || !message || !token) {
    console.log("Missing fields", { name, email, message, token });
    return new Response("Missing required fields", { status: 400 });
    }

//
 // if (!emailRes.ok) {
   // return new Response("Failed to send email", { status: 500 });
    if (!emailRes.ok) {
  console.log("❌ Resend Error Response:", emailBody);
  return new Response("Failed to send email", { status: 500 });
}

  

  // ✅ Redirect after success
  return Response.redirect("https://vaughncybergroup.com/thank-you", 302);
};
