const dotenv = require('dotenv');
// Load env vars FIRST
dotenv.config({ override: true });

const connectDB = require('./src/config/db');
const app = require('./src/app');

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
