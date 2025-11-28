const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];

  try {
    if (token.startsWith("gho_")) {
      // 🔑 GitHub OAuth token — don’t verify as JWT
      req.user = { accessToken: token };
      return next();
    }

    // Otherwise, treat it as your own JWT
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.sendStatus(401);

    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};

module.exports = authMiddleware;