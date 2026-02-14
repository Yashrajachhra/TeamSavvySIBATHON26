const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('API Health Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
