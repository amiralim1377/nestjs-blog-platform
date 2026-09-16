import Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.number().required(),
  REDIS_URL: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(2525),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_IGNORE_TLS: Joi.boolean().default(false),
  MAIL_DEFAULT_EMAIL: Joi.string().required(),
  MAIL_DEFAULT_NAME: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  STORAGE_DRIVER: Joi.string().valid('supabase', 'local').default('supabase'),
  SUPABASE_STORAGE_BUCKET: Joi.string().default('blog-assets'),
  UPLOAD_MAX_FILE_SIZE: Joi.number().default(3145728),
  UPLOAD_LOCAL_DESTINATION: Joi.string().default('uploads'),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
});
