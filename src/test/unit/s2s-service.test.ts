import axios from 'axios';
import config from 'config';
import S2SService from '../../main/services/s2s-service';
import Logger from '../../main/utils/logger';

jest.mock('axios');

describe('S2S token requests', () => {
  const service = S2SService.getInstance();
  const post = jest.mocked(axios.post);
  let secret: string;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(59000));
    secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
    jest.spyOn(config, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 's2s.url': return 'http://service-auth-provider-api';
        case 's2s.secret': return secret;
        case 's2s.microserviceName': return 'wa_task_monitor';
        default: throw new Error(`Unexpected config key: ${key}`);
      }
    });
    jest.spyOn(Logger.prototype, 'console').mockImplementation(() => undefined);
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exited');
    });
    post.mockResolvedValue({data: 'service-token'});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('posts the six-digit RFC 6238 SHA-1 token and returns the lease', async () => {
    await expect(service.requestServiceToken()).resolves.toBe('service-token');
    expect(post).toHaveBeenCalledWith('http://service-auth-provider-api/lease', {
      microservice: 'wa_task_monitor',
      oneTimePassword: '287082',
    });
  });

  it('generates the expected token for a secret meeting the 16-byte minimum', async () => {
    secret = 'AAAAAAAAAAAAAAAAAAAAAAAAAA';
    await expect(service.requestServiceToken()).resolves.toBe('service-token');
    expect(post).toHaveBeenCalledWith('http://service-auth-provider-api/lease', {
      microservice: 'wa_task_monitor',
      oneTimePassword: '812658',
    });
  });

  it('uses the current 30-second time step and preserves leading zeroes', async () => {
    jest.setSystemTime(new Date(1111111109000));
    await service.requestServiceToken();
    expect(post).toHaveBeenCalledWith('http://service-auth-provider-api/lease', {
      microservice: 'wa_task_monitor',
      oneTimePassword: '081804',
    });
  });

  it('prefixes the lease with Bearer for outgoing calls', async () => {
    await expect(service.getServiceToken()).resolves.toBe('Bearer service-token');
  });

  it('exits with failure when the lease request is rejected', async () => {
    post.mockRejectedValue(new Error('Service unavailable'));
    await expect(service.requestServiceToken()).rejects.toThrow('Process exited');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it.each(['INVALID!BASE32', 'AAAAAAAA', ''])('exits without requesting a lease for invalid secret %j', async value => {
    secret = value;
    await expect(service.requestServiceToken()).rejects.toThrow('Process exited');
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(post).not.toHaveBeenCalled();
  });
});
