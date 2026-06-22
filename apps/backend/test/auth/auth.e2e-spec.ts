import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

type RegisterResponseBody = {
  username: string;
  role: 'student' | 'professor' | 'admin';
};

type LoginResponseBody = {
  accessToken: string;
  refreshToken: string;
};

type RefreshResponseBody = {
  accessToken: string;
};

type LogoutResponseBody = {
  success: boolean;
};

type MeResponseBody = {
  username: string;
};

describe('Auth (e2e + vulnerability scenarios)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE refresh_tokens RESTART IDENTITY CASCADE',
    );
    await dataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/register creates student account by default', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'student-user',
        passwordHash: 'password1234',
      });
    const body = response.body as RegisterResponseBody;

    expect(response.status).toBe(201);
    expect(body.username).toBe('student-user');
    expect(body.role).toBe('student');
  });

  it('A07: weak password policy allows very short password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'weak-password-user',
        passwordHash: '1',
      });
    const body = response.body as RegisterResponseBody;

    expect(response.status).toBe(201);
    expect(body.username).toBe('weak-password-user');
  });

  it('A01: register role tampering allows admin account creation', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'escalated-admin',
        passwordHash: 'password1234',
        role: 'admin',
      });
    const body = response.body as RegisterResponseBody;

    expect(response.status).toBe(201);
    expect(body.role).toBe('admin');
  });

  it('POST /api/auth/login returns access/refresh token and sets cookie', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      username: 'login-user',
      passwordHash: 'login-password',
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'login-user',
        passwordHash: 'login-password',
      });
    const body = response.body as LoginResponseBody;

    expect(response.status).toBe(201);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    expect(response.headers['set-cookie']?.[0]).toContain('refreshToken=');
  });

  it('A07: repeated login failures are not rate-limited (no 429)', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      username: 'bruteforce-user',
      passwordHash: 'correct-password',
    });

    for (let i = 0; i < 5; i += 1) {
      const failed = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'bruteforce-user',
          passwordHash: `wrong-password-${i}`,
        });
      expect(failed.status).toBe(401);
    }

    const success = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'bruteforce-user',
        passwordHash: 'correct-password',
      });
    const successBody = success.body as LoginResponseBody;
    expect(success.status).toBe(201);
    expect(successBody.accessToken).toBeDefined();
  });

  it('A04/A07: refresh token can be reused (no rotation)', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      username: 'refresh-user',
      passwordHash: 'refresh-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'refresh-user',
        passwordHash: 'refresh-password',
      });

    const cookie = loginResponse.headers['set-cookie']?.[0];
    expect(cookie).toContain('refreshToken=');
    if (!cookie) {
      throw new Error('refreshToken cookie was not set');
    }

    const refresh1 = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', cookie);
    const refresh2 = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', cookie);
    const refresh1Body = refresh1.body as RefreshResponseBody;
    const refresh2Body = refresh2.body as RefreshResponseBody;

    expect(refresh1.status).toBe(201);
    expect(refresh1Body.accessToken).toBeDefined();
    expect(refresh2.status).toBe(201);
    expect(refresh2Body.accessToken).toBeDefined();
  });

  it('POST /api/auth/logout revokes refresh token', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      username: 'logout-user',
      passwordHash: 'logout-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'logout-user',
        passwordHash: 'logout-password',
      });
    const cookie = loginResponse.headers['set-cookie']?.[0];
    const loginBody = loginResponse.body as LoginResponseBody;
    if (!cookie) {
      throw new Error('refreshToken cookie was not set');
    }
    const accessToken = loginBody.accessToken;

    const logout = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie);
    const logoutBody = logout.body as LogoutResponseBody;
    expect(logout.status).toBe(201);
    expect(logoutBody.success).toBe(true);

    const refreshAfterLogout = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', cookie);
    expect(refreshAfterLogout.status).toBe(401);
  });

  it('GET /api/auth/me validates access token', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      username: 'me-user',
      passwordHash: 'me-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'me-user',
        passwordHash: 'me-password',
      });
    const loginBody = loginResponse.body as LoginResponseBody;

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginBody.accessToken}`);
    const meBody = me.body as MeResponseBody;
    expect(me.status).toBe(200);
    expect(meBody.username).toBe('me-user');

    const invalid = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(invalid.status).toBe(401);
  });
});
