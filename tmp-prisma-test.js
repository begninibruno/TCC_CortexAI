process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
try {
  p.cadastro.findFirst({ where: { OR: [{ identificador: '123' }, { email: undefined }] } });
} catch (e) {
  console.error('ERR', e.message);
}
