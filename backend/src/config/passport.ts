import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { User } from '../models/User';
import { authConfig } from './auth.config';
import { logError } from './logger';

// Serialização do usuário para a sessão
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialização do usuário da sessão
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logError(error as Error, 'Passport Deserialization Error');
    done(error, null);
  }
});

// Configuração do Google OAuth2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: authConfig.google.clientID,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackURL,
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Verificar se o usuário já existe
        let user = await User.findOne({ 'google.id': profile.id });

        if (user) {
          // Atualizar informações do usuário
          user.google.accessToken = accessToken;
          user.google.refreshToken = refreshToken;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Criar novo usuário
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          google: {
            id: profile.id,
            accessToken,
            refreshToken,
          },
          isEmailVerified: true,
          role: 'user',
          lastLogin: new Date(),
        });

        done(null, user);
      } catch (error) {
        logError(error as Error, 'Google Auth Error');
        done(error, null);
      }
    }
  )
);

// Configuração do Facebook OAuth2.0
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'emails', 'name', 'picture'],
        passReqToCallback: true,
      },
      async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          let user = await User.findOne({ 'facebook.id': profile.id });

          if (user) {
            user.facebook.accessToken = accessToken;
            user.facebook.refreshToken = refreshToken;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            email: profile.emails[0]?.value,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            avatar: profile.photos[0]?.value,
            facebook: {
              id: profile.id,
              accessToken,
              refreshToken,
            },
            isEmailVerified: true,
            role: 'user',
            lastLogin: new Date(),
          });

          done(null, user);
        } catch (error) {
          logError(error as Error, 'Facebook Auth Error');
          done(error, null);
        }
      }
    )
  );
}

// Configuração do Apple OAuth2.0
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
        callbackURL: process.env.APPLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          let user = await User.findOne({ 'apple.id': profile.id });

          if (user) {
            user.apple.accessToken = accessToken;
            user.apple.refreshToken = refreshToken;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            email: profile.email,
            name: profile.name?.firstName + ' ' + profile.name?.lastName,
            apple: {
              id: profile.id,
              accessToken,
              refreshToken,
            },
            isEmailVerified: true,
            role: 'user',
            lastLogin: new Date(),
          });

          done(null, user);
        } catch (error) {
          logError(error as Error, 'Apple Auth Error');
          done(error, null);
        }
      }
    )
  );
}

export default passport; 