import DOMPurify from "dompurify";


export function getPrivacyPolicyText() {
  const rawMarkdown = `
  **Terms and Conditions of Use**
  <br/>
  <br/>
  Welcome! Before using our platform, please carefully read these Terms and Conditions. By uploading content and interacting with the bot, you agree to abide by the rules outlined below. Failure to comply may result in restricted access or legal consequences.
  <br/>
  <br/>
  #### **1. Purpose of the Platform**
  Our platform allows users to:
  - Upload images as evidence for specific tasks or purposes.
  - Interact with the bot to seek assistance, provide information, or complete tasks.
    <br/>
    <br/>
  #### **2. User Responsibilities**
  When using the platform, you agree to:
  1. Upload only accurate and relevant images that are necessary for the task.
  2. Avoid sharing false, misleading, or inappropriate content.
  3. Ensure that all images and communications comply with applicable laws and ethical standards.
  4. Treat the bot and the platform with respect, refraining from using offensive language or engaging in harmful activities.
    <br/>
  <br/>
  #### **3. Prohibited Actions**
  Users are strictly prohibited from:
  - Uploading illegal, obscene, or copyrighted material without proper authorization.
  - Sharing images or content that is offensive, harmful, or violates the rights of others.
  - Using the platform to harass, defraud, or harm any individual or entity.
      <br/>
  <br/>
  #### **4. Monitoring and Enforcement**
  To maintain a safe and respectful environment:
  - The platform may monitor uploaded images and chat interactions to ensure compliance with these Terms.
  - Any violation may lead to immediate suspension or permanent ban from the platform.
  - Legal action may be taken in cases of serious misconduct.
      <br/>
  <br/>
  #### **5. Disclaimer**
  The platform and bot are tools to assist users. While we strive to maintain accuracy and security, we are not liable for:
  - Misuse of the platform by users.
  - Actions resulting from false or inappropriate content uploaded by users.
  - Technical issues beyond our control.
      <br/>
  <br/>
  #### **6. Reporting Violations**
  If you notice any misuse or encounter inappropriate content, please report it immediately to our support team at [support email/contact information].
      <br/>
  <br/>
  #### **7. Acceptance of Terms**
  By using this platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. If you do not agree, please refrain from using the service.
  
  Thank you for ensuring a safe and productive environment for all users.
  `;

  const sanitizedMarkdown = DOMPurify.sanitize(rawMarkdown, {
    USE_PROFILES: { html: true }, 
  });

  return sanitizedMarkdown;
}