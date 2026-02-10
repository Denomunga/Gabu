import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MongoStore from "connect-mongo";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const mongoStoreOptions: Parameters<typeof MongoStore.create>[0] = {
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
  };

  if (process.env.MONGODB_DB) {
    mongoStoreOptions.dbName = process.env.MONGODB_DB;
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r3pl1t_s3cr3t_k3y",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create(mongoStoreOptions),
    cookie: {
      secure: app.get("env") === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware: accept JWT Bearer tokens and attach user to req.user
  app.use(async (req: any, _res: any, next: any) => {
    try {
      const auth = req.headers?.authorization || req.get?.("Authorization");
      if (auth && typeof auth === "string" && auth.startsWith("Bearer ")) {
        const token = auth.split(" ")[1];
        try {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev_secret");
          if (decoded?.id) {
            const user = await storage.getUser(decoded.id);
            if (user) req.user = user;
          }
        } catch (err) {
          // invalid token, ignore
        }
      }
    } catch (e) {
      // ignore middleware errors
    }
    next();
  });

  // Use email as the username field for authentication
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await (storage as any).getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role: "user" // Default role
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const token = jwt.sign({ id: user.id, role: (user as any).role }, process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev_secret", { expiresIn: "30d" });
        res.status(201).json({ token, user });
      });
    } catch (err) {
      next(err);
    }
  });

  // alias for client endpoint
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role: "user"
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const token = jwt.sign({ id: user.id, role: (user as any).role }, process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev_secret", { expiresIn: "30d" });
        res.status(201).json({ token, user });
      });
    } catch (err) {
      next(err);
    }
  });

  // login that returns JWT and sets session
  app.post("/api/login", (req, res, next) => {
    console.log("[auth] POST /api/login body:", req.body);
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        const token = jwt.sign({ id: user.id, role: (user as any).role }, process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev_secret", { expiresIn: "30d" });
        res.status(200).json({ token, user });
      });
    })(req, res, next);
  });

  // alias endpoints used by the client
  app.post("/api/auth/login", (req, res, next) => {
    console.log("[auth] POST /api/auth/login body:", req.body);
    try {
      console.log("[auth] body keys:", req.body && typeof req.body === 'object' ? Object.keys(req.body) : typeof req.body);
    } catch (e) {}
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        const token = jwt.sign({ id: user.id, role: (user as any).role }, process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev_secret", { expiresIn: "30d" });
        res.status(200).json({ token, user });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      try {
        const sid = (req.session as any)?.id;
        req.session?.destroy((destroyErr) => {
          res.clearCookie((req.session as any)?.cookie?.name || "connect.sid");
          if (destroyErr) return next(destroyErr);
          res.sendStatus(200);
        });
      } catch (e) {
        res.sendStatus(200);
      }
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // client expects this path
  app.get("/api/users/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
