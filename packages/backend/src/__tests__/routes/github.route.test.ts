import { createHmac } from 'crypto';
import express from 'express';
import request from 'supertest';
import githubRouter from '../../routes/github.route';
import githubService from '../../services/github.service';
import { mockOpenedPRGithubPayload } from '../mocks/githubData';

jest.mock('../../services/github.service', () => ({
  __esModule: true,
  default: { handleWebhook: jest.fn() },
}));

const app = express();
// Match production ordering: the webhook owns its raw parser.
app.use('/api/github', githubRouter);
app.use(express.json());
app.post('/echo', (req, res) => res.json(req.body));
const secret = 'webhook-test-secret';
const handleWebhook = githubService.handleWebhook as jest.Mock;
const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;
const signature = (body: string) => `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
const send = (body = JSON.stringify(mockOpenedPRGithubPayload), event = 'pull_request', sig = signature(body)) =>
  request(app)
    .post('/api/github')
    .set('Content-Type', 'application/json')
    .set('X-GitHub-Event', event)
    .set('X-GitHub-Delivery', 'test-delivery')
    .set('X-Hub-Signature-256', sig)
    .send(body);

describe('GitHub webhook HTTP security', () => {
  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = secret;
    handleWebhook.mockReset().mockResolvedValue([]);
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
    if (originalSecret === undefined) delete process.env.GITHUB_WEBHOOK_SECRET;
    else process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
  });

  it('verifies exact UTF-8 bytes, including whitespace', async () => {
    const body = JSON.stringify(
      { ...mockOpenedPRGithubPayload, pull_request: { title: '修复 [ABC-2]', merged: false } },
      null,
      2,
    );
    expect((await send(body)).status).toBe(200);
    expect(handleWebhook).toHaveBeenCalledWith(mockOpenedPRGithubPayload.repository.clone_url, 2, 'in_progress');
    expect((await send(`${body} `, 'pull_request', signature(body))).status).toBe(401);
    expect(handleWebhook).toHaveBeenCalledTimes(1);
  });

  it.each(['', 'sha256=bad', `sha256=${'0'.repeat(64)}`, `sha1=${'0'.repeat(40)}`])(
    'rejects invalid signature %s',
    async (sig) => {
      expect((await send(undefined, undefined, sig)).status).toBe(401);
      expect(handleWebhook).not.toHaveBeenCalled();
    },
  );
  it('rejects a missing signature and fails closed without a secret', async () => {
    expect((await request(app).post('/api/github').send(mockOpenedPRGithubPayload)).status).toBe(401);
    delete process.env.GITHUB_WEBHOOK_SECRET;
    expect((await send()).status).toBe(503);
    expect(handleWebhook).not.toHaveBeenCalled();
    expect((await request(app).get('/api/github')).status).toBe(200);
  });
  it('rejects malformed JSON only after checking its signature', async () => {
    expect((await send('{')).status).toBe(400);
    expect((await send('{', 'pull_request', 'bad')).status).toBe(401);
  });
  it('enforces content type, encoding, and body size', async () => {
    expect((await request(app).post('/api/github').type('text').send('{}')).status).toBe(415);
    expect((await send().set('Content-Encoding', 'gzip')).status).toBe(415);
    expect((await send(JSON.stringify({ text: 'x'.repeat(1024 * 1024) }))).status).toBe(413);
    expect(handleWebhook).not.toHaveBeenCalled();
  });
  it.each(['ping', 'push', 'installation'])('acknowledges %s without writes', async (event) => {
    expect((await send('{}', event)).status).toBe(200);
    expect(handleWebhook).not.toHaveBeenCalled();
  });
  it('requires an event header', async () => {
    expect((await send().unset('X-GitHub-Event')).status).toBe(400);
  });
  it.each([
    null,
    [],
    {},
    { action: 'opened' },
    { ...mockOpenedPRGithubPayload, repository: { clone_url: 'not-a-url' } },
    { ...mockOpenedPRGithubPayload, pull_request: { title: '[2]', merged: 'false' } },
  ])('rejects invalid PR payload %j', async (payload) => {
    expect((await send(JSON.stringify(payload))).status).toBe(400);
    expect(handleWebhook).not.toHaveBeenCalled();
  });
  it.each(['No reference', '[0]', '[-2]', '[1.5]', '[1e3]', '[9007199254740992]'])(
    'ignores invalid story reference %s',
    async (title) => {
      const body = { ...mockOpenedPRGithubPayload, pull_request: { title, merged: false } };
      expect((await send(JSON.stringify(body))).status).toBe(200);
      expect(handleWebhook).not.toHaveBeenCalled();
    },
  );
  it('ignores unsupported actions and unmerged closures, but processes merges', async () => {
    expect((await send(JSON.stringify({ action: 'edited' }))).status).toBe(200);
    const closed = { ...mockOpenedPRGithubPayload, action: 'closed' };
    expect((await send(JSON.stringify(closed))).status).toBe(200);
    expect(handleWebhook).not.toHaveBeenCalled();
    closed.pull_request = { ...closed.pull_request, merged: true };
    expect((await send(JSON.stringify(closed))).status).toBe(200);
    expect(handleWebhook).toHaveBeenCalledWith(closed.repository.clone_url, 2, 'done');
  });
  it('waits for the transaction and reports database failures', async () => {
    let rejectTransaction!: (error: Error) => void;
    let transactionStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      transactionStarted = resolve;
    });
    handleWebhook.mockImplementation(() => {
      transactionStarted();
      return new Promise((resolve, reject) => {
        rejectTransaction = reject;
      });
    });
    let responded = false;
    const response = send().then((result) => {
      responded = true;
      return result;
    });
    await started;
    expect(responded).toBe(false);
    rejectTransaction(new Error('Database unavailable'));
    expect((await response).status).toBe(500);
  });
  it('preserves ordinary JSON parsing for other APIs', async () => {
    expect((await request(app).post('/echo').send({ test: true })).body).toEqual({ test: true });
  });
});
