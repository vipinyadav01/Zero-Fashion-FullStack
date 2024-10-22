(function () {
  emailjs.init("pkUX04LW-xpS5P2H6");
})();

function sendEmail(event) {
  event.preventDefault();

  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value || "N/A";
  var company = document.getElementById("company").value || "N/A";
  var subject = document.getElementById("subject").value;
  var message = document.getElementById("message").value;
  var newsletter = document.getElementById("newsletter").checked;

  const templateParams = {
    from_name: `${firstName} ${lastName}`,
    from_email: email,
    phone: phone,
    company: company,
    subject: subject,
    message: message,
    newsletter: newsletter ? "Yes" : "No",
  };

  const emailTemplate = `
Hello,

You got a new message from ${templateParams.from_name}:

Name : ${templateParams.from_name}

Email Id : ${templateParams.from_email}

Phone Number : ${templateParams.phone}

Company : ${templateParams.company}

Subject : ${templateParams.subject}

Message : ${templateParams.message}

Newsletter : ${templateParams.newsletter}
`;

  emailjs.send("service_id", "template_id", templateParams).then(
    function (response) {
      console.log("SUCCESS!", response.status, response.text);
      alert("Your message has been sent successfully!");
    },
    function (error) {
      console.log("FAILED...", error);
      alert("Failed to send the message. Please try again later.");
    }
  );

  document.getElementById("contact-form").reset();
}

document.getElementById("contact-form").addEventListener("submit", sendEmail);

document.getElementById("current-year").textContent = new Date().getFullYear();
