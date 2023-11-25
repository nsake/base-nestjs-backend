function getOsEnvVar(envVarName: string): string {
  return process.env[envVarName];
}

export const configuration = () => {
  const env = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    database: {
      uri: getOsEnvVar('MONGODB_URI'),
    },
    redis: {
      host: getOsEnvVar('REDIS_HOST'),
      port: getOsEnvVar('REDIS_PORT'),
    },
    jwt: {
      secret: getOsEnvVar('JWT_SECRET_KEY'),
      expiresIn: getOsEnvVar('JWT_EXPIRATION_TIME'),
    },
  };

  console.log(env);

  return env;
};
