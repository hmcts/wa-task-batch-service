import nock from 'nock';
import {JobName} from '../../main/model/job-names';

const exitMock = jest.fn();
const configGetMock = jest.fn();
const otpMock = jest.fn();

type TaskMonitorServiceType = typeof import('../../main/services/task-monitor-service').TaskMonitorService;
type S2SServiceType = typeof import('../../main/services/s2s-service').default;

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

describe('TaskMonitorService (service-level)', () => {
  const s2sBaseUrl = 'http://s2s.local';
  const taskMonitorBaseUrl = 'http://task-monitor.local';

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
      'job.name': JobName.TERMINATION,
      'services.taskMonitor.url': taskMonitorBaseUrl,
      's2s.url': s2sBaseUrl,
      's2s.secret': 'totp-secret',
      's2s.microserviceName': 'wa_task_batch_service',
    };

    configGetMock.mockImplementation((key: string) => configValues[key]);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  function loadServices(): {S2SService: S2SServiceType; TaskMonitorService: TaskMonitorServiceType} {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const S2SService = require('../../main/services/s2s-service').default as S2SServiceType;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const TaskMonitorService = require('../../main/services/task-monitor-service').TaskMonitorService as TaskMonitorServiceType;
    return {S2SService, TaskMonitorService};
  }

  it('creates a task monitor job with the S2S token attached', async () => {
    const bearerToken = 'Bearer jwt-token';
    otpMock.mockReturnValue('totp');

    const s2sScope = nock(s2sBaseUrl)
      .post('/lease', {
        microservice: 'wa_task_batch_service',
        oneTimePassword: 'totp',
      })
      .reply(200, 'jwt-token');

    const tmScope = nock(taskMonitorBaseUrl)
      .post('/monitor/tasks/jobs', {
        job_details: {name: JobName.TERMINATION},
      })
      .matchHeader('ServiceAuthorization', bearerToken)
      .reply(200, {job_details: {name: JobName.TERMINATION}});

    const {TaskMonitorService} = loadServices();
    const service = new TaskMonitorService();

    await expect(service.createJob()).resolves.not.toThrow();

    expect(s2sScope.isDone()).toBe(true);
    expect(tmScope.isDone()).toBe(true);
    expect(exitMock).not.toHaveBeenCalled();
  });

  it('exits when S2S token retrieval fails and does not call task monitor', async () => {
    otpMock.mockReturnValue('totp');

    const s2sScope = nock(s2sBaseUrl)
      .post('/lease')
      .reply(500);

    const tmScope = nock(taskMonitorBaseUrl)
      .post('/monitor/tasks/jobs')
      .reply(200, {});

    const {TaskMonitorService} = loadServices();
    const service = new TaskMonitorService();

    await expect(service.createJob()).rejects.toThrow('exit 1');

    expect(exitMock).toHaveBeenCalledWith(1);
    expect(s2sScope.isDone()).toBe(true);
    expect(tmScope.isDone()).toBe(false);
  });

  it('exits when task monitor returns an error', async () => {
    otpMock.mockReturnValue('totp');

    nock(s2sBaseUrl)
      .post('/lease')
      .reply(200, 'jwt-token');

    const tmScope = nock(taskMonitorBaseUrl)
      .post('/monitor/tasks/jobs')
      .reply(500);

    const {TaskMonitorService} = loadServices();
    const service = new TaskMonitorService();

    await expect(service.createJob()).rejects.toThrow('exit 1');

    expect(exitMock).toHaveBeenCalledWith(1);
    expect(tmScope.isDone()).toBe(true);
  });

  describe('S2S service behavior', () => {
    it('requests a service token with OTP and wraps it as Bearer', async () => {
      otpMock.mockReturnValue('totp-otp');
      const s2sScope = nock(s2sBaseUrl)
        .post('/lease', {
          microservice: 'wa_task_batch_service',
          oneTimePassword: 'totp-otp',
        })
        .reply(200, 'jwt-token');

      const {S2SService} = loadServices();
      const token = await S2SService.getInstance().getServiceToken();

      expect(token).toBe('Bearer jwt-token');
      expect(s2sScope.isDone()).toBe(true);
      expect(exitMock).not.toHaveBeenCalled();
    });

    it('exits when S2S service token call errors', async () => {
      otpMock.mockReturnValue('totp-otp');
      const s2sScope = nock(s2sBaseUrl)
        .post('/lease')
        .reply(500);

      const {S2SService} = loadServices();

      await expect(S2SService.getInstance().getServiceToken()).rejects.toThrow('exit 1');
      expect(exitMock).toHaveBeenCalledWith(1);
      expect(s2sScope.isDone()).toBe(true);
    });
  });
});
