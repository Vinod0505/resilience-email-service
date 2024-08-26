export class MockProviderA {
    async sendEmail(email) {
      console.log('Provider A: Sending email', email);
      // Simulate a failure or success
      if (Math.random() > 0.5) {
        throw new Error('Provider A failed');
      }
    }
  }
  