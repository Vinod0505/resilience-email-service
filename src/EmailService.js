import MockProviderA from './providers/MockProviderA'
import MockProviderB from './providers/MockProviderB'

class EmailService {
  constructor(providers) {
    this.providers = providers;
    this.sentEmailIds = new Set();  // Step 1: Storage for sent email IDs
    this.attempts = new Map(); // Track attempts per email ID
    this.rateLimit = 5; // Maximum number of attempts allowed per minute
    this.lastAttemptTime = new Map(); // Track last attempt time per email ID
    this.status = new Map(); // Track status of each email
  }

  async retrySend(email, providerIndex, retries) {
    if (retries > 5) {
      console.error('Max retries reached for email', email);
      this.status.set(email.id, 'failed');
      return;
    }

    try {
      await this.providers[providerIndex].sendEmail(email);
      console.log('Email sent successfully:', email);
      this.sentEmailIds.add(email.id);
      this.status.set(email.id, 'sent');
    } catch (error) {
      console.error('Failed to send email with provider', providerIndex, error);
      const delay = Math.pow(2, retries) * 1000;
      setTimeout(() => this.retrySend(email, providerIndex, retries + 1), delay);
    }
  }

  async sendWithFallback(email) {
    for (let i = 0; i < this.providers.length; i++) {
      try {
        await this.retrySend(email, i, 0);
        return;
      } catch {
        // Switch to the next provider
      }
    }
    console.error('All providers failed to send email:', email);
    this.status.set(email.id, 'failed');
  }

  async sendEmail(email) {
    // Check if email has already been sent
    if (this.sentEmailIds.has(email.id)) {
      console.log('Email already sent, skipping:', email.id);
      this.status.set(email.id, 'skipped');
      return;
    }

    const now = Date.now();
    const lastTime = this.lastAttemptTime.get(email.id) || 0;
    const timeSinceLastAttempt = now - lastTime;

    // Check if rate limit is exceeded
    if (timeSinceLastAttempt < 60000) { // Within 1 minute
      const attempts = this.attempts.get(email.id) || 0;
      if (attempts >= this.rateLimit) {
        console.error('Rate limit exceeded for email', email);
        this.status.set(email.id, 'rate-limited');
        return;
      }
    } else {
      // Reset attempts if more than a minute has passed
      this.attempts.set(email.id, 0);
    }

    // Track the current attempt
    this.attempts.set(email.id, (this.attempts.get(email.id) || 0) + 1);
    this.lastAttemptTime.set(email.id, now);

    await this.sendWithFallback(email);
  }
  getStatus(emailId){
    return this.status.get(emailId);
  }
  getAllStatuses() {
    return this.status;
  }
}
export { EmailService, MockProviderA, MockProviderB };