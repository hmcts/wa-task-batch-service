import nock from 'nock';

const configGetMock = jest.fn();
const exitMock = jest.fn();
const otpMock = jest.fn();

jest.mock('config', () => ({
  get: (...args: unknown[]) => configGetMock(...args),
}));

jest.mock('../../main/utils/exit', () => ({
  exit: (...args: unknown[]) => exitMock(...args),
}));

jest.mock('otplib', () => ({
  authenticator: {
    generate: (...args: unknown[]) => otpMock(...args),
  },
}));

describe('S2SService', () => {
  const s2sBaseUrl = 'http://s2s.local';
  const secret = 'totp-secret';
  const microservice = 'wa-task-batch-service';

  beforeEach(() => {
    jest.resetModules();
    nock.cleanAll();
    exitMock.mockReset();
    otpMock.mockReset();
    configGetMock.mockReset();
    exitMock.mockImplementation(() => {
      throw new Error('exit 1');
    });

    const configValues: Record<string, unknown> = {
      's2s.url': s2sBaseUrl,
      's2s.secret': secret,
      's2s.microserviceName': microservice,
    };
    configGetMock.mockImplementation((key: string) => configValues[key]);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  async function loadS2S() {
    const module = await import('../../main/services/s2s-service');
    return module.default;
  }

  it('requests a token with OTP and returns Bearer token', async () => {
    otpMock.mockReturnValue('generated-otp');
    const scope = nock(s2sBaseUrl)
      .post('/lease', {
        microservice,
        oneTimePassword: 'generated-otp',
      })
      .reply(200, 'jwt-token');

    const S2SService = await loadS2S();
    const token = await S2SService.getInstance().getServiceToken();

    expect(scope.isDone()).toBe(true);
    expect(otpMock).toHaveBeenCalledWith(secret);
    expect(token).toBe('Bearer jwt-token');
    expect(exitMock).not.toHaveBeenCalled();
  });

  it('exits with code 1 when the lease call fails', async () => {
    otpMock.mockReturnValue('generated-otp');
    const scope = nock(s2sBaseUrl).post('/lease').reply(500);

    const S2SService = await loadS2S();

    await expect(S2SService.getInstance().getServiceToken()).rejects.toThrow('exit 1');
    expect(scope.isDone()).toBe(true);
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
