const request = require('supertest');
const { app, server } = require('./index');
const { db } = require('./db');

jest.mock('./db', () => {
    return {
        db: {
            all: jest.fn(),
            get: jest.fn(),
            run: jest.fn(),
        },
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    server.close();
});

describe('GET /movies', () => {
    it('should return 500 if error', async () => {
        db.all.mockImplementation((query, params, callback) => {
            callback(new Error('Error'), null);
        });
        const response = await request(app).get('/movies');
        expect(response.status).toBe(500);
    });

    it('should return 204 if no movies found', async () => {
        db.all.mockImplementation((query, params, callback) => {
            callback(null, []);
        });
        const response = await request(app).get('/movies');
        expect(response.status).toBe(204);
    });

    it('should return movies if available', async () => {
        db.all.mockImplementation((query, params, callback) => {
            callback(null, [
                {
                    id: 1,
                    title: 'Inception',
                    director: 'Christopher Nolan',
                    year: 2010,
                    rating: 5,
                },
                {
                    id: 2,
                    title: 'Interstellar',
                    director: 'Christopher Nolan',
                    year: 2014,
                    rating: 4,
                },
            ]);
        });
        const response = await request(app).get('/movies');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
});

describe('GET /movies/:movieId', () => {
    it('should return 500 if error', async () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(new Error('Error'), null);
        });
        const response = await request(app).get('/movies/1');
        expect(response.status).toBe(500);
    });

    it('should return 404 if movie not found', async () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(null, undefined);
        });
        const response = await request(app).get('/movies/1');
        expect(response.status).toBe(404);
    });

    it('should return movie if found', async () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(null, {
                id: 1,
                title: 'Movie 1',
                director: 'Director 1',
                year: 2022,
                rating: 4,
            });
        });
        const response = await request(app).get('/movies/1');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            id: 1,
            title: 'Movie 1',
            director: 'Director 1',
            year: 2022,
            rating: 4,
        });
    });
});

describe('POST /movies', () => {
    it('should return 400 if data is incomplete', async () => {
        const response = await request(app).post('/movies').send({
            title: 'Movie 1',
            director: 'Director 1',
        }); // Envoi de données incomplètes
        expect(response.status).toBe(400);
    });

    it('should return 400 if rating is not between 0 and 5', async () => {
        const response = await request(app).post('/movies').send({
            title: 'Movie 1',
            director: 'Director 1',
            year: 2022,
            rating: 6,
        }); // Envoi d'une note invalide
        expect(response.status).toBe(400);
    });

    it('should return 500 if error', async () => {
        db.run.mockImplementation((query, params, callback) => {
            callback(new Error('Error'));
        });
        const response = await request(app).post('/movies').send({
            title: 'Movie 1',
            director: 'Director 1',
            year: 2022,
            rating: 4,
        });
        expect(response.status).toBe(500);
        expect(response.text).toBe('Error');
    });

    it('should return 201 if movie is created', async () => {
        db.run.mockImplementation((query, params, callback) => {
            callback(null);
        });
        const response = await request(app).post('/movies').send({
            title: 'Movie 1',
            director: 'Director 1',
            year: 2022,
            rating: 4,
        });
        expect(response.status).toBe(201);
        expect(response.text).toBe('Created');
    });
});

describe('DELETE /movies/:movieId', () => {
    it('should return 401 if not authenticated', async () => {
        const response = await request(app).delete('/movies/1');
        expect(response.status).toBe(401);
    });

    it('should return 500 if error', async () => {
        db.run.mockImplementation((query, params, callback) => {
            callback(new Error('Error'));
        });
        await request(app).post('/login').send({
            username: 'admin',
            password: 'admin',
        });
        const response = await request(app).delete('/movies/1');
        expect(response.status).toBe(500);
    });

    it('should return 204 if movie is deleted', async () => {
        await request(app).post('/login').send({
            username: 'admin',
            password: 'admin',
        });

        db.run.mockImplementation((query, params, callback) => {
            callback(null);
        });

        const response = await request(app).delete('/movies/1');
        expect(response.status).toBe(204);
    });
});

describe('POST /login', () => {
    it('should return 200 if logged in successfully', async () => {
        const response = await request(app).post('/login').send({
            username: 'admin',
            password: 'admin',
        });
        expect(response.status).toBe(200);
    });

    it('should return 401 if unauthorized', async () => {
        const response = await request(app).post('/login').send({
            username: 'user',
            password: 'password',
        });
        expect(response.status).toBe(401);
    });
});
