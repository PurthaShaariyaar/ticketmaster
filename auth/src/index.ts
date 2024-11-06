import { app } from './app';

const PORT = 4000;

const start = async () => {
  console.log('Auth service is running...');
};

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});

start();
