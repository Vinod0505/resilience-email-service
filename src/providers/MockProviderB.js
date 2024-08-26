export class MockProviderB {
    async sendEmail(email) {
      console.log('Provider B: Sending email', email);
      // Simulate a failure or success
      if (Math.random() > 0.5) {
        throw new Error('Provider B failed');
      }
    }
  }
  