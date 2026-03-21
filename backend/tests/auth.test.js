const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Set JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret-key';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    req.header.mockReturnValue(undefined);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided, authorization denied'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.header.mockReturnValue('Bearer invalid-token');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token is not valid'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.user and call next() with a valid token', () => {
    const payload = { id: 'user123' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('user123');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', () => {
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '0s' });
    req.header.mockReturnValue(`Bearer ${token}`);

    // Small delay to ensure token expires
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
