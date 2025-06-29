
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), 'db', 'db_unificado.json');
  
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    if (req.method === 'GET') {
      res.status(200).json(data.usuarios);
    } else if (req.method === 'POST') {
      const newUser = req.body;
      data.usuarios.push(newUser);
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      res.status(201).json(newUser);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
}
