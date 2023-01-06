import { TaskMonitorService } from '../../main/services/task-monitor-service';
import { setupServer }  from 'msw/node';
import { rest } from 'msw';

const s2sUrl = 'http://service-auth-provider-api/lease';
const tmUrl = 'http://localhost/WA_TASK_MONITOR_SERVICE_URL/monitor/tasks/jobs';


describe('create job', () => {
  const realProcessExit = process.exit;
  process.exit = jest.fn(() => { throw 'mockExit'; });
  afterAll(() => { 
    process.exit = realProcessExit; 
  });
  describe ('unhappy day s2s fails', () => {
    it('it fails to creates a job', async () => {
      try {
        const tm = new TaskMonitorService();
        await tm.createJob();
        fail('should call process.exit(1)');
      }
      catch(error:unknown){
        expect(error).toEqual('mockExit');
        expect(process.exit).toBeCalledWith(1);        
      }             
    });
  });
   
  describe ('unhappy day taskmonitor fails', () => {
    const handlers = [
      rest.post(s2sUrl, (req, res, ctx) => {
        return res(ctx.json({ data: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3YV90YXNrX21vbml0b3IiLCJleHAiOjE2NzE0NzA0MTh9.jCkNjnDYv5apkVnwjsp2mtIvHoxz36STalgWImOadE3xv-o8dpQl6qCCWOwUuHjZZsn99_1qRh0xGHNJ5UtAeA' }));
      }), 
    ]; 
    const server = setupServer(...handlers);
    beforeAll(() => {
      server.listen();
    });
    afterAll(() => {
      server.close();      
    });
    it('it fails to creates a job', async () => {
      try {
        const tm = new TaskMonitorService();
        await tm.createJob();
        fail('should call process.exit(1)');
      }
      catch(error:unknown){
        expect(error).toEqual('mockExit');
        expect(process.exit).toBeCalledWith(1);        
      }             
    });
  });
  
  describe ('happy day', () => {
    const handlers = [
      rest.post(s2sUrl, (_, res, ctx) => {
        return res(ctx.json({ data: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3YV90YXNrX21vbml0b3IiLCJleHAiOjE2NzE0NzA0MTh9.jCkNjnDYv5apkVnwjsp2mtIvHoxz36STalgWImOadE3xv-o8dpQl6qCCWOwUuHjZZsn99_1qRh0xGHNJ5UtAeA' }));
      }),
      rest.post(tmUrl, (_, res, ctx) => {
        return res(ctx.json({'job_details':{}}));
      }),  
    ];
        
    const server = setupServer(...handlers);
    beforeAll(() => {
      server.listen();
    });
    afterAll(() => {
      server.close();    
    });

    it('creates a job', async () => {    
      const tm = new TaskMonitorService();
      await expect (tm.createJob()).resolves.not.toThrowError();                      
    });
  });  
});
