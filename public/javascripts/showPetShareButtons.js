// Function to share the page on Facebook
function shareOnFacebook() {
  const shareUrl = encodeURIComponent(window.location.href);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    "_blank"
  );
}

// Function to share the page on Twitter
function shareOnTwitter() {
  const shareUrl = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?url=${shareUrl}`, "_blank");
}

// Function to share the page on LinkedIn
function shareOnLinkedIn() {
  const shareUrl = encodeURIComponent(window.location.href);
  window.open(
    `https://www.linkedin.com/shareArticle?url=${shareUrl}`,
    "_blank"
  );
}

// Function to share the page on Facebook Messenger
function shareOnMessenger() {
  const shareUrl = encodeURIComponent(window.location.href);
  window.open(`fb-messenger://share/?link=${shareUrl}`, "_blank");
}

// Function to share the page on WhatsApp
function shareOnWhatsApp() {
  // Generate the text to share
  const shareText = encodeURIComponent(
    "Check out this lost pet information: " + window.location.href
  );

  // Open WhatsApp with the shared text
  window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
}
