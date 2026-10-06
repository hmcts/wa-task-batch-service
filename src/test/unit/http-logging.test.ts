import {getHttpRequestFailureMessage, sanitiseHttpUrl} from '../../main/utils/http-logging';

describe('HTTP logging', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(31000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records actionable Axios timeout details without credentials', () => {
    const error = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded',
      config: {
        method: 'post',
        baseURL: 'https://task-monitor.internal',
        url: '/monitor/tasks/jobs?access_token=should-not-appear',
        timeout: 30000,
        headers: {ServiceAuthorization: 'Bearer should-not-appear'},
      },
    };

    const message = getHttpRequestFailureMessage({
      operation: 'task-monitor-create-job',
      startedAt: 1000,
      error,
    });

    expect(message).toContain('operation=task-monitor-create-job');
    expect(message).toContain('durationMs=30000');
    expect(message).toContain('code=ECONNABORTED');
    expect(message).toContain('url=https://task-monitor.internal/monitor/tasks/jobs');
    expect(message).toContain('timeoutMs=30000');
    expect(message).toContain('responseStatus=none');
    expect(message).not.toContain('should-not-appear');
  });

  it('removes query strings when logging a configured URL', () => {
    expect(sanitiseHttpUrl('https://s2s.internal/lease?secret=not-logged')).toBe('https://s2s.internal/lease');
  });
});
