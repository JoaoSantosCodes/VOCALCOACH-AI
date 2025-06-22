import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logError } from './logger';

// Configuração da estratégia local (email/senha)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email: string, password: string, done: any) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return done(null, false, { message: 'Email ou senha incorretos' });
    }

    // Verificar se a senha existe antes de comparar
    if (!user.password) {
      return done(null, false, { message: 'Email ou senha incorretos' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return done(null, false, { message: 'Email ou senha incorretos' });
    }

    return done(null, user);
  } catch (error) {
    return done(error as Error, false);
  }
}));

// Configuração da estratégia JWT
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
}, async (payload: any, done: any) => {
  try {
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error as Error, false);
  }
}));

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error as Error, false);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 'google.id': profile.id });

    if (!user) {
      // Create new user
      user = new User({
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        google: {
          id: profile.id,
          accessToken,
          refreshToken
        }
      });
    } else {
      // Update existing user's Google info
      if (!user.google) {
        user.google = {
          id: profile.id,
          accessToken,
          refreshToken
        };
      } else {
        user.google.accessToken = accessToken;
        user.google.refreshToken = refreshToken;
      }
    }

    await user.save();
    return done(null, user);
  } catch (error) {
    logError('Google Auth Error', error as Error);
    return done(error as Error, false);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || '',
  clientSecret: process.env.FACEBOOK_APP_SECRET || '',
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 'facebook.id': profile.id });

    if (!user) {
      // Create new user
      user = new User({
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        facebook: {
          id: profile.id,
          accessToken,
          refreshToken
        }
      });
    } else {
      // Update existing user's Facebook info
      if (!user.facebook) {
        user.facebook = {
          id: profile.id,
          accessToken,
          refreshToken
        };
      } else {
        user.facebook.accessToken = accessToken;
        user.facebook.refreshToken = refreshToken;
      }
    }

    await user.save();
    return done(null, user);
  } catch (error) {
    logError('Facebook Auth Error', error as Error);
    return done(error as Error, false);
  }
}));

// Apple Strategy
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID || '',
  teamID: process.env.APPLE_TEAM_ID || '',
  keyID: process.env.APPLE_KEY_ID || '',
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH || '',
  callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:3000/auth/apple/callback',
  passReqToCallback: true
}, async (req: any, accessToken: string, refreshToken: string, idToken: string, profile: any, done: any) => {
  try {
    let user = await User.findOne({ 'apple.id': profile.id });

    if (!user) {
      // Create new user
      user = new User({
        email: profile.email,
        name: profile.name?.firstName + ' ' + profile.name?.lastName,
        apple: {
          id: profile.id,
          accessToken,
          refreshToken
        }
      });
    } else {
      // Update existing user's Apple info
      if (!user.apple) {
        user.apple = {
          id: profile.id,
          accessToken,
          refreshToken
        };
      } else {
        user.apple.accessToken = accessToken;
        user.apple.refreshToken = refreshToken;
      }
    }

    await user.save();
    return done(null, user);
  } catch (error) {
    logError('Apple Auth Error', error as Error);
    return done(error as Error, false);
  }
}));

export default passport; 