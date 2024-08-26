import { EmailService } from '../src/EmailService.js';
import { MockProviderA } from '../src/providers/MockProviderA.js';
import { MockProviderB } from '../src/providers/MockProviderB.js';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  jest.restoreAllMocks();  // Restore any mocks to their original state
});

test('should send email only once even if sendEmail is called multiple times with the same email ID', async () => {
  const providerA = new MockProviderA();
  const providerB = new MockProviderB();
  jest.spyOn(providerA, 'sendEmail').mockResolvedValue();  // Mock providerA to always succeed
  jest.spyOn(providerB, 'sendEmail').mockResolvedValue();  // Mock providerB to always succeed

  const emailService = new EmailService([providerA, providerB]);
  const email = { to: 'test@example.com', subject: 'Hello', body: 'World', id: '123' };

  // First call to sendEmail
  await emailService.sendEmail(email);

  // Second call to sendEmail with the same email object
  await emailService.sendEmail(email);

  // Third call to sendEmail with the same email object
  await emailService.sendEmail(email);

  // Verify that sendEmail was called only once on each provider
  expect(providerA.sendEmail).toHaveBeenCalledTimes(1);
  expect(providerB.sendEmail).toHaveBeenCalledTimes(0);  // Only providerA should have been used
});

test('should send email successfully', async () => {
  const emailService = new EmailService([new MockProviderA(), new MockProviderB()]);
  const email = { to: 'test@example.com', subject: 'Hello', body: 'World', id: '123' };

  await expect(emailService.sendEmail(email)).resolves.toBeUndefined();
});

test('should handle provider failure and fallback', async () => {
  const providerA = new MockProviderA();
  const providerB = new MockProviderB();
  jest.spyOn(providerA, 'sendEmail').mockRejectedValue(new Error('Provider A failed'));
  jest.spyOn(providerB, 'sendEmail').mockResolvedValue();

  const emailService = new EmailService([providerA, providerB]);
  const email = { to: 'test@example.com', subject: 'Hello', body: 'World', id: '123' };

  await expect(emailService.sendEmail(email)).resolves.toBeUndefined();
});


